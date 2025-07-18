import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl">YOLLABİ</span>
            </div>
            <p className="text-gray-300 text-sm">
              YOLLABİ, iş arayanlar ve işverenler için Kıbrıs'in en kapsamlı kariyer platformudur. Hayalinizdeki işi bulmak veya en iyi yetenekleri keşfetmek için doğru yerdesiniz.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">İş Kategorileri</h3>
            <ul className="space-y-2">
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">Bilgi Teknolojileri</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">Finans</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">Pazarlama</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">Otel</Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-primary transition-colors">Sağlık</Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300">Kıbrıs / Girne</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <span className="text-gray-300">+90 392 111 11 11</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span className="text-gray-300">info@yollabi.com.tr</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2025 YOLLABİ. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;