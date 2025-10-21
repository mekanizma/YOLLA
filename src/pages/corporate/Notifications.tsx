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
  Chip,
  Fade,
  Skeleton,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Briefcase, 
  Award, 
  MessageCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import supabase from '../../lib/supabaseClient';
import { getCorporateNotifications, deleteNotification, markNotificationRead } from '../../lib/notificationsService';
import { fetchCompanyByEmail } from '../../lib/jobsService';

type TabType = 'all' | 'unread' | 'read';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'job' | 'application' | 'badge';
  data?: Record<string, any>;
}

const tabLabels = ['Tümü', 'Okunmamış', 'Okunmuş'];

// Styled components for modern design
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: theme.palette.text.secondary,
    transition: 'all 0.3s ease',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  borderRadius: 16,
  border: '2px dashed #cbd5e1',
}));

// Icon mapping for notification types
const getNotificationIcon = (type: string, read: boolean) => {
  const iconProps = { size: 20, color: read ? '#64748b' : '#3b82f6' };
  
  switch (type) {
    case 'job':
      return <Briefcase {...iconProps} />;
    case 'application':
      return <CheckCircle {...iconProps} />;
    case 'badge':
      return <Award {...iconProps} />;
    case 'success':
      return <CheckCircle {...iconProps} />;
    case 'warning':
      return <AlertCircle {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'info':
    default:
      return <Info {...iconProps} />;
  }
};

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
        
        console.log('Şirket bilgisi:', company);
        const data = await getCorporateNotifications(company.id);
        console.log('Kurumsal bildirimler:', data);
        const mapped: Notification[] = (data as any[]).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          read: n.is_read || false,
          type: n.type || 'info',
          data: n.data || {}
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

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
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

  // İstatistikler hesapla
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    read: notifications.filter(n => n.read).length,
  };

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ 
        mt: 8, 
        minHeight: '100vh', 
        background: '#ffffff',
        py: 4
      }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Başlık ve İstatistikler */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: '#1e40af',
                mb: 2,
              }}
            >
              Bildirimler
            </Typography>
            
            {/* İstatistik Kartları */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              <Paper sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <Bell size={24} color="#3b82f6" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af', mt: 1 }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toplam Bildirim
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}>
                <EyeOff size={24} color="#ef4444" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#dc2626', mt: 1 }}>
                  {stats.unread}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Okunmamış
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <Eye size={24} color="#10b981" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669', mt: 1 }}>
                  {stats.read}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Okunmuş
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Tab ve Buton Container */}
          <Box sx={{ 
            display: 'flex',
            alignItems: isMobile ? 'stretch' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            mb: 3,
            gap: isMobile ? 2 : 0,
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: isMobile ? 'column' : 'row', 
              width: isMobile ? '100%' : 'auto' 
            }}>
              <StyledTabs
                value={tab === 'all' ? 0 : tab === 'unread' ? 1 : tab === 'read' ? 2 : 3}
                onChange={handleTabChange}
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
                {tabLabels.map((label, index) => (
                  <Tab 
                    key={label} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {index === 0 && <Bell size={16} />}
                        {index === 1 && <EyeOff size={16} />}
                        {index === 2 && <Eye size={16} />}
                        {label}
                        {index === 0 && stats.total > 0 && (
                          <Chip 
                            label={stats.total} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              color: '#1e40af'
                            }} 
                          />
                        )}
                        {index === 1 && stats.unread > 0 && (
                          <Chip 
                            label={stats.unread} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                              color: '#dc2626'
                            }} 
                          />
                        )}
                        {index === 2 && stats.read > 0 && (
                          <Chip 
                            label={stats.read} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                              color: '#059669'
                            }} 
                          />
                        )}
                      </Box>
                    } 
                  />
                ))}
              </StyledTabs>
              <Button
                onClick={markAllAsRead}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto',
                  borderRadius: 8,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                  }
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
            <Box sx={{ mt: 4 }}>
              {sortedNotifications.length === 0 ? (
                <EmptyStateContainer>
                  <Bell size={64} color="#94a3b8" />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                    {tab === 'unread'
                      ? 'Okunmamış bildiriminiz bulunmuyor'
                      : tab === 'read'
                      ? 'Okunmuş bildiriminiz bulunmuyor'
                      : 'Bildiriminiz bulunmuyor'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {tab === 'unread'
                      ? 'Yeni bildirimler geldiğinde burada görünecek.'
                      : tab === 'read'
                      ? 'Okuduğunuz bildirimler burada görünecek.'
                      : 'Henüz hiç bildiriminiz bulunmuyor.'}
                  </Typography>
                </EmptyStateContainer>
              ) : (
                <Stack spacing={3}>
                  {sortedNotifications.map((notification, index) => (
                    <Fade in timeout={300 + index * 100} key={notification.id}>
                      <StyledPaper
                        sx={{
                          p: { xs: 3, md: 4 },
                          position: 'relative',
                          cursor: 'pointer',
                          border: notification.read 
                            ? '1px solid rgba(226, 232, 240, 0.8)' 
                            : '1px solid rgba(59, 130, 246, 0.3)',
                          background: notification.read 
                            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                            : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        }}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                      >
                        {/* Okunmadı göstergesi */}
                        {!notification.read && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                            }}
                          />
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                          {/* İkon */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: notification.read 
                              ? 'rgba(100, 116, 139, 0.1)'
                              : 'rgba(59, 130, 246, 0.1)',
                            flexShrink: 0
                          }}>
                            {getNotificationIcon(notification.type, notification.read)}
                          </Box>
                          
                          {/* İçerik */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: notification.read ? 600 : 700,
                                  fontSize: { xs: '1rem', md: '1.1rem' },
                                  color: notification.read ? '#374151' : '#1e40af',
                                  mb: 0.5,
                                }}
                              >
                                {notification.title}
                              </Typography>
                              
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                sx={{ 
                                  color: '#94a3b8',
                                  '&:hover': {
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.1)'
                                  }
                                }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Box>
                            
                            <Typography
                              variant="body1"
                              sx={{
                                color: '#64748b',
                                fontSize: { xs: '0.9rem', md: '1rem' },
                                lineHeight: 1.5,
                                mb: 2,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Clock size={16} color="#94a3b8" />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#64748b',
                                      fontSize: '0.8rem',
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
                                
                                <Chip
                                  label={notification.read ? '✓ Okundu' : '● Okunmadı'}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: notification.read 
                                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                                      : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                    color: notification.read ? '#059669' : '#1e40af',
                                    border: 'none',
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </StyledPaper>
                    </Fade>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CorporateNotifications; 