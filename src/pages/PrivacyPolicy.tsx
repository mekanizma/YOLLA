import React from 'react';

const PrivacyPolicy = () => (
  <div className="container mx-auto px-4 py-10 max-w-2xl">
    <h1 className="text-2xl font-bold mb-4">Gizlilik Politikası</h1>
    <p className="mb-2 text-gray-700">Bu sayfa, kullanıcıların kişisel verilerinin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi verir. Kişisel bilgilerinizin gizliliğine önem veriyoruz ve verilerinizi yasalara uygun şekilde işleriz.</p>
    <ul className="list-disc pl-6 text-gray-700 mb-4">
      <li>Kişisel verileriniz yalnızca hizmet sunmak ve geliştirmek amacıyla kullanılır.</li>
      <li>Verileriniz üçüncü şahıslarla paylaşılmaz.</li>
      <li>Çerezler ve benzeri teknolojiler kullanıcı deneyimini iyileştirmek için kullanılır.</li>
      <li>Veri güvenliği için gerekli tüm teknik ve idari önlemler alınır.</li>
    </ul>
    <p className="text-gray-600 text-sm">Daha fazla bilgi için bizimle iletişime geçebilirsiniz.</p>
  </div>
);

export default PrivacyPolicy; 