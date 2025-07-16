import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setIsSubmitted(true);
    } catch (err) {
      setError('İşlem başarısız oldu. Lütfen tekrar deneyin.');
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
                <Mail className="text-primary" size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Şifremi Unuttum</h1>
            
            {!isSubmitted ? (
              <>
                <p className="text-gray-600 text-center mb-6">
                  E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </p>
                
                {error && (
                  <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="E-posta Adresi"
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    isLoading={isLoading}
                  >
                    Şifre Sıfırlama Bağlantısı Gönder
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
                
                <h2 className="text-xl font-semibold mb-2">E-posta Gönderildi</h2>
                <p className="text-gray-600 mb-6">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/')}
                >
                  Ana Sayfaya Dön
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

export default ForgotPassword;