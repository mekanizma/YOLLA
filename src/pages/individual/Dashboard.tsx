import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, ChevronRight, User } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { jobCategories, cities, getJobCategories } from '../../lib/utils';
import BadgesSection from '../../components/BadgesSection';
import { fetchPublishedJobsOptimized } from '../../lib/cacheService';
import { getMyApplications, applyToJob } from '../../lib/applicationsService';
import { getUserBadges, checkApplicationBadges, checkProfileCompletionBadges } from '../../lib/badgesService';
import { createNotification } from '../../lib/notificationsService';
import supabase from '../../lib/supabaseClient';
import { useToast } from '../../components/ui/ToastProvider';

const Dashboard = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [displayName, setDisplayName] = useState<string>('');
  
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const [badges, setBadges] = useState<any[]>([]);

  // Profil tamamlama ve eksik alanlar ileride kullanılacak
  // const [profileCompletion, setProfileCompletion] = useState(0);
  // const [missingFields, setMissingFields] = useState<string[]>([]);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log({ searchTerm, selectedCategory, selectedCity });
  };

  const handleApply = async (jobId: string) => {
    try {
      // Kullanıcı giriş kontrolü
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.id) {
        showToast({
          type: 'warning',
          title: t('common:loginRequired'),
          message: t('jobs:loginRequiredMessage')
        });
        navigate('/login/individual');
        return;
      }

      // Zaten başvuru yapılmış mı kontrol et
      if (appliedJobs.has(jobId)) {
        showToast({
          type: 'info',
          title: t('jobs:alreadyApplied'),
          message: t('jobs:alreadyAppliedMessage')
        });
        return;
      }

      // Son başvuru tarihi kontrolü
      const job = recommendedJobs.find(j => j.id === jobId);
      if (job?.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
        showToast({
          type: 'error',
          title: t('jobs:applicationClosed'),
          message: t('jobs:applicationDeadlinePassed')
        });
        return;
      }
      if (!job) {
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'İş ilanı bulunamadı.'
        });
        return;
      }

      // Başvuru yap
      await applyToJob(jobId, auth.user.id, {
        cover_letter: '',
        resume_url: undefined,
        answers: undefined
      });

      // Başvuru yapıldığını işaretle
      setAppliedJobs(prev => new Set(prev).add(jobId));

      // Şirkete bildirim gönder
      try {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('title, company_id')
          .eq('id', jobId)
          .single();

        // Başvuru yapan kullanıcının bilgilerini al
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('auth_user_id', auth.user.id)
          .maybeSingle();

        if (jobData?.company_id && userData) {
          const applicantName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email?.split('@')[0] || t('common:user');
          
          await createNotification({
            company_id: jobData.company_id,
            title: '📝 Yeni Başvuru / New Application',
            message: `👤 ${applicantName} adlı kullanıcı "${jobData.title}" pozisyonu için başvuru yaptı.\n\n📅 Tarih: ${new Date().toLocaleDateString('tr-TR')}\n\n👤 ${applicantName} applied for "${jobData.title}" position.\n\n📅 Date: ${new Date().toLocaleDateString('en-US')}`,
            type: 'application'
          });
        }
      } catch (notificationError) {
        console.warn('Bildirim gönderilemedi:', notificationError);
      }

      showToast({
        type: 'success',
        title: t('jobs:applicationSubmitted'),
        message: t('jobs:applicationSubmittedMessage')
      });
      
    } catch (error: any) {
      console.error('Başvuru hatası:', error);
      showToast({
        type: 'error',
        title: t('jobs:applicationError'),
        message: error.message || t('jobs:applicationErrorMessage')
      });
    } finally {
      // Başvuru işlemi tamamlandığını göster
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  // Filtrelenmiş iş ilanları
  const filteredJobs = recommendedJobs.filter(job => {
    const matchesSearch = searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || (job.category && job.category === selectedCategory);
    const matchesCity = selectedCity === '' || job.location.includes(selectedCity);
    return matchesSearch && matchesCategory && matchesCity;
  });

  useEffect(() => {
    const load = async () => {
      try {
        // Paralel veri yükleme (cache ile optimize edildi)
        const [authData, jobsData] = await Promise.all([
          supabase.auth.getUser(),
          fetchPublishedJobsOptimized()
        ]);

        const user = authData.data.user;
        if (user) {
          const meta: any = user.user_metadata || {};
          const fullName: string = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim();
          setDisplayName(fullName || (user.email ? user.email.split('@')[0] : ''));

          // Kullanıcının mevcut başvurularını yükle
          try {
            const { data: applications } = await supabase
              .from('applications')
              .select('job_id')
              .eq('user_id', user.id);
            
            if (applications) {
              const appliedJobIds = new Set(applications.map(app => app.job_id));
              setAppliedJobs(appliedJobIds);
            }
          } catch (error) {
            console.warn('Başvuru durumu yüklenemedi:', error);
          }
        }
        // Önerilen işler (şimdilik son yayınlanan 6 ilan)
        const jobs = jobsData;
        const mappedJobs = jobs.slice(0, 6).map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.companies?.name || 'Şirket',
          location: j.location,
          type: j.type,
          salary: j.salary ? `${j.salary.min} - ${j.salary.max} ${j.salary.currency}` : '',
          postedDate: new Date(j.created_at).toLocaleDateString('tr-TR'),
          logo: j.companies?.logo || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          category: j.department || '',
          companyIndustry: j.companies?.industry || '',
          companyLocation: j.companies?.location || '',
          companyWebsite: j.companies?.website || '',
          companyPhone: j.companies?.phone || '',
          companyEmail: j.companies?.email || ''
        }));
        setRecommendedJobs(mappedJobs);

        // Son başvurular
        if (user?.id) {
          const apps = await getMyApplications(user.id);
          const mappedApps = apps.slice(0, 5).map((a: any) => {
            // Status'u çeviri sistemi ile çevir
            const statusMap: { [key: string]: { text: string; color: string } } = {
              'pending': { text: t('dashboard:pending'), color: 'bg-yellow-100 text-yellow-800' },
              'in_review': { text: t('dashboard:inReview'), color: 'bg-blue-100 text-blue-800' },
              'accepted': { text: t('dashboard:accepted'), color: 'bg-green-100 text-green-800' },
              'rejected': { text: t('dashboard:rejected'), color: 'bg-red-100 text-red-800' },
              'approved': { text: t('dashboard:approved'), color: 'bg-green-100 text-green-800' }
            };
            
            const statusInfo = statusMap[a.status] || { text: a.status, color: 'bg-gray-100 text-gray-800' };
            
            return {
              id: a.id,
              jobTitle: a.jobs?.title || 'İş İlanı',
              company: a.jobs?.companies?.name || 'Şirket',
              status: statusInfo.text,
              appliedDate: new Date(a.created_at).toLocaleDateString('tr-TR'),
              statusColor: statusInfo.color
            };
          });
          setRecentApplications(mappedApps);
        }

        // Rozetler/profil tamamlanma (gerçek verilerle)
        if (user?.id) {
          try {
            // Başvuru sayısına göre rozet kontrolü
            await checkApplicationBadges(user.id);
            
            // Profil tamamlanma oranını hesapla (basit hesaplama)
            const { data: profileData } = await supabase
              .from('users')
              .select('about, skills, languages, experiences, educations, phone, location, title')
              .eq('user_id', user.id)
              .single();
            
            let completionPercent = 0;
            if (profileData) {
              const fields = [
                profileData.about,
                profileData.phone,
                profileData.location,
                profileData.title,
                profileData.skills?.length > 0,
                profileData.languages?.length > 0,
                profileData.experiences?.length > 0,
                profileData.educations?.length > 0
              ];
              const filledFields = fields.filter(field => field).length;
              completionPercent = Math.round((filledFields / fields.length) * 100);
            }
            
            // Profil tamamlanma rozetlerini kontrol et
            await checkProfileCompletionBadges(user.id, completionPercent);
            
            // Kullanıcının rozetlerini getir
            const userBadges = await getUserBadges(user.id);
            const mappedBadges = userBadges.map((ub: any) => ({
              id: ub.badge.id,
              icon: ub.badge.icon,
              title: ub.badge.name,
              desc: ub.badge.description
            }));
            setBadges(mappedBadges);
          } catch (e) {
            console.warn('Rozet yükleme hatası:', e);
            setBadges([]);
          }
        } else {
          setBadges([]);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      
      <main className="flex-1 pt-16">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-10 rounded-b-3xl shadow-lg mb-6">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fadeIn">{t('common:welcomeMessage')}{displayName ? `, ${displayName}` : ''}!</h1>
            <p className="text-white/90 text-lg max-w-xl mx-auto animate-fadeIn delay-100">{t('common:welcomeSubtitle')}</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recommended Jobs + Badges + Profile Completion */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Search & Filters */}
              <section className="mb-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center bg-white rounded-2xl shadow p-4">
                  <input
                    type="text"
                    placeholder={t('common:searchJobsPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                  >
                    <option value="">{t('dashboard:category')}</option>
                    {getJobCategories(t).map((cat, i) => (
                      <option key={i} value={jobCategories[i]}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                  >
                    <option value="">{t('dashboard:city')}</option>
                    {cities.map((city, i) => (
                      <option key={i} value={city}>{city}</option>
                    ))}
                  </select>
                  <Button type="submit" className="px-6 py-2">{t('common:searchJobs')}</Button>
                </form>
              </section>
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInUp">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t('dashboard:recommendedJobs')}</h2>
                  <Link to="/individual/jobs" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                    {t('common:viewAll')} <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="group border border-gray-100 rounded-xl p-5 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer flex gap-4 items-center"
                      onClick={() => navigate(`/individual/jobs?jobId=${job.id}`)}
                      title={`${job.company} - ${job.title} - ${job.location}`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20 group-hover:scale-105 transition-transform duration-200">
                        <img 
                          src={job.logo} 
                          alt={`${job.company} logo`}
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{job.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{job.company}</p>
                          {job.companyIndustry && (
                            <p className="text-gray-500 text-xs truncate">🏢 {job.companyIndustry}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            <MapPin size={14} className="mr-1" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="font-medium text-primary text-base">{job.salary}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock size={14} className="mr-1" />
                            {job.postedDate}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          {(() => {
                            // Son başvuru tarihi kontrolü
                            const isDeadlinePassed = job.applicationDeadline && 
                              new Date(job.applicationDeadline) < new Date();
                            
                            if (isDeadlinePassed) {
                              return (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                  className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200"
                                >
                                  <span>🚫 {t('jobs:applicationClosed')}</span>
                                </Button>
                              );
                            }
                            
                            if (appliedJobs.has(job.id)) {
                              return (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                  className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                                >
                                  <span>{t('dashboard:applicationSubmitted')}</span>
                                </Button>
                              );
                            }
                            
                            return (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApply(job.id);
                                }}
                                disabled={applyingJobs.has(job.id)}
                                className="flex items-center gap-1 hover:bg-blue-600 transition-colors duration-200"
                              >
                                {applyingJobs.has(job.id) ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t('dashboard:applying')}</span>
                                  </>
                                ) : (
                                  <span>{t('dashboard:apply')}</span>
                                )}
                              </Button>
                            );
                          })()}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/individual/jobs?jobId=${job.id}`);
                            }}
                          >
                            {t('dashboard:viewDetails')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <BadgesSection badges={badges} />
            </div>
            
            {/* Sidebar: Recent Applications & Quick Links */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInUp">
                <h2 className="text-xl font-bold mb-4">{t('dashboard:quickAccess')}</h2>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    to="/individual/profile"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    {t('dashboard:profile')}
                  </Link>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInUp">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{t('dashboard:myRecentApplications')}</h2>
                  <Link to="/individual/applications" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                    {t('common:viewAll')} <ChevronRight size={16} />
                  </Link>
                </div>
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${application.statusColor}`}>{application.status}</span>
                          <span className="text-sm text-gray-500">{application.appliedDate}</span>
                        </div>
                        <h3 className="font-semibold text-base truncate">{application.jobTitle}</h3>
                        <p className="text-gray-600 text-sm truncate">{application.company}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 flex flex-col items-center">
                    <img src="/empty-application.svg" alt={t('common:noApplications')} className="w-24 h-24 mb-4 opacity-80" />
                    <p className="text-gray-500 mb-2">{t('dashboard:noApplicationsYet')}</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => {/* Navigate to jobs */}}
                    >
                      {t('dashboard:exploreJobs')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;