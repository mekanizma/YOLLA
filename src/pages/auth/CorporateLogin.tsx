import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import { signInWithRole } from '../../lib/authService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CorporateLogin = () => {
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
      await signInWithRole(email, password, 'corporate');
      navigate('/corporate/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
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
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Briefcase className="text-secondary" size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Kurumsal Giriş</h1>
            <p className="text-gray-600 text-center mb-6">Şirket hesabınıza giriş yaparak ilanlarınızı yönetin</p>
            
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Şirket E-posta Adresi"
                type="email"
                placeholder="sirket@mail.com"
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
                    className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Beni Hatırla</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                isLoading={isLoading}
                variant="secondary"
              >
                Giriş Yap
              </Button>
            </form>
            
            <div className="text-center mt-6">
              <Link to="/login/individual" className="text-sm text-gray-600 hover:text-secondary flex items-center justify-center">
                <span className="mr-1 w-4 h-4 flex items-center justify-center">👤</span>
                <span>Bireysel kullanıcıysanız, buradan giriş yapabilirsiniz</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CorporateLogin;