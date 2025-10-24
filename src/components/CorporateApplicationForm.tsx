import React, { useState } from 'react';
import { X, Send, Check, Building2, User, Phone, Mail } from 'lucide-react';
import { submitCorporateApplication } from '../lib/corporateApplicationService';
import { useTranslation } from 'react-i18next';

interface CorporateApplicationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CorporateApplicationForm: React.FC<CorporateApplicationFormProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setIsSent(true);

    try {
      await submitCorporateApplication(formData);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Başvuru gönderilirken bir hata oluştu');
      setIsSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto border border-gray-100 relative">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">{t('corporateApplication:title', 'Başvuru Formu')}</h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-white/90 text-lg font-medium leading-relaxed">
              {t('corporateApplication:subtitle', 'BU FORMU DOLDURUN YOLLABİ KURUMSAL HESABINIZI OLUŞTURALIM')}
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Building2 size={16} className="text-teal-500" />
                {t('corporateApplication:companyName', 'Firma Adı')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('corporateApplication:companyNamePlaceholder', 'Firma Adı')}
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  className="w-full px-4 py-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50"
                />
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User size={16} className="text-teal-500" />
                {t('corporateApplication:fullName', 'Ad Soyad')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('corporateApplication:fullNamePlaceholder', 'Ad Soyad')}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="w-full px-4 py-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone size={16} className="text-teal-500" />
                {t('corporateApplication:phone', 'Telefon Numaranız')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder={t('corporateApplication:phonePlaceholder', 'Telefon Numaranız')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="w-full px-4 py-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50"
                />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail size={16} className="text-teal-500" />
                {t('corporateApplication:email', 'E-posta')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t('corporateApplication:emailPlaceholder', 'E-posta')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full px-4 py-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className={`button ${isSent ? 'sent' : ''}`}
                disabled={isLoading}
              >
                <div className="outline"></div>
                <div className={`state ${isSent ? 'state--sent' : 'state--default'}`}>
                  <div className="icon">
                    {isSent ? (
                      <Check size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                  </div>
                  <p>
                    {isSent ? (
                      <>
                        <span style={{ '--i': 0 } as React.CSSProperties}>G</span>
                        <span style={{ '--i': 1 } as React.CSSProperties}>Ö</span>
                        <span style={{ '--i': 2 } as React.CSSProperties}>N</span>
                        <span style={{ '--i': 3 } as React.CSSProperties}>D</span>
                        <span style={{ '--i': 4 } as React.CSSProperties}>E</span>
                        <span style={{ '--i': 5 } as React.CSSProperties}>R</span>
                        <span style={{ '--i': 6 } as React.CSSProperties}>İ</span>
                        <span style={{ '--i': 7 } as React.CSSProperties}>L</span>
                        <span style={{ '--i': 8 } as React.CSSProperties}>D</span>
                        <span style={{ '--i': 9 } as React.CSSProperties}>İ</span>
                      </>
                    ) : (
                      <>
                        <span style={{ '--i': 0 } as React.CSSProperties}>G</span>
                        <span style={{ '--i': 1 } as React.CSSProperties}>Ö</span>
                        <span style={{ '--i': 2 } as React.CSSProperties}>N</span>
                        <span style={{ '--i': 3 } as React.CSSProperties}>D</span>
                        <span style={{ '--i': 4 } as React.CSSProperties}>E</span>
                        <span style={{ '--i': 5 } as React.CSSProperties}>R</span>
                      </>
                    )}
                  </p>
                </div>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              {t('corporateApplication:footer', 'Başvurunuzu gönderdikten sonra en kısa sürede size dönüş yapacağız.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateApplicationForm;
