import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, User, ChevronLeft } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import RegisterForm from '../../components/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'individual' | 'corporate' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Kullanım şartlarını ve gizlilik politikasını kabul etmelisiniz.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the appropriate dashboard
      navigate('/individual/dashboard');
    } catch (err) {
      setError('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
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
            <h1 className="text-2xl font-bold text-center mb-2">Bireysel Kayıt</h1>
            <p className="text-gray-600 text-center mb-6">İş aramaya başlamak için hesabınızı oluşturun</p>
            
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Zaten bir hesabınız var mı?{' '}
                <Link 
                  to="/login/individual"
                  className="text-primary hover:underline font-medium"
                >
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

export default Register;