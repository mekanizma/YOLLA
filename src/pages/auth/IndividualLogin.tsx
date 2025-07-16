import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, User } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const IndividualLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, always succeed
      navigate('/individual/dashboard');
    } catch (err) {
      setError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-lg p-8 animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="text-primary" size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Bireysel Giriş</h1>
            <p className="text-gray-600 text-center mb-6">Hesabınıza giriş yaparak iş aramaya devam edin</p>
            
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="E-posta Adresi"
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Beni Hatırla</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>
              
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Giriş Yap
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Henüz hesabınız yok mu?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Hemen Kaydolun
                </Link>
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link to="/login/corporate" className="text-sm text-gray-600 hover:text-primary flex items-center justify-center">
              <Briefcase className="mr-1" size={16} />
              <span>Kurumsal kullanıcıysanız, buradan giriş yapabilirsiniz</span>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default IndividualLogin;