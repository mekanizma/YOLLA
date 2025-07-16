import { useState, useEffect, useRef } from 'react';
import Header from './layout/Header';

interface Message {
  id: number;
  text: string;
  senderId: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Merhaba, iş başvurunuz hakkında konuşmak isterim.",
      senderId: "other",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const currentUserId = "current";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const dummyMessages = [
        "İş deneyiminiz hakkında biraz daha bilgi alabilir miyim?",
        "Maaş beklentiniz nedir?",
        "Ne zaman müsait olursunuz?",
      ];
      
      const randomMessage = dummyMessages[Math.floor(Math.random() * dummyMessages.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: randomMessage,
        senderId: "other",
        timestamp: new Date(),
      }]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: newMessage,
        senderId: currentUserId,
        timestamp: new Date(),
      }]);
      // Dummy olarak chat kaydını localStorage'a ekle
      const chatId = 1; // Dummy: gerçek uygulamada başvuru id'si veya karşı taraf id'si olmalı
      const chatName = "Aday"; // Dummy: gerçek uygulamada karşı taraf adı olmalı
      const chatList = JSON.parse(localStorage.getItem('individual_chats') || '[]');
      const lastTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const existing = chatList.find((c: any) => c.id === chatId);
      if (existing) {
        existing.lastMessage = newMessage;
        existing.lastTime = lastTime;
      } else {
        chatList.push({ id: chatId, name: chatName, lastMessage: newMessage, lastTime });
      }
      localStorage.setItem('individual_chats', JSON.stringify(chatList));
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100">
      <Header userType="individual" />
      <div className="flex flex-1 items-center justify-center py-6">
        <div className="w-full max-w-lg h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-400 text-white">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-blue-500 font-bold text-xl shadow">
              <span>👤</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">TechSoft A.Ş. ile Sohbet</div>
              <div className="text-xs text-blue-100">Gizli ve güvenli iletişim</div>
            </div>
            <div className="text-xs opacity-80">Aktif</div>
          </div>

          {/* Mesajlar Alanı */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-b from-white to-blue-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow text-sm break-words ${
                    message.senderId === currentUserId
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-gray-200 text-gray-800 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                  <span className="text-[11px] text-gray-300 mt-1 block text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Mesaj Gönderme Formu */}
          <form onSubmit={handleSendMessage} className="flex items-center border-t border-gray-100 bg-gray-50 px-4 py-4 gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 h-10 text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <button
              type="submit"
              className="h-10 px-5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 