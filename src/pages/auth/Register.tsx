import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
// Kullanılmayan bileşen importlarını kaldırdım
import RegisterForm from '../../components/RegisterForm';
import { signUp } from '../../lib/authService';

const Register = () => {
  const navigate = useNavigate();
  const [userType] = useState<'individual' | 'corporate' | null>(null);
  const [formData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
  });
  // isLoading kullanılmadığı için kaldırıldı
  const [error, setError] = useState('');
  

  const handleRegisterFormSubmit = async (data: any) => {
    if (!data.agree) {
      setError('Kullanım şartlarını ve gizlilik politikasını kabul etmelisiniz.');
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
        navigate('/individual/dashboard');
      } else {
        alert('Kayıt başarılı! Lütfen e-posta adresinize gelen doğrulama linkine tıklayın ardından giriş yapın.');
        navigate('/login/individual');
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
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
            
            <RegisterForm onSubmit={handleRegisterFormSubmit} />
            
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