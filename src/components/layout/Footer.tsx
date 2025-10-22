import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">YOLLABİ</span>
            </div>
            <p className="text-gray-300 text-sm">
              {t('landing:footerDescription')}
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t('landing:footerQuickLinks')}</h3>
            <ul className="space-y-1">
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">{t('common:categoryIT')}</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">{t('common:categoryFinance')}</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">{t('common:categorySales')}</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">{t('common:categoryTourism')}</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">{t('common:categoryHealth')}</Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t('landing:footerSupport')}</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300">{t('landing:footerLocation', { defaultValue: 'Kıbrıs / Girne' })}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span className="text-gray-300">+90 392 111 11 11</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span className="text-gray-300">info@yollabi.com.tr</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© 2025 YOLLABİ. {t('landing:allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;