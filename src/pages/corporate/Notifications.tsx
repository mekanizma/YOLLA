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
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Briefcase, 
  Award, 
  Clock,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import supabase from '../../lib/supabaseClient';
import { getCorporateNotifications, deleteNotification, markNotificationRead } from '../../lib/notificationsService';
import { fetchCompanyByEmail } from '../../lib/jobsService';

type TabType = 'all' | 'unread' | 'read' | 'messages';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'job' | 'application' | 'badge';
  data?: Record<string, any>;
}

// tabLabels will be defined inside component to use translation

// Styled components for modern design
const StyledPaper = styled(Paper)(() => ({
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

const StyledTabs = styled(Tabs)(() => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#64748b',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    '&.Mui-selected': {
      color: '#3b82f6',
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
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<TabType>('all');
  const [chats, setChats] = useState<any[]>([]);
  const navigate = useNavigate();

  const tabLabels = [t('notifications:all'), t('notifications:unread'), t('notifications:read')];

  // Bildirim mesajlarını çevir
  const getTranslatedMessage = (title: string, message: string) => {
    // Yeni Başvuru bildirimleri için özel çeviriler
    if (title.toLowerCase().includes('yeni başvuru') || title.toLowerCase().includes('new application')) {
      return {
        title: t('notifications:newApplication'),
        message: message.replace(
          /(\w+)\s+adlı\s+kullanıcı\s+"([^"]+)"\s+pozisyonu\s+için\s+başvuru\s+yaptı\.?/i,
          (_, userName, jobTitle) => {
            return t('notifications:newApplicationMessage', { 
              applicantName: userName, 
              jobTitle: jobTitle 
            });
          }
        )
      };
    }
    
    // Başvuru durumu güncellemeleri için özel çeviriler
    if (title.toLowerCase().includes('başvuru durumu güncellendi') || title.toLowerCase().includes('application status update')) {
      if (message.toLowerCase().includes('kabul edildi') || message.toLowerCase().includes('accepted')) {
        return {
          title: t('notifications:applicationStatusUpdate'),
          message: t('notifications:applicationAccepted')
        };
      } else if (message.toLowerCase().includes('değerlendiriliyor') || message.toLowerCase().includes('being evaluated')) {
        return {
          title: t('notifications:applicationStatusUpdate'),
          message: t('notifications:applicationUnderReview')
        };
      }
    }
    
    // Diğer durumlar için mevcut metinleri kullan
    return { title, message };
  };

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

  const handleDeleteNotification = async (id: string) => {
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
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
          {/* Başlık ve İstatistikler */}
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: '#1e40af',
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              {t('notifications:notifications')}
            </Typography>
            
            {/* İstatistik Kartları */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: { xs: 1.5, md: 2 },
              mb: 3
            }}>
              <Paper sx={{ 
                p: { xs: 1.5, md: 2 }, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <Bell size={isMobile ? 20 : 24} color="#3b82f6" />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#1e40af', 
                  mt: 1,
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                  {t('notifications:totalNotifications')}
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: { xs: 1.5, md: 2 }, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}>
                <EyeOff size={isMobile ? 20 : 24} color="#ef4444" />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#dc2626', 
                  mt: 1,
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}>
                  {stats.unread}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                  {t('notifications:unread')}
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: { xs: 1.5, md: 2 }, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <Eye size={isMobile ? 20 : 24} color="#10b981" />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#059669', 
                  mt: 1,
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}>
                  {stats.read}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                  {t('notifications:read')}
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
            mb: { xs: 2, md: 3 },
            gap: isMobile ? 2 : 0,
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, md: 2 }, 
              flexDirection: isMobile ? 'column' : 'row', 
              width: isMobile ? '100%' : 'auto' 
            }}>
              <StyledTabs
                value={tab === 'all' ? 0 : tab === 'unread' ? 1 : tab === 'read' ? 2 : 3}
                onChange={handleTabChange}
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  minHeight: { xs: 36, md: 40 },
                  width: isMobile ? '100%' : 'auto',
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                    minWidth: isMobile ? 'auto' : 100,
                    py: { xs: 0.5, md: 1 },
                    px: { xs: 1, md: 2 },
                  },
                }}
              >
                {tabLabels.map((label, index) => (
                  <Tab 
                    key={label} 
                    label={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 0.5, md: 1 },
                        flexDirection: isMobile ? 'column' : 'row'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {index === 0 && <Bell size={isMobile ? 14 : 16} />}
                          {index === 1 && <EyeOff size={isMobile ? 14 : 16} />}
                          {index === 2 && <Eye size={isMobile ? 14 : 16} />}
                          <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{label}</span>
                        </Box>
                        {index === 0 && stats.total > 0 && (
                          <Chip 
                            label={stats.total} 
                            size="small" 
                            sx={{ 
                              height: isMobile ? 18 : 20, 
                              fontSize: isMobile ? '0.6rem' : '0.7rem',
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
                              height: isMobile ? 18 : 20, 
                              fontSize: isMobile ? '0.6rem' : '0.7rem',
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
                              height: isMobile ? 18 : 20, 
                              fontSize: isMobile ? '0.6rem' : '0.7rem',
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
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto',
                  borderRadius: 8,
                  px: { xs: 2, md: 3 },
                  py: { xs: 0.75, md: 1 },
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  minHeight: { xs: 36, md: 40 },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                  }
                }}
              >
                {isMobile ? t('notifications:markAllAsReadShort') || 'Tümünü Okundu İşaretle' : t('notifications:markAllAsRead')}
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
                    {t('notifications:noNotifications')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('notifications:noNotifications')}
                  </Typography>
                </EmptyStateContainer>
              ) : (
                <Stack spacing={3}>
                  {sortedNotifications.map((notification, index) => {
                    const translated = getTranslatedMessage(notification.title, notification.message);
                    return (
                    <Fade in timeout={300 + index * 100} key={notification.id}>
                      <StyledPaper
                        sx={{
                          p: { xs: 2, sm: 3, md: 4 },
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
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: { xs: 2, md: 3 },
                          flexDirection: isMobile ? 'column' : 'row'
                        }}>
                          {/* İkon */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            borderRadius: 12,
                            background: notification.read 
                              ? 'rgba(100, 116, 139, 0.1)'
                              : 'rgba(59, 130, 246, 0.1)',
                            flexShrink: 0,
                            alignSelf: isMobile ? 'flex-start' : 'auto'
                          }}>
                            {getNotificationIcon(notification.type, notification.read)}
                          </Box>
                          
                          {/* İçerik */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start', 
                              mb: 1,
                              flexDirection: isMobile ? 'column' : 'row',
                              gap: isMobile ? 1 : 0
                            }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: notification.read ? 600 : 700,
                                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                                  color: notification.read ? '#374151' : '#1e40af',
                                  mb: 0.5,
                                  lineHeight: 1.3
                                }}
                              >
                                {translated.title}
                              </Typography>
                              
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                sx={{ 
                                  color: '#94a3b8',
                                  alignSelf: isMobile ? 'flex-end' : 'auto',
                                  '&:hover': {
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.1)'
                                  }
                                }}
                              >
                                <Trash2 size={isMobile ? 16 : 18} />
                              </IconButton>
                            </Box>
                            
                            <Typography
                              variant="body1"
                              sx={{
                                color: '#64748b',
                                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                                lineHeight: 1.5,
                                mb: { xs: 1.5, md: 2 },
                              }}
                            >
                              {translated.message}
                            </Typography>
                            
                            <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                            
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              flexDirection: isMobile ? 'column' : 'row',
                              gap: isMobile ? 1 : 0
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: isMobile ? 'flex-start' : 'center', 
                                gap: { xs: 1, md: 2 },
                                flexDirection: isMobile ? 'column' : 'row'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Clock size={isMobile ? 14 : 16} color="#94a3b8" />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#64748b',
                                      fontSize: { xs: '0.7rem', md: '0.8rem' },
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
                                  label={notification.read ? t('notifications:readStatus') : t('notifications:unreadStatus')}
                                  size="small"
                                  sx={{
                                    height: { xs: 20, md: 24 },
                                    fontSize: { xs: '0.65rem', md: '0.75rem' },
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
                    );
                  })}
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