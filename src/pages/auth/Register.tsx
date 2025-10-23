import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import RegisterForm from '../../components/RegisterForm';
import { signUp } from '../../lib/authService';
import { useToast } from '../../components/ui/ToastProvider';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [userType] = useState<'individual' | 'corporate' | null>(null);
  const [formData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  

  const handleRegisterFormSubmit = async (data: any) => {
    if (!data.agree) {
      setError(t('auth:termsRequired'));
      return;
    }
    setError('');
    try {
      const res = await signUp(data.email, data.password, {
        userType: userType || 'individual',
        name: `${data.name} ${data.surname}`.trim(),
        phone: data.phone,
        birthDate: data.birthDate,
        city: data.city,
        gender: data.gender,
        education: data.education,
        job: data.job,
        experience: data.experience,
        companyName: formData.companyName
      });
      if ((res as any)?.session) {
        showToast({
          type: 'success',
          title: t('auth:welcomeMessage'),
          message: t('auth:welcomeSubMessage'),
          duration: 5000
        });
        navigate('/individual/dashboard');
      } else {
        showToast({
          type: 'success',
          title: t('auth:registerSuccessMessage'),
          message: t('auth:registerSuccessSubMessage'),
          duration: 5000
        });
        navigate('/login/individual');
      }
    } catch (err: any) {
      const errorMessage = err.message || t('auth:registerError');
      setError(errorMessage);
      showToast({
        type: 'error',
        title: t('auth:registerErrorMessage'),
        message: t('auth:registerErrorSubMessage'),
        duration: 5000
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-lg p-8 animate-fadeIn">
            <h1 className="text-2xl font-bold text-center mb-2">{t('auth:registerAsIndividual')}</h1>
            <p className="text-gray-600 text-center mb-6">{t('auth:registerDescription')}</p>
            
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <RegisterForm onSubmit={handleRegisterFormSubmit} />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth:alreadyHaveAccount')}{' '}
                <Link 
                  to="/login/individual"
                  className="text-primary hover:underline font-medium"
                >
                  {t('auth:login')}
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

export default Register;