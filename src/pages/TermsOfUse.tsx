import React from 'react';

const TermsOfUse = () => (
  <div className="container mx-auto px-4 py-10 max-w-2xl">
    <h1 className="text-2xl font-bold mb-4">Kullanım Şartları</h1>
    <p className="mb-2 text-gray-700">Bu sayfa, platformun kullanımına ilişkin kuralları ve şartları açıklar. Platformu kullanarak bu şartları kabul etmiş olursunuz.</p>
    <ul className="list-disc pl-6 text-gray-700 mb-4">
      <li>Platform yalnızca yasal amaçlarla kullanılabilir.</li>
      <li>Kullanıcılar, sağladıkları bilgilerin doğruluğundan sorumludur.</li>
      <li>Hizmetlerde değişiklik yapma hakkı saklıdır.</li>
      <li>Kurallara uymayan kullanıcıların hesapları askıya alınabilir.</li>
    </ul>
    <p className="text-gray-600 text-sm">Daha fazla bilgi için bizimle iletişime geçebilirsiniz.</p>
  </div>
);

export default TermsOfUse; 