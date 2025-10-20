import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, X, Check, Award } from 'lucide-react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import avatar from '../../assets/avatar-user.png';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba, başvurunuz hakkında görüşmek isterim.",
      senderId: "corporate",
      timestamp: new Date(),
    }
  ]);

  // Mock başvuru verisi
  const application = {
    id: id,
    jobTitle: "Frontend Geliştirici",
    applicantName: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    phone: "+90 555 123 4567",
    location: "İstanbul",
    appliedDate: "2024-03-15",
    status: "Değerlendiriliyor",
    experience: [
      {
        title: "Frontend Geliştirici",
        company: "TechCorp",
        period: "2020 - 2023",
        description: "React, TypeScript ve Node.js kullanarak modern web uygulamaları geliştirdim."
      },
      {
        title: "Frontend Developer",
        company: "Innovative Solutions",
        period: "2018 - 2020",
        description: "Angular ve SCSS kullanarak ölçeklenebilir bir web uygulaması geliştirdim."
      }
    ],
    education: [
      {
        school: "İstanbul Teknik Üniversitesi",
        degree: "Bilgisayar Mühendisliği",
        period: "2014 - 2019",
        description: "GPA: 3.5"
      }
    ],
    skills: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
    coverLetter: "Merhaba, Frontend Geliştirici pozisyonu için başvurumu yapıyorum...",
    languages: [
      { name: "Türkçe", level: "Ana Dil", proficiency: 100 },
      { name: "İngilizce", level: "Orta", proficiency: 75 }
    ],
    certificates: [
      { name: "React Advanced", issuer: "Tech Academy", date: "2023" },
      { name: "Node.js Certification", issuer: "NodeSchool", date: "2022" }
    ]
  };

  // chat=1 parametresi varsa mesajlaşma aktif olsun
  const showChat = new URLSearchParams(location.search).get('chat') === '1';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: message,
        senderId: "corporate",
        timestamp: new Date(),
      }]);
      setMessage("");
      // Dummy bildirim oluştur
      const notifications = JSON.parse(localStorage.getItem('individual_notifications') || '[]');
      notifications.push({
        id: Date.now(),
        type: 'message',
        title: 'Yeni Mesaj',
        desc: 'Kurumsal taraftan yeni bir mesajınız var.',
        date: new Date().toLocaleString(),
        applicationId: application.id,
        read: false
      });
      localStorage.setItem('individual_notifications', JSON.stringify(notifications));
    }
  };

  const handleAccept = () => {
    alert('Başvuru kabul edildi!');
    // setShowChat(true);
  };

  const handleReject = () => {
    alert('Başvuru reddedildi!');
    // setShowChat(true);
  };

  return (
    <>
      <Header userType="corporate" />
      <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {application.applicantName} - {application.jobTitle}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Başvuru Tarihi: {application.appliedDate}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm md:text-base bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} /> Reddet
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm md:text-base bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} /> Kabul Et
            </button>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon: Başvuru Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Kişisel Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">{application.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">{application.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">{application.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">Başvuru: {application.appliedDate}</span>
                </div>
              </div>
            </div>

            {/* Deneyim */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Deneyim</h2>
              <div className="space-y-4">
                {application.experience.map((exp, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 mt-1">{exp.company}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{exp.period}</p>
                    <p className="text-sm md:text-base text-gray-700 mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eğitim */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Eğitim</h2>
              <div className="space-y-4">
                {application.education.map((edu, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">{edu.school}</h3>
                    <p className="text-sm md:text-base text-gray-600 mt-1">{edu.degree}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{edu.period}</p>
                    <p className="text-sm md:text-base text-gray-700 mt-2">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Özet Bilgiler */}
          <div className="space-y-6">
            {/* Yetenekler */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Yetenekler</h2>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Diller */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Diller</h2>
              <div className="space-y-3">
                {application.languages.map((lang, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm md:text-base text-gray-700">{lang.name}</span>
                      <span className="text-xs md:text-sm text-gray-500">{lang.level}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${lang.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sertifikalar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Sertifikalar</h2>
              <div className="space-y-3">
                {application.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="text-sm md:text-base font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">{cert.issuer} - {cert.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetail; 