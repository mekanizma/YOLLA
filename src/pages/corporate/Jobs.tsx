import React, { useEffect, useState } from 'react';
import { Plus, FileText, Users, Search, Filter, Calendar, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  createdAt: string;
  status: 'active' | 'closed';
  applications: number;
}

const getJobs = (): Job[] => {
  const jobs = localStorage.getItem('corporate_jobs');
  if (jobs) return JSON.parse(jobs);
  // Dummy ilanlar ekle
  const dummyJobs: Job[] = [
    { id: '1', title: 'Frontend Developer', createdAt: new Date().toISOString(), status: 'active', applications: 5 },
    { id: '2', title: 'Backend Developer', createdAt: new Date().toISOString(), status: 'active', applications: 3 },
    { id: '3', title: 'UI/UX Designer', createdAt: new Date().toISOString(), status: 'closed', applications: 0 }
  ];
  localStorage.setItem('corporate_jobs', JSON.stringify(dummyJobs));
  return dummyJobs;
};

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  useEffect(() => {
    setJobs(getJobs());
  }, []);

  const handleStatusChange = (jobId: string, currentStatus: 'active' | 'closed') => {
    const updatedJobs = jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: currentStatus === 'active' ? 'closed' : 'active'
        };
      }
      return job;
    });
    
    setJobs(updatedJobs);
    localStorage.setItem('corporate_jobs', JSON.stringify(updatedJobs));
  };

  const filteredJobs = jobs
    .filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(job => statusFilter === 'all' || job.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">İlanlarım</h1>
        <p className="text-gray-600 dark:text-gray-400">Tüm iş ilanlarınızı buradan yönetebilirsiniz</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="İlan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'closed')}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tüm İlanlar</option>
              <option value="active">Aktif İlanlar</option>
              <option value="closed">Kapalı İlanlar</option>
            </select>
            <Link
              to="/corporate/job-post"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Yeni İlan</span>
            </Link>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Henüz bir ilanınız yok veya arama kriterlerinize uygun ilan bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {job.status === 'active' ? 'Aktif' : 'Kapalı'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-2" />
                      {new Date(job.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users size={16} className="mr-2" />
                      {job.applications} başvuru
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/corporate/job-detail/${job.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Detayları Gör
                    </Link>
                    <button
                      onClick={() => handleStatusChange(job.id, job.status)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        job.status === 'active'
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {job.status === 'active' ? 'İlanı Kapat' : 'İlanı Aç'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 