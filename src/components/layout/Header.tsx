import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, Briefcase, LogOut, Building, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import logo from '../../assets/logo.png';

interface HeaderProps {
  userType?: 'individual' | 'corporate' | null;
}

const Header: React.FC<HeaderProps> = ({ userType }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };
  
  const individualLinks = [
    { name: 'Ana Sayfa', path: '/individual/dashboard', icon: <Briefcase size={18} /> },
    { name: 'İş Ara', path: '/individual/jobs', icon: <Briefcase size={18} /> },
    { name: 'Başvurularım', path: '/individual/applications', icon: <Briefcase size={18} /> },
    { name: 'Bildirimler', path: '/individual/notifications', icon: <Bell size={18} /> },
    { name: 'Profilim', path: '/individual/profile', icon: <User size={18} /> },
  ];
  
  const corporateLinks = [
    { name: 'Ana Sayfa', path: '/corporate/dashboard', icon: <Briefcase size={18} /> },
    { name: 'İlan Oluştur', path: '/corporate/post-job', icon: <Briefcase size={18} /> },
    { name: 'İlanlarım', path: '/corporate/jobs', icon: <Briefcase size={18} /> },
    { name: 'Başvurular', path: '/corporate/applications', icon: <Briefcase size={18} /> },
    { name: 'Bildirimler', path: '/corporate/notifications', icon: <Bell size={18} /> },
    { name: 'Ayarlar', path: '/corporate/settings', icon: <User size={18} /> },
  ];
  
  const activeLinks = userType === 'individual' 
    ? individualLinks 
    : userType === 'corporate' 
      ? corporateLinks 
      : [];
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isLandingPage 
        ? "bg-transparent text-white" 
        : "bg-white shadow-sm text-foreground"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer select-none">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          
          {/* Desktop Nav */}
          {userType ? (
            <nav className="hidden md:flex space-x-8">
              {activeLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium flex items-center space-x-1 transition-colors",
                    location.pathname === link.path 
                      ? "text-primary" 
                      : isLandingPage 
                        ? "text-white hover:text-white/80" 
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="hidden lg:inline-flex">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className={cn(
                  "text-sm font-medium flex items-center space-x-1 transition-colors",
                  isLandingPage 
                    ? "text-white hover:text-white/80" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LogOut size={18} />
                <span>Çıkış</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex space-x-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/login/individual')}
                  variant="outline"
                  className="group relative px-6 py-2 text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <User className="w-5 h-5" />
                    Bireysel Giriş
                  </span>
                </Button>
                <Button
                  onClick={() => navigate('/login/corporate')}
                  className="group relative px-6 py-2 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Building className="w-5 h-5" />
                    Kurumsal Giriş
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className={isLandingPage && !mobileMenuOpen ? "text-white" : "text-foreground"} />
            ) : (
              <Menu className={isLandingPage && !mobileMenuOpen ? "text-white" : "text-foreground"} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-foreground shadow-lg animate-slideDown">
          <div className="container mx-auto px-4 py-3">
            {userType ? (
              <div className="flex flex-col space-y-4 py-2">
                {activeLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-md transition-colors",
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
                {userType === 'corporate' && (
                  <Link to="/corporate/jobs" className="flex items-center space-x-2 p-2 rounded-md text-foreground hover:bg-muted">
                    <Briefcase size={18} />
                    <span>İlanlarım</span>
                  </Link>
                )}
                <button
                  className="flex items-center space-x-2 p-2 rounded-md text-foreground hover:bg-muted"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Çıkış</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 py-2">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      navigate('/login/individual');
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="group relative px-6 py-2 text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <User className="w-5 h-5" />
                      Bireysel Giriş
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/login/corporate');
                      setMobileMenuOpen(false);
                    }}
                    className="group relative px-6 py-2 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Building className="w-5 h-5" />
                      Kurumsal Giriş
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </div>
              </div>
            )}
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