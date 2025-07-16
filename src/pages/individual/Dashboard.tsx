import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Clock, MapPin, ChevronRight, User, FileText, MessageCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { jobCategories, cities } from '../../lib/utils';
import BadgesSection from '../../components/BadgesSection';
import ProfileCompletionBox from '../../components/ProfileCompletionBox';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Mock data for recommended jobs
  const recommendedJobs = [
    {
      id: 1,
      title: 'Frontend Geliştirici',
      company: 'TechSoft A.Ş.',
      location: 'İstanbul',
      type: 'Tam Zamanlı',
      salary: '20.000₺ - 35.000₺',
      postedDate: '2 gün önce',
      logo: 'https://images.pexels.com/photos/15144262/pexels-photo-15144262.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      category: 'Bilgi Teknolojileri',
    },
    {
      id: 2,
      title: 'Backend Geliştirici',
      company: 'Dijital Vizyon',
      location: 'İstanbul (Uzaktan)',
      type: 'Tam Zamanlı',
      salary: '25.000₺ - 40.000₺',
      postedDate: '1 gün önce',
      logo: 'https://images.pexels.com/photos/11288118/pexels-photo-11288118.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      category: 'Bilgi Teknolojileri',
    },
    {
      id: 3,
      title: 'UI/UX Tasarımcı',
      company: 'Kreatif Ajans',
      location: 'Ankara',
      type: 'Tam Zamanlı',
      salary: '18.000₺ - 30.000₺',
      postedDate: '3 gün önce',
      logo: 'https://images.pexels.com/photos/3585088/pexels-photo-3585088.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      category: 'Tasarım',
    },
  ];
  
  // Mock data for applications
  const recentApplications = [
    {
      id: 101,
      jobTitle: 'Yazılım Mimarı',
      company: 'Teknoloji Ltd.',
      status: 'Değerlendiriliyor',
      appliedDate: '2 gün önce',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 102,
      jobTitle: 'Veri Analisti',
      company: 'Veri Merkezi A.Ş.',
      status: 'Görüşmeye Çağrıldı',
      appliedDate: '5 gün önce',
      statusColor: 'bg-green-100 text-green-800',
    },
  ];

  // Mock data for badges/achievements
  const badges = [
    {
      id: 1,
      icon: '🏆',
      title: '5 ilana başvurdu',
      desc: 'İlk 5 iş başvurunu tamamladın!'
    },
    {
      id: 3,
      icon: '💯',
      title: 'Profilini %100 doldurdu',
      desc: 'Profilini eksiksiz doldurdun.'
    }
  ];

  // Mock profile completion
  const profileCompletion = 75; // örnek yüzde
  const missingFields = ['Telefon', 'Lokasyon', 'Hakkında'];

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log({ searchTerm, selectedCategory, selectedCity });
  };

  // Filtrelenmiş iş ilanları
  const filteredJobs = recommendedJobs.filter(job => {
    const matchesSearch = searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || (job.category && job.category === selectedCategory);
    const matchesCity = selectedCity === '' || job.location.includes(selectedCity);
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      
      <main className="flex-1 pt-16">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-10 rounded-b-3xl shadow-lg mb-6">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fadeIn">Hoş Geldiniz, Ahmet! 👋</h1>
            <p className="text-white/90 text-lg max-w-xl mx-auto animate-fadeIn delay-100">Kariyer yolculuğunuzda size yardımcı olmaktan memnuniyet duyarız. Hemen aramaya başlayın!</p>
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
                    placeholder="Pozisyon, şirket veya anahtar kelime..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                  >
                    <option value="">Kategori</option>
                    {jobCategories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-200 focus:outline-none"
                  >
                    <option value="">Şehir</option>
                    {cities.map((city, i) => (
                      <option key={i} value={city}>{city}</option>
                    ))}
                  </select>
                  <Button type="submit" className="px-6 py-2">İş Ara</Button>
                </form>
              </section>
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInUp">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Size Önerilen İşler</h2>
                  <Link to="/individual/jobs" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                    Tümünü Gör <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="group border border-gray-100 rounded-xl p-5 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20 group-hover:scale-105 transition-transform duration-200">
                        <img 
                          src={job.logo} 
                          alt={`${job.company} logo`}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{job.company}</p>
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
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={() => navigate(`/individual/jobs/${job.id}`)}
                          >
                            İlanı Görüntüle
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
                <h2 className="text-xl font-bold mb-4">Hızlı Erişim</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/individual/profile"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    Profil
                  </Link>
                  <Link
                    to="/individual/chats"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Mesajlar
                  </Link>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInUp">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Son Başvurularım</h2>
                  <Link to="/individual/applications" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                    Tümünü Gör <ChevronRight size={16} />
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
                    <img src="/empty-application.svg" alt="Başvuru yok" className="w-24 h-24 mb-4 opacity-80" />
                    <p className="text-gray-500 mb-2">Henüz bir başvurunuz bulunmamaktadır.</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => {/* Navigate to jobs */}}
                    >
                      İş İlanlarını Keşfet
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