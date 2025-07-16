import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Briefcase, MapPin, Building, Clock, Edit2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  createdAt: string;
  status: 'active' | 'closed';
  applications: number;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const jobs = localStorage.getItem('corporate_jobs');
    if (jobs) {
      const jobList = JSON.parse(jobs);
      const foundJob = jobList.find((j: Job) => j.id === id);
      if (foundJob) {
        setJob(foundJob);
      } else {
        navigate('/corporate/jobs');
      }
    }
  }, [id, navigate]);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
                <Building size={16} className="mr-1" />
                Şirket Adı
              </span>
              <span className="flex items-center">
                <MapPin size={16} className="mr-1" />
                İstanbul, Türkiye
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
                job.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {job.status === 'active' ? 'Aktif' : 'Kapalı'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
              <Users size={20} />
              <span className="font-medium">Başvuru Sayısı</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{job.applications}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
              <Calendar size={20} />
              <span className="font-medium">Oluşturulma Tarihi</span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(job.createdAt).toLocaleDateString('tr-TR', {
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
              {new Date(job.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">İlan Detayları</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400">
                Bu pozisyon için detaylı bilgiler burada yer alacak. Şu anda dummy veri gösterilmektedir.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Başvurular</h2>
            {job.applications > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {job.applications} adet başvuru bulunmaktadır. Başvuruları görüntülemek için tıklayın.
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
  );
};

export default JobDetail; 