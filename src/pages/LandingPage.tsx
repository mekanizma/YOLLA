import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, User } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { updateMetaTags, pageSEOContent } from '../lib/utils';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    const titles = t('landing:rotatingTitles', { returnObjects: true }) as string[];
    if (!Array.isArray(titles) || titles.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % titles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [t]);

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
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-40 md:h-40 lg:h-44 relative overflow-hidden">
              <h1 key={`title-${heroIndex}`} className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 transition-opacity duration-1000 opacity-100 whitespace-nowrap overflow-hidden text-ellipsis">
                {heroIndex === 0 ? t('landing:heroTitle') : (t('landing:rotatingTitles', { returnObjects: true }) as string[])[heroIndex - 0]}
              </h1>
              <p key={`subtitle-${heroIndex}`} className="text-white/90 text-base md:text-lg transition-opacity duration-1000 whitespace-nowrap overflow-hidden text-ellipsis">
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
            <h2 className="text-3xl font-bold mb-4">{t('landing:features')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing:feature1Description')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              t('jobs:categoryIT'),
              t('jobs:categoryFinance'),
              t('jobs:categorySales'),
              t('jobs:categoryEngineering'),
              t('jobs:categoryHealth'),
              t('jobs:categoryDesign'),
              t('jobs:categoryEducation'),
              t('common:categoryProduction')
            ].map((category, index) => (
              <div 
                key={category}
                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:-translate-y-1"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{category}</h3>
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