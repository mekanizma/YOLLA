import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold mt-6">Sayfa Bulunamadı</h2>
          <p className="mt-3 text-gray-600 max-w-md mx-auto">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir. Ana sayfaya dönerek devam edebilirsiniz.
          </p>
          
          <div className="mt-8">
            <Link to="/">
              <Button variant="primary" className="inline-flex items-center">
                <ArrowLeft className="mr-2" size={16} />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;