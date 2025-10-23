import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { updateMetaTags, pageSEOContent } from '../lib/utils';
import '../styles/animated-features.css';
import '../styles/rotating-text.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, ready } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

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
      '/src/assets/yollabi-logo.svg',
      'https://www.isbul.com.tr'
    );
  }, []);

  // Hero rotating text
  useEffect(() => {
    if (!ready) return;
    const titles = t('landing:rotatingTitles', { returnObjects: true }) as string[];
    if (!Array.isArray(titles) || titles.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % titles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [t, ready]);

  if (!ready) {
    return <Loading text={t('common:pageLoading')} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header scrolled={scrolled} />
      
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
        
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="min-h-[120px] md:min-h-[140px] lg:min-h-[160px] relative">
              <h1 key={`title-${heroIndex}`} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 md:mb-4 transition-opacity duration-1000 opacity-100 leading-tight px-2">
                {heroIndex === 0 ? t('landing:heroTitle') : (t('landing:rotatingTitles', { returnObjects: true }) as string[])[heroIndex - 0]}
              </h1>
              <p key={`subtitle-${heroIndex}`} className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl transition-opacity duration-1000 leading-relaxed px-2">
                {heroIndex === 0 ? t('landing:heroSubtitle') : (t('landing:rotatingSubtitles', { returnObjects: true }) as string[])[heroIndex - 0]}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popüler İş Kategorileri */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="features-title">
              {t('landing:features').split('').map((letter, index) => (
                <span key={index} className="features-key">
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </div>
            <div className="rotating-text-container">
              <div className="animation">
                <div>
                  <div className="first">{t('jobs:categoryHotel')}</div>
                  <div className="second">{t('jobs:categoryIT')}</div>
                  <div className="third">{t('jobs:categoryFinance')}</div>
                  <div className="fourth">{t('jobs:categorySales')}</div>
                  <div className="fifth">{t('jobs:categoryEngineering')}</div>
                  <div className="sixth">{t('jobs:categoryHealth')}</div>
                  <div className="seventh">{t('jobs:categoryDesign')}</div>
                  <div className="eighth">{t('jobs:categoryEducation')}</div>
                  <div className="ninth">{t('jobs:categoryLogistics')}</div>
                  <div className="tenth">{t('jobs:categoryHR')}</div>
                  <div className="eleventh">{t('jobs:categoryLegal')}</div>
                  <div className="twelfth">{t('jobs:categoryMarketing')}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: t('jobs:categoryHotel'), icon: '🏨', color: 'from-orange-500 to-red-500' },
              { name: t('jobs:categoryIT'), icon: '💻', color: 'from-blue-500 to-purple-500' },
              { name: t('jobs:categoryFinance'), icon: '💰', color: 'from-green-500 to-emerald-500' },
              { name: t('jobs:categorySales'), icon: '📈', color: 'from-yellow-500 to-orange-500' },
              { name: t('jobs:categoryEngineering'), icon: '⚙️', color: 'from-gray-500 to-slate-500' },
              { name: t('jobs:categoryHealth'), icon: '🏥', color: 'from-red-500 to-pink-500' },
              { name: t('jobs:categoryDesign'), icon: '🎨', color: 'from-purple-500 to-pink-500' },
              { name: t('jobs:categoryEducation'), icon: '📚', color: 'from-indigo-500 to-blue-500' },
              { name: t('jobs:categoryLogistics'), icon: '🚚', color: 'from-teal-500 to-cyan-500' },
              { name: t('jobs:categoryHR'), icon: '👥', color: 'from-amber-500 to-yellow-500' },
              { name: t('jobs:categoryLegal'), icon: '⚖️', color: 'from-slate-500 to-gray-500' },
              { name: t('jobs:categoryMarketing'), icon: '📢', color: 'from-rose-500 to-red-500' }
            ].map((category, index) => (
              <div 
                key={category.name}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent hover:-translate-y-2 relative overflow-hidden"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon container with gradient */}
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                
                {/* Category name */}
                <h3 className="font-bold text-lg mb-2 group-hover:text-gray-800 transition-colors duration-300 text-gray-700 leading-tight">
                  {category.name}
                </h3>
                
                {/* Hover effect line */}
                <div className={`w-0 group-hover:w-full h-1 bg-gradient-to-r ${category.color} transition-all duration-500 rounded-full`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      
      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('landing:ctaTitle')}</h2>
            <p className="text-white/90 mb-8">
              {t('landing:ctaSubtitle')}
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
                  {t('landing:ctaButton')}
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