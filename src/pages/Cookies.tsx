import React from 'react';

const Cookies = () => (
  <div className="container mx-auto px-4 py-10 max-w-2xl">
    <h1 className="text-2xl font-bold mb-4">Çerezler</h1>
    <p className="mb-2 text-gray-700">Bu sayfa, çerezlerin (cookies) nasıl kullanıldığı hakkında bilgi verir. Çerezler, kullanıcı deneyimini geliştirmek ve hizmetlerimizi daha iyi sunmak için kullanılır.</p>
    <ul className="list-disc pl-6 text-gray-700 mb-4">
      <li>Çerezler, siteyi ziyaret ettiğinizde tarayıcınıza kaydedilir.</li>
      <li>Çerezler, tercihlerinizi hatırlamak ve oturumunuzu yönetmek için kullanılır.</li>
      <li>Çerez ayarlarınızı tarayıcınızdan değiştirebilirsiniz.</li>
    </ul>
    <p className="text-gray-600 text-sm">Çerezler hakkında daha fazla bilgi için bizimle iletişime geçebilirsiniz.</p>
  </div>
);

export default Cookies; 