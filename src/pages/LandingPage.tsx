import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Briefcase, Users, Building, TrendingUp, ChevronRight, MapPin, User } from 'lucide-react';
import CountUp from 'react-countup';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { jobCategories, cities, updateMetaTags, pageSEOContent } from '../lib/utils';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    // Sayfa SEO meta etiketlerini güncelle
    const { title, description, keywords } = pageSEOContent.home;
    updateMetaTags(
      title,
      description,
      keywords,
      '/src/assets/logo.png',
      'https://www.isbul.com.tr'
    );
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/individual/jobs?search=${searchTerm}&city=${selectedCity}`);
  };

  const featuredJobs = [
    {
      id: 1,
      title: 'Yazılım Geliştirme Uzmanı',
      company: 'TechSoft A.Ş.',
      location: 'İstanbul',
      type: 'Tam Zamanlı',
      postedDate: '3 gün önce',
      logo: 'https://images.pexels.com/photos/15144262/pexels-photo-15144262.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      id: 2,
      title: 'Satış Müdürü',
      company: 'Global Ticaret Ltd. Şti.',
      location: 'Ankara',
      type: 'Tam Zamanlı',
      postedDate: '1 hafta önce',
      logo: 'https://images.pexels.com/photos/11288118/pexels-photo-11288118.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      id: 3,
      title: 'Pazarlama Uzmanı',
      company: 'Dijital Medya A.Ş.',
      location: 'İzmir',
      type: 'Uzaktan',
      postedDate: '2 gün önce',
      logo: 'https://images.pexels.com/photos/3585088/pexels-photo-3585088.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90 z-0"></div>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)',
            filter: 'brightness(0.4)'
          }}
        ></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slideUp">
              Kariyerinizde Yeni Bir Sayfa Açın
            </h1>
            <p className="text-white/90 text-xl mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Binlerce iş fırsatı ve kariyer seçeneği sizleri bekliyor. Hayalinizdeki işi bulmanın tam zamanı!
            </p>
          </div>
        </div>
      </section>
      
      {/* Popüler İş Kategorileri */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popüler İş Kategorileri</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En çok aranan ve en fazla iş ilanı bulunan kategorileri keşfedin.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {jobCategories.slice(0, 8).map((category, index) => (
              <div 
                key={category}
                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:-translate-y-1"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{category}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">142 açık pozisyon</p>
                  <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* İstatistikler */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                <CountUp
                  end={1000}
                  suffix="+"
                  duration={2.5}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <div className="text-gray-600 font-medium">Aktif İş İlanı</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                <CountUp
                  end={500}
                  suffix="+"
                  duration={2.5}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <div className="text-gray-600 font-medium">Şirket</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                <CountUp
                  end={10000}
                  suffix="+"
                  duration={2.5}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <div className="text-gray-600 font-medium">Başarılı Eşleşme</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">Kariyerinizde Bir Sonraki Adımı Atmaya Hazır Mısınız?</h2>
            <p className="text-white/90 mb-8">
              İster iş arıyor olun, ister en iyi yetenekleri işe almak istiyor olun, İşBul sizin yanınızda. 
              Hemen kaydolun ve tüm özelliklere ücretsiz erişim sağlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
                className="group relative px-10 py-4 text-lg font-bold bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-xl hover:from-secondary/90 hover:to-secondary/70 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Ücretsiz Kaydol
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;