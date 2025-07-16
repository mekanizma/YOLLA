import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
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
    experience: "3 yıl",
    education: "Bilgisayar Mühendisliği",
    skills: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
    coverLetter: "Merhaba, Frontend Geliştirici pozisyonu için başvurumu yapıyorum...",
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

  const handleAcceptApplication = () => {
    // setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="corporate" />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Başvuru Başlığı */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{application.jobTitle}</h1>
                <p className="text-gray-600">Başvuran: {application.applicantName}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/corporate/applications')}
                >
                  Geri Dön
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol Kolon: Başvuru Detayları */}
            <div className="lg:col-span-2 space-y-6">
              {/* Kişisel Bilgiler */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Kişisel Bilgiler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{application.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{application.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{application.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Başvuru: {application.appliedDate}</span>
                  </div>
                </div>
              </div>

              {/* Deneyim ve Eğitim */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Deneyim ve Eğitim</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Deneyim</h3>
                    <p>{application.experience}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Eğitim</h3>
                    <p>{application.education}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Yetenekler</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {application.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivasyon Mektubu */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Motivasyon Mektubu</h2>
                <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
              </div>
            </div>

            {/* Sağ Kolon: Mesajlaşma */}
            {showChat && (
              <div className="bg-white rounded-2xl shadow-2xl p-0 h-[600px] flex flex-col border border-gray-100 w-full lg:max-w-sm">
                {/* Başlık ve Kullanıcı */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 rounded-t-2xl bg-gray-50">
                  <img src={avatar} alt="Kullanıcı" className="w-10 h-10 rounded-full border border-gray-200" />
                  <div>
                    <div className="font-semibold text-gray-800">{application.applicantName}</div>
                    <div className="text-xs text-gray-500">Aday</div>
                  </div>
                </div>
                {/* Mesajlar Listesi */}
                <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4 bg-white">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === "corporate" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm break-words ${
                          msg.senderId === "corporate"
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <span className="text-[11px] text-gray-300 mt-1 block text-right">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mesaj Gönderme Formu */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center border-t border-gray-100 bg-gray-50 rounded-b-2xl px-4 py-6"
                >
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 h-9 text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <Button
                      type="submit"
                      className="h-8 px-6 text-sm whitespace-nowrap"
                      style={{ minWidth: 0 }}
                    >
                      Gönder
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDetail; 