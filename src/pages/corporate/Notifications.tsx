import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  Collapse,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Header from '../../components/layout/Header';
import { Trash2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Zamanı insan okunur hale getiren fonksiyon
function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60 * 60) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 60 * 60 * 24) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 60 * 60 * 24 * 7) return `${Math.floor(diff / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

interface Notification {
  id: number;
  type: 'application' | 'job' | 'system' | 'profile' | 'interview' | 'result' | 'suggestion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'application',
    title: 'Başvurunuz Değerlendiriliyor',
    message: '"Yazılım Geliştirici" pozisyonu için başvurunuz inceleme aşamasına geçmiştir.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
    read: false,
  },
  {
    id: 2,
    type: 'interview',
    title: 'Mülakat Daveti',
    message: 'ABC Teknoloji firması sizi "UX Tasarımcısı" pozisyonu için mülakata davet ediyor.',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 gün önce
    read: false,
  },
  {
    id: 3,
    type: 'suggestion',
    title: 'Yeni İş İlanı Önerisi',
    message: 'Profilinize uygun yeni bir iş ilanı bulundu: "Veri Analisti" - Data Insights Ltd.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
    read: false,
  },
  {
    id: 4,
    type: 'result',
    title: 'Başvuru Sonucu',
    message: '"Müşteri İlişkileri Uzmanı" pozisyonu için başvurunuz olumlu sonuçlandı.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 hafta önce
    read: true,
  },
  {
    id: 5,
    type: 'profile',
    title: 'Profiliniz İncelendi',
    message: 'XYZ Dijital şirketi profilinizi inceledi.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 hafta önce
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'application':
      return <NotificationsIcon color="primary" />;
    case 'interview':
      return <EventAvailableIcon color="success" />;
    case 'suggestion':
      return <WorkIcon color="secondary" />;
    case 'result':
      return <DoneAllIcon color="warning" />;
    case 'profile':
      return <VisibilityIcon color="action" />;
    default:
      return <NotificationsIcon color="disabled" />;
  }
};

const tabLabels = ['TÜMÜ', 'OKUNMAMIŞ', 'OKUNMUŞ', 'MESAJLAR'];

type TabType = 'all' | 'unread' | 'read' | 'messages';

const CorporateNotifications: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [tab, setTab] = useState<TabType | 'messages'>('all');
  const [openDetailId, setOpenDetailId] = useState<number | null>(null);
  const [chats, setChats] = useState<any[]>([]);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue === 0 ? 'all' : newValue === 1 ? 'unread' : newValue === 2 ? 'read' : 'messages');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setOpenDetailId((prev) => (prev === id ? null : id));
  };

  const handleDeleteNotification = (id: number) => {
    const updated = notifications.filter((n: any) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('corporate_notifications', JSON.stringify(updated));
  };

  const filteredNotifications =
    tab === 'all'
      ? notifications
      : tab === 'unread'
      ? notifications.filter(n => !n.read)
      : tab === 'read'
      ? notifications.filter(n => n.read)
      : [];

  // Bildirimleri en yeni en üstte olacak şekilde sırala
  const sortedNotifications = [...filteredNotifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    if (tab === 'messages') {
      setChats(JSON.parse(localStorage.getItem('corporate_chats') || '[]'));
    }
  }, [tab]);

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ mt: 8, minHeight: '100vh', bgcolor: '#f7fafd' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              mb: 2,
              gap: isMobile ? 2 : 0,
            }}
          >
            <Tabs
              value={tab === 'all' ? 0 : tab === 'unread' ? 1 : tab === 'read' ? 2 : 3}
              onChange={(_, v) => setTab(['all', 'unread', 'read', 'messages'][v])}
              textColor="primary"
              indicatorColor="primary"
              variant={isMobile ? 'scrollable' : 'standard'}
              sx={{ minHeight: 40 }}
            >
              {tabLabels.map(label => (
                <Tab key={label} label={label} sx={{ fontWeight: 500, minWidth: 100 }} />
              ))}
            </Tabs>
            <Button
              onClick={markAllAsRead}
              sx={{
                color: '#1746a2',
                fontWeight: 500,
                alignSelf: isMobile ? 'flex-end' : 'center',
                fontSize: 14,
                textTransform: 'none',
              }}
            >
              TÜMÜNÜ OKUNDU İŞARETLE
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tab === 'messages' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {chats.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    Hiç mesajlaşma yok.
                  </Paper>
                ) : (
                  chats.map(chat => (
                    <Link
                      key={chat.id}
                      to={`/corporate/chat/${chat.id}`}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:bg-blue-50 transition"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">{chat.name}</div>
                        <div className="text-gray-500 text-sm truncate max-w-xs">{chat.lastMessage}</div>
                      </div>
                      <div className="text-xs text-gray-400 ml-4 whitespace-nowrap">{chat.lastTime}</div>
                    </Link>
                  ))
                )}
              </Box>
            ) : (
              sortedNotifications.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  Bildirim bulunamadı.
                </Paper>
              )
            )}
            {sortedNotifications.map((notification) => (
              <Box key={notification.id}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    border: '1px solid #e3e8ef',
                    bgcolor: notification.read ? '#fff' : '#f0f6ff',
                    boxShadow: notification.read ? 'none' : '0 2px 8px #e3e8ef44',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <Avatar sx={{ bgcolor: '#fff', border: '1px solid #e3e8ef', width: 44, height: 44 }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} fontSize={16} mb={0.5}>
                      {notification.title}
                    </Typography>
                    <Typography fontSize={15} color="text.secondary">
                      {notification.message}
                    </Typography>
                  </Box>
                  <Typography fontSize={14} color="text.secondary" sx={{ minWidth: 90, textAlign: 'right' }}>
                    {timeAgo(notification.timestamp)}
                  </Typography>
                  <button
                    style={{ marginLeft: 8, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); handleDeleteNotification(notification.id); }}
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </Paper>
                <Collapse in={openDetailId === notification.id} timeout="auto" unmountOnExit>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 0.5,
                      mb: 1,
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                      border: '1px solid #e3e8ef',
                      bgcolor: '#f9fbfd',
                      fontSize: 15,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography fontWeight={600} mb={1}>
                      Bildirim Detayı
                    </Typography>
                    <Typography>
                      {notification.message}
                    </Typography>
                    <Typography fontSize={13} color="text.disabled" mt={2}>
                      Bildirim tarihi: {new Date(notification.timestamp).toLocaleString('tr-TR')}
                    </Typography>
                  </Paper>
                </Collapse>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CorporateNotifications; 