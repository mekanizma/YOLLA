import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Tabs,
  Tab,
  Stack,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import supabase from '../../lib/supabaseClient';
import { getCorporateNotifications, deleteNotification, markNotificationRead } from '../../lib/notificationsService';
import { fetchCompanyByEmail } from '../../lib/jobsService';

type TabType = 'all' | 'unread' | 'read' | 'messages';

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const tabLabels = ['Tümü', 'Okunmamış', 'Okunmuş', 'Mesajlar'];

const CorporateNotifications: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<TabType>('all');
  const [chats, setChats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;
        
        const company = await fetchCompanyByEmail(user.email || '');
        if (!company) return;
        
        const data = await getCorporateNotifications(company.id);
        const mapped: Notification[] = (data as any[]).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          read: n.is_read || false,
          type: n.type || 'info',
        }));
        setNotifications(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    };
    load();
  }, []);

  const handleTabChange = (_: any, newValue: number) => {
    const tabValues: TabType[] = ['all', 'unread', 'read', 'messages'];
    setTab(tabValues[newValue]);
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      for (const id of unreadIds) {
        await markNotificationRead(id);
      }
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
  };

  // Bildirimleri en yeni en üstte olacak şekilde sırala
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  useEffect(() => {
    if (tab === 'messages') {
      // Mesajlar için ayrı bir servis gerekebilir
      setChats([]);
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
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600 }}>
              Bildirimler
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
              <Tabs
                value={tab === 'all' ? 0 : tab === 'unread' ? 1 : tab === 'read' ? 2 : 3}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  minHeight: 40,
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    minWidth: isMobile ? 'auto' : 100,
                    py: 1,
                  },
                }}
              >
                {tabLabels.map(label => (
                  <Tab key={label} label={label} />
                ))}
              </Tabs>
              <Button
                onClick={markAllAsRead}
                sx={{
                  color: '#1746a2',
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                TÜMÜNÜ OKUNDU İŞARETLE
              </Button>
            </Box>
          </Box>

          {tab === 'messages' ? (
            <Box sx={{ mt: 4 }}>
              {chats.length === 0 ? (
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    Henüz bir mesajlaşmanız bulunmuyor.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {chats.map((chat) => (
                    <Paper
                      key={chat.id}
                      sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/corporate/chat/${chat.id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={chat.avatar} alt={chat.name} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                            {chat.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.75rem', md: '0.875rem' },
                              mt: 0.5,
                            }}
                          >
                            {chat.lastMessage}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {chat.lastTime}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 4 }}>
              {sortedNotifications.map((notification) => (
                <Paper
                  key={notification.id}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 2,
                    bgcolor: notification.read ? 'background.paper' : 'action.hover',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: notification.read ? 500 : 600,
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          color: notification.read ? 'text.primary' : 'primary.main',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          mt: 1,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.disabled',
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          mt: 1,
                        }}
                      >
                        {new Date(notification.timestamp).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteNotification(notification.id)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
              {sortedNotifications.length === 0 && (
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    {tab === 'unread'
                      ? 'Okunmamış bildiriminiz bulunmuyor.'
                      : tab === 'read'
                      ? 'Okunmuş bildiriminiz bulunmuyor.'
                      : 'Bildiriminiz bulunmuyor.'}
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CorporateNotifications; 