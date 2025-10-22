import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, Briefcase, LogOut, Building, Home, Plus, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import BlobButton from '../ui/BlobButton';
import LiquidButton from '../ui/LiquidButton';
import LanguageSwitcher from '../LanguageSwitcher';
import yollabiLogo from '../../assets/yollabi-logo.svg';

interface HeaderProps {
  userType?: 'individual' | 'corporate' | null;
  scrolled?: boolean;
}

const Header: React.FC<HeaderProps> = ({ userType, scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';
  
  // Check if we're on login pages
  const isLoginPage = location.pathname.startsWith('/login/');
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };
  
  const individualLinks = [
    { name: t('dashboard:individualDashboard'), path: '/individual/dashboard', icon: <Home size={16} /> },
    { name: t('jobs:searchJobs'), path: '/individual/jobs', icon: <Briefcase size={16} /> },
    { name: t('dashboard:myApplications'), path: '/individual/applications', icon: <Briefcase size={16} /> },
    { name: t('dashboard:notifications'), path: '/individual/notifications', icon: <Bell size={16} /> },
    { name: t('dashboard:myProfile'), path: '/individual/profile', icon: <User size={16} /> },
  ];
  
  const corporateLinks = [
    { name: t('dashboard:corporateDashboard'), path: '/corporate/dashboard', icon: <Home size={16} /> },
    { name: t('jobs:postNewJob'), path: '/corporate/post-job', icon: <Plus size={16} /> },
    { name: t('dashboard:myJobs'), path: '/corporate/jobs', icon: <Briefcase size={16} /> },
    { name: t('dashboard:applications'), path: '/corporate/applications', icon: <User size={16} /> },
    { name: t('dashboard:notifications'), path: '/corporate/notifications', icon: <Bell size={16} /> },
    { name: t('dashboard:settings'), path: '/corporate/settings', icon: <Settings size={16} /> },
  ];
  
  const activeLinks = userType === 'individual' 
    ? individualLinks 
    : userType === 'corporate' 
      ? corporateLinks 
      : [];
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isLandingPage && !scrolled
        ? "bg-transparent text-white backdrop-blur-none"
        : "bg-white/95 backdrop-blur-md shadow-lg text-foreground border-b border-gray-100"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer select-none group">
            <div className="relative">
              <img 
                src={yollabiLogo} 
                alt="YOLLABİ Logo" 
                className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                style={{ filter: isLandingPage && !scrolled ? 'brightness(0) invert(1)' : 'none' }}
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          </Link>
          
          {/* Desktop Nav */}
          {userType ? (
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-2">
                {activeLinks.map((link) => (
                  <LiquidButton
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    active={location.pathname === link.path}
                    dark={isLandingPage && !scrolled}
                    icon={link.icon}
                  >
                    {link.name}
                  </LiquidButton>
                ))}
                <LiquidButton
                  onClick={handleLogout}
                  dark={isLandingPage && !scrolled}
                  icon={<LogOut size={16} />}
                >
                  {t('common:logout')}
                </LiquidButton>
              </nav>
              {/* Language switcher hidden after login as requested */}
            </div>
          ) : !isLoginPage ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center gap-4">
                <BlobButton
                  onClick={() => navigate('/login/individual')}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t('auth:loginAsIndividual')}
                </BlobButton>
                <BlobButton
                  onClick={() => navigate('/login/corporate')}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  {t('auth:loginAsCorporate')}
                </BlobButton>
              </div>
              <LanguageSwitcher 
                variant="dropdown" 
                className={isLandingPage && !scrolled ? "text-white" : ""}
              />
            </div>
          ) : null}
          
          {/* Mobile menu button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-xl transition-all duration-300 hover:bg-white/10",
              isLandingPage && !scrolled ? "text-white hover:bg-white/20" : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md text-foreground shadow-xl border-t border-gray-100 animate-slideDown">
          <div className="container mx-auto px-4 py-4">
            {userType ? (
              <div className="flex flex-col space-y-2 py-2">
                {activeLinks.map((link) => (
                  <LiquidButton
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    active={location.pathname === link.path}
                    icon={link.icon}
                    className="justify-start"
                  >
                    {link.name}
                  </LiquidButton>
                ))}
                {userType === 'corporate' && (
                  <LiquidButton
                    onClick={() => {
                      navigate('/corporate/jobs');
                      setMobileMenuOpen(false);
                    }}
                    icon={<Briefcase size={16} />}
                    className="justify-start"
                  >
                    İlanlarım
                  </LiquidButton>
                )}
                <LiquidButton
                  onClick={handleLogout}
                  icon={<LogOut size={16} />}
                  className="justify-start"
                >
                  {t('common:logout')}
                </LiquidButton>
              </div>
            ) : !isLoginPage ? (
              <div className="flex flex-col space-y-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <BlobButton
                    onClick={() => {
                      navigate('/login/individual');
                      setMobileMenuOpen(false);
                    }}
                    variant="primary"
                    className="flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t('auth:loginAsIndividual')}
                  </BlobButton>
                  <BlobButton
                    onClick={() => {
                      navigate('/login/corporate');
                      setMobileMenuOpen(false);
                    }}
                    variant="secondary"
                    className="flex items-center justify-center gap-2"
                  >
                    <Building className="w-4 h-4" />
                    {t('auth:loginAsCorporate')}
                  </BlobButton>
                </div>
                <div className="flex justify-center pt-4">
                  <LanguageSwitcher variant="buttons" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Header;