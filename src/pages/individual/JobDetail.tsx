import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { ArrowLeft, MapPin, Clock, Briefcase, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { pageSEOContent, updateMetaTags } from '../../lib/utils';
import { fetchJobById } from '../../lib/jobsService';
import { applyToJob } from '../../lib/applicationsService';
import { createNotification } from '../../lib/notificationsService';
import supabase from '../../lib/supabaseClient';
import { useToast } from '../../components/ui/ToastProvider';

type UiJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience?: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: string;
  logo: string;
  category?: string;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string[];
};

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const jobId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const [job, setJob] = useState<UiJob | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const { showToast } = useToast();

  // Başvuru yapma fonksiyonu
  const handleApply = async () => {
    if (!jobId) return;
    
    try {
      setIsApplying(true);
      
      // Kullanıcı giriş kontrolü
      const { data: auth } = await supabase.auth.getUser();
      
      if (!auth.user?.id) {
        showToast({
          type: 'warning',
          title: 'Giriş Gerekli',
          message: 'Başvuru yapmak için giriş yapmalısınız.'
        });
        navigate('/login/individual');
        return;
      }

      // Başvuru yap
      await applyToJob(jobId.toString(), auth.user.id, {
        cover_letter: '',
        resume_url: undefined,
        answers: undefined
      });

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
          .eq('user_id', auth.user.id)
          .single();


        if (jobData?.company_id && userData) {
          const applicantName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email?.split('@')[0] || 'Kullanıcı';
          
          
          await createNotification({
            company_id: jobData.company_id,
            title: 'Yeni Başvuru',
            message: `${applicantName} ${t('common:applicationMessage').replace('""', `"${jobData.title}"`)}`,
            type: 'info'
          });
          
        } else {
        }
      } catch (notificationError) {
        console.warn('Bildirim gönderilemedi:', notificationError);
      }

      // Başvuru durumunu güncelle
      setApplicationStatus('pending');
      showToast({
        type: 'success',
        title: 'Başvuru Başarılı!',
        message: 'Başvurunuz başarıyla gönderildi. İşveren tarafından değerlendirilecek.'
      });
      
    } catch (error: any) {
      console.error('Başvuru hatası:', error);
      showToast({
        type: 'error',
        title: 'Başvuru Hatası',
        message: error.message || 'Başvuru gönderilemedi. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (jobId == null) return;
      
      try {
        // Paralel veri yükleme
        const [jobData, authData] = await Promise.all([
          fetchJobById(jobId.toString()),
          supabase.auth.getUser()
        ]);

        if (!isMounted) return;
        
        if (!jobData) {
          setJob(null);
          return;
        }

        const mapped: UiJob = {
          id: jobData.id.toString(),
          title: (jobData as any).title,
          company: (jobData as any).company_name || 'Şirket',
          location: (jobData as any).location,
          type: (jobData as any).type,
          experience: (jobData as any).experience_level,
          salary: (jobData as any).salary ? `${(jobData as any).salary.min} - ${(jobData as any).salary.max} ${(jobData as any).salary.currency}` : '',
          description: (jobData as any).description,
          requirements: (jobData as any).skills || [],
          postedDate: new Date((jobData as any).created_at).toLocaleDateString('tr-TR'),
          logo: (jobData as any).company_logo || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          category: (jobData as any).department || '',
          workStartTime: (jobData as any).work_start_time,
          workEndTime: (jobData as any).work_end_time,
          workDays: (jobData as any).work_days || []
        };
        setJob(mapped);

        // Başvuru durumunu kontrol et
        if (authData.data.user?.id) {
          try {
            const { data: application } = await supabase
              .from('applications')
              .select('status')
              .eq('user_id', authData.data.user.id)
              .eq('job_id', jobId)
              .single();
            
            if (application) {
              setApplicationStatus(application.status);
            }
          } catch (error) {
            console.warn('Başvuru durumu kontrol edilemedi:', error);
          }
        }
      } catch (error) {
        console.error('JobDetail verileri yüklenirken hata:', error);
      }
    };
    
    loadData();
    return () => { isMounted = false; };
  }, [jobId]);

  // Başvuru durumunu UI'da göster
  const getApplicationStatusUI = () => {
    if (!applicationStatus) return null;

    switch (applicationStatus) {
      case 'pending':
        return {
          text: 'Beklemede',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <AlertCircle size={16} />
        };
      case 'in_review':
        return {
          text: 'İncelemede',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertCircle size={16} />
        };
      case 'accepted':
      case 'approved':
        return {
          text: 'Kabul Edildi',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle size={16} />
        };
      case 'rejected':
        return {
          text: 'Reddedildi',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle size={16} />
        };
      default:
        return {
          text: 'Beklemede',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <AlertCircle size={16} />
        };
    }
  };

  useEffect(() => {
    const { title, description, keywords } = pageSEOContent.jobs;
    const pageTitle = job ? `${job.title} | İş Detayı` : title;
    updateMetaTags(
      pageTitle,
      description,
      keywords,
      undefined,
      window.location.href
    );
  }, [job]);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header userType="individual" />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-10">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 mb-6">İlan bulunamadı veya kaldırılmış olabilir.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/individual/jobs')}>İlanlara Dön</Button>
                {id ? (
                  <Button variant="outline" onClick={() => navigate(`/individual/jobs?jobId=${id}`)}>
                    İlan Kartına Git
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      <main className="flex-1 pt-16">
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/individual/jobs')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} className="mr-2" /> Geri
            </button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={job.logo} alt={`${job.company} logo`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                  <span className="inline-flex items-center"><MapPin size={16} className="mr-1" /> {job.location}</span>
                  <span className="inline-flex items-center"><Clock size={16} className="mr-1" /> {job.postedDate}</span>
                  <span className="inline-flex items-center"><Briefcase size={16} className="mr-1" /> {job.type}</span>
                  {(job.workStartTime || job.workEndTime) && (
                    <span className="inline-flex items-center">
                      <Clock size={16} className="mr-1" /> 
                      {job.workStartTime && job.workEndTime 
                        ? `${job.workStartTime} - ${job.workEndTime}`
                        : job.workStartTime 
                          ? `${job.workStartTime} başlangıç`
                          : `${job.workEndTime} bitiş`
                      }
                    </span>
                  )}
                </div>
              </div>
              <div className="text-primary font-semibold text-base">{job.salary}</div>
            </div>

            <div className="prose max-w-none text-gray-800">
              <p className="mb-4">{job.description}</p>
              <h3 className="font-semibold mb-2">Aranan Nitelikler</h3>
              <ul className="list-disc pl-5">
                {job.requirements.map(req => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              {applicationStatus ? (
                <div className="flex items-center gap-2">
                  {(() => {
                    const statusUI = getApplicationStatusUI();
                    if (!statusUI) return null;
                    return (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusUI.color}`}>
                        {statusUI.icon}
                        <span className="font-medium">{statusUI.text}</span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? 'Başvuru Yapılıyor...' : 'Başvur'}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/individual/jobs')}>Diğer İlanlar</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;



