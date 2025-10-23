import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import supabase from '../../lib/supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // URL'den access_token ve refresh_token'ı al
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Supabase session'ını set et
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login/individual');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
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
            <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
              <ArrowLeft size={16} />
              <span className="ml-1">Geri Dön</span>
            </Link>
            
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="text-primary" size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Yeni Şifre Belirle</h1>
            
            {!isSuccess ? (
              <>
                <p className="text-gray-600 text-center mb-6">
                  Yeni şifrenizi girin ve onaylayın.
                </p>
                
                {error && (
                  <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Yeni Şifre"
                      type={showPassword ? "text" : "password"}
                      placeholder="En az 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Input
                      label="Şifreyi Onayla"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Şifreyi tekrar girin"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    isLoading={isLoading}
                  >
                    Şifreyi Güncelle
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">Şifre Güncellendi</h2>
                <p className="text-gray-600 mb-6">
                  Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/login/individual')}
                >
                  Giriş Sayfasına Git
                </Button>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Giriş yapabiliyor musunuz?{' '}
                <Link to="/login/individual" className="text-primary hover:underline font-medium">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
