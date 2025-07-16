import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  createdAt: string;
  status: 'active' | 'closed';
  applications: number;
}

const JobEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time',
    status: 'active' as 'active' | 'closed'
  });

  useEffect(() => {
    const jobs = localStorage.getItem('corporate_jobs');
    if (jobs) {
      const jobList = JSON.parse(jobs);
      const foundJob = jobList.find((j: Job) => j.id === id);
      if (foundJob) {
        setJob(foundJob);
        setForm(prev => ({
          ...prev,
          title: foundJob.title,
          status: foundJob.status
        }));
      } else {
        navigate('/corporate/jobs');
      }
    }
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobs = localStorage.getItem('corporate_jobs');
    if (jobs) {
      const jobList = JSON.parse(jobs);
      const updatedJobs = jobList.map((j: Job) => {
        if (j.id === id) {
          return {
            ...j,
            title: form.title,
            status: form.status
          };
        }
        return j;
      });
      localStorage.setItem('corporate_jobs', JSON.stringify(updatedJobs));
      navigate(`/corporate/job-detail/${id}`);
    }
  };

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
        onClick={() => navigate(`/corporate/job-detail/${id}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        İlan Detayına Dön
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">İlanı Düzenle</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İlan Başlığı
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İlan Açıklaması
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gereksinimler
            </label>
            <textarea
              id="requirements"
              value={form.requirements}
              onChange={(e) => setForm(prev => ({ ...prev, requirements: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konum
            </label>
            <input
              type="text"
              id="location"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Çalışma Şekli
            </label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="full-time">Tam Zamanlı</option>
              <option value="part-time">Yarı Zamanlı</option>
              <option value="remote">Uzaktan</option>
              <option value="hybrid">Hibrit</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İlan Durumu
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as 'active' | 'closed' }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Aktif</option>
              <option value="closed">Kapalı</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={18} />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEdit; 