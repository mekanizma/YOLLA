import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Briefcase, MapPin, Building, Clock, Edit2 } from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import Header from '../../components/layout/Header';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  type: string;
  experience_level: string;
  education_level: string;
  salary: any;
  skills: string[];
  benefits: string[];
  department: string;
  status: string;
  is_remote: boolean;
  application_deadline: string;
  company_id: number;
  views: number;
  applications: number;
  created_at: string;
  updated_at: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Veritabanından iş ilanını çek
        const { data: jobData, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (jobData) {
          setJob(jobData);
          
          // Bu iş ilanına gelen başvuru sayısını çek
          const { count, error: countError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', jobData.id);
          
          if (!countError) {
            setApplicationCount(count || 0);
          }
        } else {
          navigate('/corporate/jobs');
        }
        
      } catch (error) {
        console.error('İş ilanı yüklenemedi:', error);
        navigate('/corporate/jobs');
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [id, navigate]);

  if (loading) {
    return (
      <>
        <Header userType="corporate" />
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">İş ilanı yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header userType="corporate" />
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
          <div className="text-center">
            <p className="text-gray-600">İş ilanı bulunamadı.</p>
            <button 
              onClick={() => navigate('/corporate/jobs')} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header userType="corporate" />
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
        <button
          onClick={() => navigate('/corporate/jobs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          İlanlara Dön
        </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {job.location}
              </span>
              <span className="flex items-center">
                <Briefcase size={16} className="mr-1" />
                {job.type}
              </span>
              <span className="flex items-center">
                <Building size={16} className="mr-1" />
                {job.experience_level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/corporate/job-edit/${job.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={18} />
              <span>İlanı Düzenle</span>
            </button>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {job.status === 'published' ? 'Yayında' : 'Kapalı'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
              <Users size={20} />
              <span className="font-medium">Başvuru Sayısı</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{applicationCount}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
              <Calendar size={20} />
              <span className="font-medium">Oluşturulma Tarihi</span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(job.created_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
              <Clock size={20} />
              <span className="font-medium">Son Güncelleme</span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(job.updated_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* İş Açıklaması */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">İş Açıklaması</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          {/* Gereksinimler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Gereksinimler</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>
          </div>

          {/* Sorumluluklar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sorumluluklar</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {job.responsibilities}
              </p>
            </div>
          </div>

          {/* Yetenekler */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Gerekli Yetenekler</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Faydalar */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Faydalar</h2>
              <ul className="list-disc list-inside space-y-1">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Maaş Bilgisi */}
          {job.salary && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Maaş Bilgisi</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {typeof job.salary === 'string' ? job.salary : JSON.stringify(job.salary)}
                </p>
              </div>
            </div>
          )}

          {/* Başvuru Detayları */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Başvuru Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">İş Türü</h3>
                <p className="text-gray-600 dark:text-gray-400">{job.type}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Deneyim Seviyesi</h3>
                <p className="text-gray-600 dark:text-gray-400">{job.experience_level}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Eğitim Seviyesi</h3>
                <p className="text-gray-600 dark:text-gray-400">{job.education_level || 'Belirtilmemiş'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Çalışma Şekli</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.is_remote ? 'Uzaktan Çalışma' : 'Ofis'}
                </p>
              </div>
            </div>
          </div>

          {/* Başvurular */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Başvurular</h2>
            {applicationCount > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {applicationCount} adet başvuru bulunmaktadır. Başvuruları görüntülemek için tıklayın.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Henüz başvuru bulunmamaktadır.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default JobDetail; 