import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Eye, EyeOff, FileText } from 'lucide-react';
import { signInWithRole } from '../../lib/authService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/ToastProvider';
import CorporateApplicationForm from '../../components/CorporateApplicationForm';

const CorporateLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithRole(email, password, 'corporate');
      showToast({
        type: 'success',
        title: t('auth:loginSuccessMessage'),
        message: '',
        duration: 3000
      });
      navigate('/corporate/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || t('auth:loginError');
      setError(errorMessage);
      
      // Hata tipine göre farklı mesajlar göster
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Geçersiz kimlik bilgileri')) {
        showToast({
          type: 'error',
          title: t('auth:invalidCredentials'),
          message: t('auth:invalidCredentialsSubMessage'),
          duration: 5000
        });
      } else if (errorMessage.includes('Email not confirmed') || errorMessage.includes('E-posta doğrulanmamış')) {
        showToast({
          type: 'error',
          title: t('auth:emailNotVerified'),
          message: t('auth:emailNotVerifiedSubMessage'),
          duration: 5000
        });
      } else {
        showToast({
          type: 'error',
          title: t('auth:loginErrorMessage'),
          message: t('auth:loginErrorSubMessage'),
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType={null} />
      
      <main className="flex-1 bg-gray-50 py-12 px-4 mt-16 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          {/* Login Form */}
          <div className="flex justify-center mb-16">
            <div className="w-full max-w-md">
              <div className="bg-white shadow-md rounded-lg p-8 animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Briefcase className="text-secondary" size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">{t('auth:loginAsCorporate')}</h1>
            <p className="text-gray-600 text-center mb-6">{t('auth:corporateLoginDescription')}</p>
            
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label={t('auth:corporateEmail')}
                type="email"
                placeholder="sirket@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth:password')}
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
                  <span className="ml-2 text-sm text-gray-600">{t('auth:rememberMe')}</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
                  {t('auth:forgotPassword')}
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                isLoading={isLoading}
                variant="secondary"
              >
                {t('auth:loginButton')}
              </Button>
            </form>
            
            <div className="text-center mt-6 space-y-3">
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowApplicationForm(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('auth:applicationForm', 'Başvuru Formu')}
              </Button>
            </div>
              </div>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('auth:howItWorksTitle')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('auth:step1Title')}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('auth:step1Description')}
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('auth:step2Title')}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('auth:step2Description')}
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('auth:step3Title')}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('auth:step3Description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {showApplicationForm && (
        <CorporateApplicationForm 
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
            showToast({
              type: 'success',
              title: 'Başvuru Gönderildi',
              message: 'Başvurunuz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
              duration: 5000
            });
          }}
        />
      )}
    </div>
  );
};

export default CorporateLogin;