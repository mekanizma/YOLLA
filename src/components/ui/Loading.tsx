import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  text, 
  size = 'md',
  className = ''
}) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const displayText = text || t('common:loading');

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mb-2`} />
      <p className="text-sm text-gray-600">{displayText}</p>
    </div>
  );
};

export default Loading;
