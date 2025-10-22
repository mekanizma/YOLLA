import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { jobCategories, workTypes, updateMetaTags, pageSEOContent, getJobCategories } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPublishedJobsOptimized } from '../../lib/cacheService';
import { applyToJob } from '../../lib/applicationsService';
import { createNotification } from '../../lib/notificationsService';
import supabase from '../../lib/supabaseClient';
import { useToast } from '../../components/ui/ToastProvider';

const Jobs = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [workType, setWorkType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [expandedBenefits, setExpandedBenefits] = useState<number | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || '';
  const initialCity = queryParams.get('city') || '';
  const initialPage = parseInt(queryParams.get('page') || '1');
  const initialJobId = queryParams.get('jobId') || '';

  useEffect(() => {
    // URL'den sayfa numarasını al
    setCurrentPage(initialPage);
    
    // Sayfa SEO meta etiketlerini güncelle
    const { title, description, keywords } = pageSEOContent.jobs;
    updateMetaTags(
      title,
      description,
      keywords,
      undefined,
      `https://www.isbul.com.tr${location.pathname}${location.search}`
    );
  }, [location, initialPage]);

  // Belirli bir ilan ID'si varsa ve işler yüklendiyse, o ilanın bulunduğu sayfaya git
  useEffect(() => {
    if (initialJobId && jobs.length > 0) {
      const jobIndex = jobs.findIndex(job => job.id.toString() === initialJobId);
      if (jobIndex !== -1) {
        const targetPage = Math.floor(jobIndex / jobsPerPage) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
          // URL'yi güncelle
          const newParams = new URLSearchParams(location.search);
          newParams.set('page', targetPage.toString());
          navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
        }
      }
    }
  }, [initialJobId, jobs, currentPage, jobsPerPage, location, navigate]);

  // Paralel veri yükleme - hem işler hem başvurular
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Paralel veri yükleme (cache ile optimize edildi)
        const [jobsData, authData] = await Promise.all([
          fetchPublishedJobsOptimized({ search: initialSearchTerm, city: initialCity }),
          supabase.auth.getUser()
        ]);

        // Jobs verilerini işle
        const mapped = jobsData.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.companies?.name || 'Şirket',
          location: j.location,
          type: j.type,
          experience: j.experience_level,
          salary: j.salary ? `${j.salary.min} - ${j.salary.max} ${j.salary.currency}` : '',
          description: j.description,
          requirements: j.skills || [],
          postedDate: new Date(j.created_at).toLocaleDateString('tr-TR'),
          logo: j.companies?.logo || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          category: j.department || '',
          // Ek bilgiler
          companyIndustry: j.companies?.industry || '',
          companyLocation: j.companies?.location || '',
          companyWebsite: j.companies?.website || '',
          companyPhone: j.companies?.phone || '',
          companyEmail: j.companies?.email || '',
          benefits: j.benefits || [],
          applicationDeadline: j.application_deadline,
          isRemote: j.is_remote,
          educationLevel: j.education_level,
          responsibilities: j.responsibilities || '',
          workStartTime: j.work_start_time,
          workEndTime: j.work_end_time,
          workDays: j.work_days || [],
        }));
        setJobs(mapped);

        // Kullanıcı başvurularını yükle
        if (authData.data.user?.id) {
          try {
            const { data: applications } = await supabase
              .from('applications')
              .select('job_id')
              .eq('user_id', authData.data.user.id);
            
            if (applications) {
              const appliedJobIds = new Set(applications.map(app => app.job_id));
              setAppliedJobs(appliedJobIds);
            }
          } catch (error) {
            console.warn('Başvuru durumu yüklenemedi:', error);
          }
        }
      } catch (e: any) {
        setError(e.message || 'Veri alınamadı');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm, initialCity]);

  // Filtrelenmiş iş ilanları - useMemo ile optimize edildi
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || (job.category && job.category === selectedCategory);
      const matchesWorkType = workType === '' || job.type === workType;
      return matchesSearch && matchesCategory && matchesWorkType;
    });
  }, [jobs, searchTerm, selectedCategory, workType]);

  // Belirli bir ilan ID'si varsa o ilanı öne çıkar
  const sortedJobs = initialJobId 
    ? [...filteredJobs].sort((a, b) => {
        if (a.id.toString() === initialJobId) return -1;
        if (b.id.toString() === initialJobId) return 1;
        return 0;
      })
    : filteredJobs;

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, endIndex);

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // URL'yi güncelle
      const newParams = new URLSearchParams(location.search);
      newParams.set('page', page.toString());
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
      
      // Sayfanın üstüne kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama yapıldığında ilk sayfaya dön
    setCurrentPage(1);
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', '1');
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleApply = async (jobId: string) => {
    try {
      console.log('handleApply başladı, jobId:', jobId);
      
      // Kullanıcı giriş kontrolü
      const { data: auth } = await supabase.auth.getUser();
      console.log('Auth kullanıcı:', auth.user);
      
      if (!auth.user?.id) {
        showToast({
          type: 'warning',
          title: t('jobs:loginRequired'),
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

      // Başvuru işlemi başlatıldığını göster
      setApplyingJobs(prev => new Set(prev).add(jobId));

      // İş bilgilerini al
      const job = jobs.find(j => j.id === jobId);
      console.log('Bulunan iş:', job);
      
      if (!job) {
        showToast({
          type: 'error',
          title: t('common:error'),
          message: t('jobs:jobNotFound')
        });
        return;
      }

      console.log('Başvuru yapılıyor...');
      // Başvuru yap
      await applyToJob(jobId, auth.user.id, {
        cover_letter: '', // İleride özelleştirilebilir
        resume_url: undefined,
        answers: undefined
      });
      console.log('Başvuru tamamlandı');

      // Başvuru yapıldığını işaretle
      setAppliedJobs(prev => new Set(prev).add(jobId));

      // Şirkete bildirim gönder
      try {
        console.log('=== BİLDİRİM SÜRECİ BAŞLADI ===');
        console.log('Başvuru yapılan jobId:', jobId);
        console.log('Kullanıcı ID:', auth.user.id);
        
        const { data: jobData } = await supabase
          .from('jobs')
          .select('title, company_id')
          .eq('id', jobId)
          .single();

        console.log('İş verisi:', jobData);

        // Başvuru yapan kullanıcının bilgilerini al
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('user_id', auth.user.id)
          .single();

        console.log('Kullanıcı verisi:', userData);

        if (jobData?.company_id && userData) {
          const applicantName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email?.split('@')[0] || 'Kullanıcı';
          
          console.log('=== BİLDİRİM OLUŞTURULUYOR ===');
          console.log('Bildirim parametreleri:', {
            company_id: jobData.company_id,
            title: 'Yeni Başvuru',
            message: `${applicantName} ${t('common:applicationMessage').replace('""', `"${jobData.title}"`)}`,
            type: 'application',
            data: { job_id: jobId, application_id: jobId }
          });
          
          const notificationResult = await createNotification({
            company_id: jobData.company_id,
            title: 'Yeni Başvuru',
            message: `${applicantName} ${t('common:applicationMessage').replace('""', `"${jobData.title}"`)}`,
            type: 'application',
            data: { job_id: jobId, application_id: jobId }
          });
          console.log('=== BİLDİRİM OLUŞTURMA SONUCU ===');
          console.log('Bildirim oluşturma sonucu:', notificationResult);
          
          console.log('Bildirim başarıyla gönderildi!');
        } else {
          console.log('=== BİLDİRİM GÖNDERİLEMEDİ ===');
          console.log('Eksik veri:', { 
            jobData: jobData, 
            userData: userData,
            jobDataCompanyId: jobData?.company_id,
            userDataExists: !!userData
          });
        }
      } catch (notificationError) {
        console.error('=== BİLDİRİM HATASI ===');
        console.error('Bildirim gönderilemedi:', notificationError);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      
      <main className="flex-1 pt-16">
        {/* Search & Filters Section */}
        <section className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <form onSubmit={handleSearch} className="space-y-4 mb-4">
              {/* Arama çubuğu ve butonu */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={t('jobs:searchPlaceholder')}
                    className="pl-10 pr-3 py-3 w-full rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Search size={20} /> {t('jobs:search')}
                </Button>
              </div>
              
              {/* Filtreler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">{t('jobs:jobCategory')}</option>
                    {getJobCategories(t).map((cat, i) => (
                      <option key={i} value={jobCategories[i]}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  >
                    <option value="">{t('jobs:workType')}</option>
                    {workTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>
        </section>
        
        {/* Job Listings */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-gray-600 text-sm">
              {loading ? t('jobs:loading') : `${filteredJobs.length} ${t('jobs:jobsFound')}`}
              {totalPages > 1 && (
                <span className="ml-2 text-gray-500">
                  ({t('jobs:page')} {currentPage} {t('jobs:of')} {totalPages})
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} {t('jobs:showingRange')}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {loading ? (
              // Skeleton Loading
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              currentJobs.map((job) => (
              <div 
                key={job.id} 
                className={`bg-white rounded-xl shadow-sm border p-4 md:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group ${
                  initialJobId && job.id.toString() === initialJobId 
                    ? 'border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4 relative">
                  {initialJobId && job.id.toString() === initialJobId && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg z-10">
                      ⭐ Önerilen İlan
                    </div>
                  )}
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <div>
                        <h3 className="text-lg font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{job.title}</h3>
                        <div className="text-gray-600 mb-2 font-medium">{job.company}</div>
                        
                        {/* Detaylı Bilgiler */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-500 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-blue-500" /> 
                            <span className="font-medium">{t('jobs:location')}:</span>
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-green-500" /> 
                            <span className="font-medium">{t('jobs:published')}:</span>
                            <span>{job.postedDate}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 font-semibold">💰 {t('jobs:salary')}:</span>
                              <span className="text-green-600 font-semibold">{job.salary}</span>
                            </div>
                          )}
                          {job.category && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{t('jobs:sector')}:</span>
                              <span>{job.category}</span>
                            </div>
                          )}
                          {(job.workStartTime || job.workEndTime) && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-orange-500" />
                              <span className="font-medium">{t('jobs:workingHours')}:</span>
                              <span>
                                {job.workStartTime && job.workEndTime 
                                  ? `${job.workStartTime} - ${job.workEndTime}`
                                  : job.workStartTime 
                                    ? `${job.workStartTime} ${t('jobs:start')}`
                                    : `${job.workEndTime} ${t('jobs:end')}`
                                }
                              </span>
                            </div>
                          )}
                          {job.companyIndustry && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{t('jobs:companySector')}:</span>
                              <span>{job.companyIndustry}</span>
                            </div>
                          )}
                          {job.applicationDeadline && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-red-600">⏰ {t('jobs:lastApplication')}:</span>
                              <span className="text-red-600">{new Date(job.applicationDeadline).toLocaleDateString('tr-TR')}</span>
                            </div>
                          )}
                          {job.educationLevel && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">🎓 {t('jobs:education')}:</span>
                              <span>{job.educationLevel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* İş Türü ve Deneyim Etiketleri */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors duration-200">
                          📋 {job.type}
                        </span>
                        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors duration-200">
                          👤 {job.experience}
                        </span>
                        {job.location.includes('Uzaktan') && (
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-colors duration-200">
                            🏠 Uzaktan
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* İş Açıklaması */}
                    <div className="mt-3 text-gray-700 text-sm line-clamp-3 mb-3">
                      <span className="font-medium text-gray-600">📝 {t('jobs:description')}:</span>
                      <div className="mt-1">{job.description}</div>
                    </div>
                    
                    {/* Gereksinimler */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-3 mb-4">
                        <div className="text-gray-600 text-sm font-medium mb-2">🔧 {t('jobs:requirements')}:</div>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 4).map((req: string, index: number) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors duration-200">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 4 && (
                            <span className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                              +{job.requirements.length - 4} {t('jobs:moreBenefits')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Yan Haklar */}
                    {job.benefits && job.benefits.length > 0 && (
                      <div className="mt-3 mb-4">
                        <div className="text-gray-600 text-sm font-medium mb-2">🎁 {t('jobs:benefits')}:</div>
                        <div className="flex flex-wrap gap-2">
                          {expandedBenefits === job.id 
                            ? job.benefits.map((benefit: string, index: number) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition-colors duration-200">
                                  {benefit}
                                </span>
                              ))
                            : (
                              <>
                                {job.benefits.slice(0, 3).map((benefit: string, index: number) => (
                                  <span key={index} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition-colors duration-200">
                                    {benefit}
                                  </span>
                                ))}
                                {job.benefits.length > 3 && (
                                  <span 
                                    className="inline-block bg-green-200 text-green-600 px-2 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-green-300 transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedBenefits(expandedBenefits === job.id ? null : job.id);
                                    }}
                                  >
                                    +{job.benefits.length - 3} {t('jobs:moreBenefits')}
                                  </span>
                                )}
                              </>
                            )
                          }
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-sm mb-4">
                      <span className="text-gray-500">{t('jobs:compatibility')}:</span>
                      <span className="flex items-center">
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-gray-300" size={16} />
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      {appliedJobs.has(job.id) ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled
                          className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                        >
                          <span>✓ {t('jobs:applicationSubmitted')}</span>
                        </Button>
                      ) : (
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
                              <span>{t('jobs:applying')}</span>
                            </>
                          ) : (
                            <span>{t('jobs:apply')}</span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
          
          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2">
                {/* Önceki Sayfa */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2"
                >
                  <ChevronLeft size={16} />
                  Önceki
                </Button>
                
                {/* Sayfa Numaraları */}
                <div className="flex items-center gap-1">
                  {/* İlk sayfa */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 min-w-[40px]"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </>
                  )}
                  
                  {/* Mevcut sayfa etrafındaki sayfalar */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const pageNum = startPage + i;
                    
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 min-w-[40px] ${
                          pageNum === currentPage 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {/* Son sayfa */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2 min-w-[40px]"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Sonraki Sayfa */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2"
                >
                  Sonraki
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;