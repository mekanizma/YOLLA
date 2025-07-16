import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Header from '../../components/layout/Header';

interface ChatItem {
  id: number;
  name: string;
  lastMessage: string;
  lastTime: string;
}

const Chats = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    // Dummy: localStorage'dan chatleri oku
    const chatList = JSON.parse(localStorage.getItem('individual_chats') || '[]');
    setChats(chatList);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header userType="individual" />
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
          <MessageCircle /> Mesajlarım
        </h2>
        {chats.length === 0 ? (
          <div className="text-gray-400 text-center py-12">Hiç mesajlaşma yok.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {chats.map(chat => (
              <li key={chat.id}>
                <Link
                  to={`/individual/chat/${chat.id}`}
                  className="flex items-center justify-between py-4 px-2 hover:bg-blue-50 rounded-lg transition"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{chat.name}</div>
                    <div className="text-gray-500 text-sm truncate max-w-xs">{chat.lastMessage}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-4 whitespace-nowrap">{chat.lastTime}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Chats; 