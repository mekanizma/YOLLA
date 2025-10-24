import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Search, Filter, CheckCircle, Handshake, Flag, Check, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import supabase from '../../lib/supabaseClient';
import { getMyApplications, approveApplicationByUser } from '../../lib/applicationsService';
import { createNotification } from '../../lib/notificationsService';
import { fetchCompanyByEmail } from '../../lib/jobsService';

const Applications = () => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApproval, setLoadingApproval] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({ 
    show: false, 
    type: 'info', 
    message: '' 
  });

  const mapStatusToUi = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: t('applications:pending'), color: 'bg-blue-100 text-blue-800' };
      case 'in_review':
        return { text: t('applications:inReview'), color: 'bg-yellow-100 text-yellow-800' };
      case 'accepted':
        return { text: t('applications:accepted'), color: 'bg-green-100 text-green-800' };
      case 'approved':
        return { text: 'Onaylandı', color: 'bg-emerald-100 text-emerald-800' };
      case 'rejected':
        return { text: t('applications:rejected'), color: 'bg-red-100 text-red-800' };
      default:
        return { text: t('applications:pending'), color: 'bg-blue-100 text-blue-800' };
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user?.id) {
          setApplications([]);
          return;
        }
        const rows = await getMyApplications(user.id);
        console.log('Applications verisi:', rows);
        const mapped = rows.map((a: any) => {
          const ui = mapStatusToUi(a.status as string);
          return {
            id: a.id,
            jobId: a.job_id,
            position: a.jobs?.title || t('applications:jobPosting'),
            company: a.jobs?.companies?.name || t('applications:company'),
            location: a.jobs?.location || '-',
            appliedDate: new Date(a.created_at).toLocaleDateString('tr-TR'),
            status: ui.text,
            statusColor: ui.color,
            logo: a.jobs?.companies?.logo || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          };
        });
        setApplications(mapped);
      } catch (error) {
        console.error('Applications yüklenirken hata:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApproveApplication = async (applicationId: number) => {
    try {
      setLoadingApproval(applicationId);
      
      // Başvuruyu onayla
      await approveApplicationByUser(applicationId);
      
      // UI'da durumu güncelle
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'Onaylandı', statusColor: 'bg-emerald-100 text-emerald-800' }
          : app
      ));
      
      // Başarı mesajı göster
      setToast({
        show: true,
        type: 'success',
        message: '🎉 Başvuru başarıyla onaylandı! / Application successfully approved!'
      });
      
      // 5 saniye sonra toast'ı kapat
      setTimeout(() => {
        setToast({ show: false, type: 'info', message: '' });
      }, 5000);
      
      // Kurumsal tarafına bildirim gönder
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (user) {
          // Başvuru bilgilerini al
          const application = applications.find(app => app.id === applicationId);
          if (application) {
            // Job bilgilerini al
            const { data: jobData } = await supabase
              .from('jobs')
              .select('company_id, title')
              .eq('id', application.jobId)
              .single();
            
            if (jobData) {
              // Şirket bilgilerini al
              const { data: companyData } = await supabase
                .from('companies')
                .select('name, email')
                .eq('id', jobData.company_id)
                .single();
              
              if (companyData) {
                // Şirketin kurumsal kullanıcısını bul
                const company = await fetchCompanyByEmail(companyData.email);
                if (company) {
                  // Kurumsal kullanıcıya bildirim gönder
                  await createNotification({
                    company_id: company.id,
                    title: '🎉 Başvuru Onaylandı! / Application Approved!',
                    message: `✅ ${application.position} pozisyonu için başvuru onaylandı!\n\n👤 Aday: ${user.user_metadata?.name || user.email?.split('@')[0] || 'Aday'}\n📅 Onay Tarihi: ${new Date().toLocaleDateString('tr-TR')}\n\n✅ Application approved for ${application.position} position!\n\n👤 Candidate: ${user.user_metadata?.name || user.email?.split('@')[0] || 'Aday'}\n📅 Approval Date: ${new Date().toLocaleDateString('en-US')}\n\n🚀 Aday işe başlamaya hazır! / Candidate is ready to start!`,
                    type: 'success',
                    data: { 
                      application_id: applicationId,
                      job_title: jobData.title,
                      applicant_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Aday'
                    }
                  });
                }
              }
            }
          }
        }
      } catch (notificationError) {
        console.warn('Kurumsal tarafına bildirim gönderilemedi:', notificationError);
      }
      
    } catch (error: any) {
      console.error('Onaylama hatası:', error);
      
      // Daha spesifik hata mesajları - Türkçe ve İngilizce
      let errorMessage = '';
      
      if (error.message?.includes('Başvuru bulunamadı')) {
        errorMessage = '❌ Başvuru bulunamadı!\n\nLütfen sayfayı yenileyin ve tekrar deneyin.\n\n❌ Application not found!\n\nPlease refresh the page and try again.';
      } else if (error.message?.includes('Sadece kabul edilmiş başvurular')) {
        errorMessage = '⚠️ Bu başvuru henüz kabul edilmemiş!\n\nKurumsal tarafın önce başvurunuzu kabul etmesi gerekiyor.\n\n⚠️ This application has not been accepted yet!\n\nThe corporate side needs to accept your application first.';
      } else if (error.message?.includes('user_approved')) {
        errorMessage = '🔧 Veritabanı hatası!\n\nLütfen yöneticiye başvurun veya daha sonra tekrar deneyin.\n\n🔧 Database error!\n\nPlease contact the administrator or try again later.';
      } else if (error.message?.includes('permission') || error.message?.includes('yetki')) {
        errorMessage = '🚫 Yetkiniz yok!\n\nBu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz.\n\n🚫 No permission!\n\nYou do not have the necessary permissions to perform this action.';
      } else if (error.message?.includes('network') || error.message?.includes('internet')) {
        errorMessage = '🌐 Bağlantı hatası!\n\nİnternet bağlantınızı kontrol edin ve tekrar deneyin.\n\n🌐 Connection error!\n\nPlease check your internet connection and try again.';
      } else {
        errorMessage = '❌ Onaylama işlemi başarısız oldu!\n\nLütfen tekrar deneyin veya yöneticiye başvurun.\n\n❌ Approval process failed!\n\nPlease try again or contact the administrator.';
      }
      
      setToast({
        show: true,
        type: 'error',
        message: errorMessage
      });
      
      // 8 saniye sonra toast'ı kapat
      setTimeout(() => {
        setToast({ show: false, type: 'info', message: '' });
      }, 8000);
    } finally {
      setLoadingApproval(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Başvuru aşamaları
  const steps = [
    { key: 'application', label: t('applications:application'), icon: <CheckCircle size={28} /> },
    { key: 'review', label: t('applications:review'), icon: <CheckCircle size={28} /> },
    { key: 'offer', label: t('applications:offer'), icon: <Handshake size={28} /> },
    { key: 'result', label: t('applications:result'), icon: <Flag size={28} /> },
  ];

  // Her başvuru için ilerleme yüzdesi (gerçek veriyle)
  const getProgressPercent = (status: string) => {
    switch (status) {
      case t('applications:pending'):
        return 25;
      case t('applications:inReview'):
        return 50;
      case t('applications:accepted'):
        return 75;
      case 'Onaylandı':
        return 100;
      case t('applications:rejected'):
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      
      <main className="flex-1 pt-16">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{t('applications:myApplications')}</h1>
                <p className="text-gray-600 mt-1">{t('applications:trackAllApplications')}</p>
              </div>
              <Button 
                onClick={() => navigate('/individual/jobs')}
                className="md:w-auto w-full justify-center"
              >
                {t('applications:exploreNewJobs')}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('applications:loadingApplications')}</p>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('applications:noApplicationsYet')}</h3>
              <p className="text-gray-600 mb-6">{t('applications:browseJobsAndApply')}</p>
              <Button onClick={() => navigate('/individual/jobs')}>
                {t('applications:viewJobListings')}
              </Button>
            </div>
          </div>
        ) : (
        
        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={t('common:searchPlaceholder')}
                    className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">{t('common:allApplications')}</option>
                  <option value="Beklemede">{t('common:pending')}</option>
                  <option value="İncelemede">{t('common:inReview')}</option>
                  <option value="Kabul Edildi">{t('common:accepted')}</option>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Reddedildi">{t('common:rejected')}</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const progressPercent = getProgressPercent(application.status);
              return (
                <div 
                  key={application.id} 
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={application.logo} 
                        alt={`${application.company} logo`}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold">{application.position}</h3>
                          <p className="text-gray-600">{application.company}</p>
                        </div>
                        <div className="md:text-right">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${application.statusColor}`}>
                            {application.status}
                          </span>
                          <div className="text-sm text-gray-500 mt-1 flex items-center md:justify-end">
                            <Clock size={14} className="mr-1" />
                            {application.appliedDate}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          <MapPin size={14} className="mr-1" />
                          {application.location}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/individual/jobs?jobId=${application.jobId}`)}
                        >
                          {t('applications:viewJobPosting')}
                        </Button>
                        
                        {/* Onaylama Butonu - Sadece kabul edilmiş başvurular için */}
                        {application.status === t('applications:accepted') && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              const confirmMessage = '🎯 Başvurunuzu onaylamak istediğinizden emin misiniz?\n\n✅ Bu işlem sonrasında:\n• Başvuru durumu "Onaylandı" olacak\n• Kurumsal tarafa bildirim gönderilecek\n• İşe başlama süreciniz tamamlanacak\n\n🎯 Are you sure you want to approve your application?\n\n✅ After this action:\n• Application status will be "Approved"\n• Notification will be sent to corporate side\n• Your job start process will be completed';
                              
                              if (window.confirm(confirmMessage)) {
                                handleApproveApplication(application.id);
                              }
                            }}
                            disabled={loadingApproval === application.id}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            title="Başvurunuzu onaylayın - Approve your application"
                          >
                            {loadingApproval === application.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Onaylanıyor... / Approving...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Check size={16} />
                                <span>Onayla / Approve</span>
                              </div>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">{t('applications:applicationStatus')}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-3 py-0.5 text-xs font-semibold">
                        <span>{t('applications:progress')}</span>
                        <span className="ml-1 font-bold">{Math.round(progressPercent)}%</span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    {/* Steps */}
                    <div className="flex justify-between items-center mt-2">
                      {steps.map((step, idx) => {
                        const isCompleted = idx < getProgressPercent(application.status);
                        const isActive = idx === getProgressPercent(application.status);
                        return (
                          <div key={step.key} className="flex flex-col items-center w-1/5">
                            <div
                              className={
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isActive
                                  ? 'bg-orange-500 text-white animate-pulse'
                                  : 'bg-gray-200 text-gray-400'
                              }
                              style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}
                            >
                              {step.icon}
                            </div>
                            <span
                              className={
                                isCompleted
                                  ? 'text-green-600 text-xs mt-1'
                                  : isActive
                                  ? 'text-orange-600 text-xs mt-1 font-semibold'
                                  : 'text-gray-400 text-xs mt-1'
                              }
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium">{t('applications:noResultsFound')}</h3>
                <p className="text-gray-600 mt-1">
                  {t('applications:noMatchingApplications')}
                </p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  {t('applications:clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
      
      <Footer />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : toast.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className={`flex-shrink-0 ${
              toast.type === 'success' 
                ? 'text-green-500' 
                : toast.type === 'error'
                ? 'text-red-500'
                : 'text-blue-500'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle size={20} />
              ) : toast.type === 'error' ? (
                <X size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                toast.type === 'success' 
                  ? 'text-green-800' 
                  : toast.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast({ show: false, type: 'info', message: '' })}
              className={`flex-shrink-0 ${
                toast.type === 'success' 
                  ? 'text-green-400 hover:text-green-600' 
                  : toast.type === 'error'
                  ? 'text-red-400 hover:text-red-600'
                  : 'text-blue-400 hover:text-blue-600'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;