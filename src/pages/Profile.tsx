import React, { useState } from 'react';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    skills: [],
    experiences: [],
    educations: [],
    languages: [],
  });

  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    about: string;
    skills: string[];
    experiences: Array<{ title: string; company: string; date: string; desc: string }>;
    educations: Array<{ degree: string; school: string; date: string; desc: string }>;
    languages: Array<{ name: string; level: string }>;
    [key: string]: any; // Index signature to allow string indexing
  }>({
    name: profile.name,
    title: profile.title,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    about: profile.about,
    skills: profile.skills,
    experiences: profile.experiences,
    educations: profile.educations,
    languages: profile.languages,
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    date: '',
    desc: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: any) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const openPopup = (field: string) => {
    setCurrentField(field);
    setIsPopupOpen(true);
    if (field === 'experiences') {
      setNewExperience({
        title: '',
        company: '',
        date: '',
        desc: ''
      });
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setNewExperience({
      title: '',
      company: '',
      date: '',
      desc: ''
    });
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExperience = () => {
    if (newExperience.title.trim() && newExperience.company.trim()) {
      setFormData(prev => ({
        ...prev,
        experiences: [...prev.experiences, newExperience]
      }));
      closePopup();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Burada formData'yı API'ye gönderme işlemi yapılabilir
    console.log('Form data:', formData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">İsim</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Unvan</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">E-posta</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Telefon</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Konum</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Hakkımda</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Beceriler</label>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleArrayChange('skills', index, '')}
                className="ml-2 text-red-500"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => openPopup('skills')}
            className="mt-2 text-indigo-500"
          >
            Beceri Ekle
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">İş Deneyimi</label>
          {formData.experiences.map((exp, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <input
                type="text"
                placeholder="Başlık"
                value={exp.title}
                onChange={(e) => handleArrayChange('experiences', index, { ...exp, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Şirket"
                value={exp.company}
                onChange={(e) => handleArrayChange('experiences', index, { ...exp, company: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Tarih"
                value={exp.date}
                onChange={(e) => handleArrayChange('experiences', index, { ...exp, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Açıklama"
                value={exp.desc}
                onChange={(e) => handleArrayChange('experiences', index, { ...exp, desc: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleArrayChange('experiences', index, null)}
                className="mt-2 text-red-500"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => openPopup('experiences')}
            className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
          >
            Deneyim Ekle
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Eğitim</label>
          {formData.educations.map((edu, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                placeholder="Derece"
                value={edu.degree}
                onChange={(e) => handleArrayChange('educations', index, { ...edu, degree: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Okul"
                value={edu.school}
                onChange={(e) => handleArrayChange('educations', index, { ...edu, school: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Tarih"
                value={edu.date}
                onChange={(e) => handleArrayChange('educations', index, { ...edu, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Açıklama"
                value={edu.desc}
                onChange={(e) => handleArrayChange('educations', index, { ...edu, desc: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleArrayChange('educations', index, null)}
                className="mt-2 text-red-500"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => openPopup('educations')}
            className="mt-2 text-indigo-500"
          >
            Eğitim Ekle
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Diller</label>
          {formData.languages.map((lang, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Dil"
                value={lang.name}
                onChange={(e) => handleArrayChange('languages', index, { ...lang, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Seviye"
                value={lang.level}
                onChange={(e) => handleArrayChange('languages', index, { ...lang, level: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleArrayChange('languages', index, null)}
                className="ml-2 text-red-500"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => openPopup('languages')}
            className="mt-2 text-indigo-500"
          >
            Dil Ekle
          </button>
        </div>
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
        >
          Kaydet
        </button>
      </form>
      {isPopupOpen && currentField === 'experiences' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Deneyim Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Başlık</label>
                <input
                  type="text"
                  name="title"
                  value={newExperience.title}
                  onChange={handleExperienceChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Örn: Yazılım Geliştirici"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Şirket</label>
                <input
                  type="text"
                  name="company"
                  value={newExperience.company}
                  onChange={handleExperienceChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Örn: ABC Teknoloji"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tarih</label>
                <input
                  type="text"
                  name="date"
                  value={newExperience.date}
                  onChange={handleExperienceChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Örn: 2020 - 2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  name="desc"
                  value={newExperience.desc}
                  onChange={handleExperienceChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="İş deneyiminizi kısaca açıklayın"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closePopup}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 