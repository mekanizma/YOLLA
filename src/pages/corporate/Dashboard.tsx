import React from 'react';
import { useState } from 'react';
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
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  // Statistics data
  const stats = [
    { 
      title: 'Aktif İlanlar', 
      value: '5', 
      icon: <FileText className="text-primary" />,
      bgColor: 'bg-primary/10',
      change: '+2 bu hafta',
      changeUp: true,
      onClick: () => navigate('/corporate/dashboard'),
    },
    { 
      title: 'Toplam Başvurular', 
      value: '124', 
      icon: <Users className="text-secondary" />,
      bgColor: 'bg-secondary/10', 
      change: '+18 bu hafta',
      changeUp: true,
      onClick: () => navigate('/corporate/applications'),
    },
    { 
      title: 'Görüşme Aşamasında', 
      value: '8', 
      icon: <Clock className="text-accent" />,
      bgColor: 'bg-accent/10',
      change: '+3 bu hafta',
      changeUp: true, 
      onClick: () => navigate('/corporate/applications?tab=interview'),
    },
    { 
      title: 'Tamamlanan İşe Alımlar', 
      value: '12', 
      icon: <TrendingUp className="text-success" />,
      bgColor: 'bg-success/10',
      change: '+0 bu hafta',
      changeUp: false, 
      onClick: () => navigate('/corporate/applications?tab=completed'),
    },
  ];
  
  // Recent applications data
  const recentApplications = [
    {
      id: 101,
      name: 'Ayşe Yılmaz',
      position: 'Senior Frontend Geliştirici',
      appliedDate: '1 gün önce',
      experience: '5 yıl',
      status: 'Yeni',
      statusColor: 'bg-primary/10 text-primary',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      id: 102,
      name: 'Mehmet Kaya',
      position: 'UI/UX Tasarımcı',
      appliedDate: '2 gün önce',
      experience: '3 yıl',
      status: 'Değerlendiriliyor',
      statusColor: 'bg-yellow-100 text-yellow-800',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      id: 103,
      name: 'Zeynep Demir',
      position: 'Backend Geliştirici',
      appliedDate: '3 gün önce',
      experience: '4 yıl',
      status: 'Görüşmeye Çağrıldı',
      statusColor: 'bg-green-100 text-green-800',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="corporate" />
      
      <main className="flex-1 pt-16">
        {/* Welcome Banner */}
        <section className="bg-secondary text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Hoş Geldiniz, TechSoft A.Ş.</h1>
                <p className="text-white/90">İşe alım süreçlerinizi yönetmek için kurumsal paneliniz.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button 
                  variant="primary"
                  className="bg-white text-secondary hover:bg-white/90"
                  onClick={() => navigate('/corporate/post-job')}
                >
                  <PlusCircle className="mr-2" size={16} />
                  Yeni İlan Oluştur
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow p-6 animate-fadeIn cursor-pointer hover:shadow-lg transition"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={stat.onClick}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                    <p className={`text-xs flex items-center mt-1 ${stat.changeUp ? 'text-success' : 'text-gray-500'}`}>
                      {stat.changeUp && '↑'} {stat.change}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Son Başvurular</h2>
                  <Link to="/corporate/applications" className="text-secondary hover:underline text-sm font-medium flex items-center">
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
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={application.avatar} 
                            alt={application.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                              <h3 className="font-medium text-base">{application.name}</h3>
                              <p className="text-gray-600 text-sm">{application.position}</p>
                            </div>
                            <div className="mt-1 sm:mt-0 sm:text-right">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${application.statusColor}`}>
                                {application.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{application.appliedDate}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-3">
                              Deneyim: {application.experience}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {/* View profile */}}
                              className="text-xs"
                            >
                              Profil
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {/* Download CV */}}
                              className="text-xs"
                            >
                              CV İndir
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => {/* Contact candidate */}}
                              className="text-xs"
                            >
                              İletişime Geç
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* Active Listings */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Aktif İlanlarım</h2>
                
                <div className="space-y-3">
                  <div className="border border-gray-100 rounded-lg p-4">
                    <h3 className="font-medium">Frontend Geliştirici</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">68 başvuru</span>
                      <span className="text-xs text-gray-500">10 gün kaldı</span>
                    </div>
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-center text-xs"
                      >
                        İlanı Görüntüle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-100 rounded-lg p-4">
                    <h3 className="font-medium">UI/UX Tasarımcı</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">42 başvuru</span>
                      <span className="text-xs text-gray-500">15 gün kaldı</span>
                    </div>
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-center text-xs"
                      >
                        İlanı Görüntüle
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link to="/corporate/post-job">
                    <Button 
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                    >
                      <PlusCircle className="mr-2" size={16} />
                      Yeni İlan Oluştur
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Company Profile Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Şirket Profili</h2>
                  <Link to="/corporate/settings" className="text-secondary hover:underline text-sm">
                    Düzenle
                  </Link>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Briefcase className="text-gray-400" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">TechSoft A.Ş.</h3>
                    <p className="text-sm text-gray-500">Bilgi Teknolojileri</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    <span>info@techsoft.com.tr</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone size={16} className="text-gray-400 mr-2" />
                    <span>+90 212 456 7890</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="text-gray-400 mr-2" />
                    <span>İstanbul, Türkiye</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User size={16} className="text-gray-400 mr-2" />
                    <span>50-100 çalışan</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profil Tamamlama</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
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