import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  Building
} from 'lucide-react';
import Header from '../../components/layout/Header';
import supabase from '../../lib/supabaseClient';
import { fetchCompanyByEmail, fetchCorporateJobs } from '../../lib/jobsService';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const email = auth.user?.email || '';
      const company = await fetchCompanyByEmail(email);
      if (!company) return;
      const jobs = await fetchCorporateJobs(company.id);
      const activeCount = jobs.filter(j => j.status === 'published').length;
      const totalApplications = jobs.reduce((sum, j) => sum + (j.applications || 0), 0);
      // TODO: Görüşme aşamasında ve tamamlanan işe alımlar için 'applications' tablosu şemasına göre sorgu eklenebilir
      setStats([
        { title: 'Yayındaki İlanlar', value: String(activeCount), icon: <FileText className="text-primary" />, bgColor: 'bg-primary/10', change: '', changeUp: true, onClick: () => navigate('/corporate/jobs') },
        { title: 'Toplam Başvurular', value: String(totalApplications), icon: <Users className="text-secondary" />, bgColor: 'bg-secondary/10', change: '', changeUp: true, onClick: () => navigate('/corporate/applications') },
        { title: 'Görüşme Aşamasında', value: '-', icon: <Clock className="text-accent" />, bgColor: 'bg-accent/10', change: '', changeUp: true, onClick: () => navigate('/corporate/applications?tab=interview') },
        { title: 'Tamamlanan İşe Alımlar', value: '-', icon: <TrendingUp className="text-success" />, bgColor: 'bg-success/10', change: '', changeUp: false, onClick: () => navigate('/corporate/applications?tab=completed') },
      ]);

      // Son başvurular (jobs join applications) — basit bir örnek için jobs üzerinden oluşturma zamanı kullanılır
      // Eğer applications tablosu uygun ise burada gerçek join yapılabilir
      setRecentApplications(
        jobs.slice(0, 3).map(j => ({
          id: j.id,
          name: 'Aday',
          position: j.title,
          location: '-',
          date: new Date(j.created_at).toLocaleDateString('tr-TR')
        }))
      );
    };
    load();
  }, []);

  return (
    <>
      <Header userType="corporate" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Hoş Geldiniz, Şirket Adı!</h1>
              <p className="text-sm md:text-base text-white/90">İş ilanlarınızı ve başvuruları buradan yönetebilirsiniz.</p>
            </div>
          </div>
        </section>
          
        <div className="container mx-auto px-4 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow p-4 md:p-6 animate-fadeIn cursor-pointer hover:shadow-lg transition"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={stat.onClick}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2">{stat.value}</h3>
                    <p className={`text-xs flex items-center mt-1 ${stat.changeUp ? 'text-success' : 'text-gray-500'}`}>
                      {stat.changeUp && '↑'} {stat.change}
                    </p>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
            
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg md:text-xl font-semibold">Son Başvurular</h2>
                  <Link to="/corporate/applications" className="text-secondary hover:underline text-xs md:text-sm font-medium flex items-center">
                    Tümünü Gör
                    <ChevronRight size={16} />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div 
                      key={application.id} 
                      className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-sm md:text-base font-semibold">{application.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase size={14} />
                                {application.position}
                              </span>
                              <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                                <MapPin size={14} />
                                {application.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm text-gray-500">
                            {application.date}
                          </span>
                          <Link
                            to={`/corporate/application/${application.id}`}
                            className="text-xs md:text-sm text-primary hover:text-primary/80 font-medium"
                          >
                            Detayları Gör
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Profile */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Şirket Profili</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Şirket Adı</p>
                      <p className="text-sm md:text-base font-medium">TechCorp Solutions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">E-posta</p>
                      <p className="text-sm md:text-base font-medium">info@techcorp.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Telefon</p>
                      <p className="text-sm md:text-base font-medium">+90 (555) 123 45 67</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Adres</p>
                      <p className="text-sm md:text-base font-medium">İstanbul, Türkiye</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/corporate/settings')}
                  className="w-full mt-4 text-xs md:text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Profili Düzenle
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Hızlı İşlemler</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/corporate/job-post')}
                    className="w-full flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <PlusCircle size={16} /> Yeni İlan Oluştur
                  </button>
                  <button
                    onClick={() => navigate('/corporate/applications')}
                    className="w-full flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <Users size={16} /> Başvuruları Yönet
                  </button>
                  <button
                    onClick={() => navigate('/corporate/jobs')}
                    className="w-full flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <FileText size={16} /> İlanları Görüntüle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;