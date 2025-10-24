import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box, Tabs, Tab, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Bell, Award, CheckCircle, Briefcase, Trash2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import supabase from '../../lib/supabaseClient';
import { getMyNotifications, markNotificationRead } from '../../lib/notificationsService';

interface Notification {
  id: string;
  type: 'job' | 'application' | 'badge' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  desc: string;
  date: string;
  read: boolean;
  applicationId?: number;
  data?: Record<string, any>;
}


const iconMap = {
  job: <Briefcase className="w-6 h-6 text-primary" />,
  application: <CheckCircle className="w-6 h-6 text-green-600" />,
  badge: <Award className="w-6 h-6 text-yellow-500" />,
  info: <Bell className="w-6 h-6 text-blue-500" />,
  success: <CheckCircle className="w-6 h-6 text-green-600" />,
  warning: <Bell className="w-6 h-6 text-yellow-500" />,
  error: <Bell className="w-6 h-6 text-red-500" />,
};

const IndividualNotifications: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<'all' | 'unread' | 'read'>('all');
  const [openDetail, setOpenDetail] = useState<Notification | null>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const tabOptions = [
    { label: t('notifications:all'), value: 'all' },
    { label: t('notifications:unread'), value: 'unread' },
    { label: t('notifications:read'), value: 'read' },
  ];

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user?.id) {
        setNotifications([]);
        return;
      }
      console.log('Bireysel kullanıcı ID:', user.id);
      const rows = await getMyNotifications(user.id);
      console.log('Bireysel bildirimler:', rows);
      const mapped = rows.map((n: any) => ({
        id: n.id,
        type: (n.type as any) || 'info',
        title: n.title || '-',
        desc: n.message || n.description || '-',
        date: new Date(n.created_at).toLocaleString('tr-TR'),
        read: !!n.is_read,
        applicationId: n.data?.application_id || undefined,
        data: n.data || {}
      }));
      setNotifications(mapped);
    };
    load();
  }, []);

  const allNotifications = notifications;

  const filtered = allNotifications.filter(n =>
    tab === 'all' ? true : tab === 'unread' ? !n.read : n.read
  );

  // Bildirimleri en yeni en üstte olacak şekilde sırala
  const sortedNotifications = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } finally {
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const handleOpenDetail = (notification: Notification | any) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setOpenDetail(notification);
    // Eğer kabul edilen başvuru bildirimi ise sözleşme popup'ı aç
    if (notification.type === 'application' && notification.title.toLowerCase().includes('kabul')) {
      setContractDialogOpen(true);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(null);
  };

  const handleContractConfirm = () => {
    setContractDialogOpen(false);
    setContractAccepted(false);
    setSnackbar({ open: true, message: t('notifications:offerAccepted') });
    // Dummy olarak onaylanan başvuruyu localStorage'a ekle
    if (openDetail && openDetail.applicationId) {
      const approved = JSON.parse(localStorage.getItem('approved_applications') || '[]');
      if (!approved.includes(openDetail.applicationId)) {
        approved.push(openDetail.applicationId);
        localStorage.setItem('approved_applications', JSON.stringify(approved));
      }
    }
  };

  // Bildirimi sil fonksiyonu (opsiyonel: supabase'de soft delete/flag)
  const getTranslatedMessage = (title: string, desc: string) => {
    // Yeni Başvuru bildirimleri için özel çeviriler
    if (title.toLowerCase().includes('yeni başvuru') || title.toLowerCase().includes('new application')) {
      return {
        title: t('notifications:newApplication'),
        desc: desc.replace(
          /(\w+)\s+adlı\s+kullanıcı\s+"([^"]+)"\s+pozisyonu\s+için\s+başvuru\s+yaptı\.?/i,
          (match, userName, jobTitle) => {
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
      if (desc.toLowerCase().includes('kabul edildi') || desc.toLowerCase().includes('accepted')) {
        return {
          title: t('notifications:applicationStatusUpdate'),
          desc: t('notifications:applicationAccepted')
        };
      } else if (desc.toLowerCase().includes('değerlendiriliyor') || desc.toLowerCase().includes('being evaluated')) {
        return {
          title: t('notifications:applicationStatusUpdate'),
          desc: t('notifications:applicationUnderReview')
        };
      }
    }
    
    // Diğer durumlar için mevcut metinleri kullan
    return { title, desc };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="individual" />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, pt: { xs: 8, md: 10 }, flex: 1, px: { xs: 2, md: 3 } }}>
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <Typography 
            variant="h5" 
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            {t('notifications:notifications')}
          </Typography>
          <Box className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="primary"
              indicatorColor="primary"
              className="w-full sm:min-w-[260px]"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  minHeight: { xs: 36, md: 40 },
                  py: { xs: 0.5, md: 1 },
                }
              }}
            >
              {tabOptions.map(opt => (
                <Tab key={opt.value} value={opt.value} label={opt.label} className="font-semibold" />
              ))}
            </Tabs>
            <Button 
              onClick={markAllAsRead} 
              variant="text" 
              className="text-primary text-sm w-full sm:w-auto"
              sx={{ 
                fontSize: { xs: '0.8rem', md: '0.875rem' },
                py: { xs: 0.75, md: 1 },
                minHeight: { xs: 36, md: 40 }
              }}
            >
              {t('common:markAllAsRead')}
            </Button>
          </Box>
        </Box>
        <Box className="space-y-3">
          {sortedNotifications.map((n) => {
            const translated = getTranslatedMessage(n.title, n.desc);
            return (
            <Paper
              key={n.id}
              elevation={0}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border cursor-pointer transition-all relative ${!n.read ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
              onClick={() => {
                markAsRead(n.id);
                handleOpenDetail(n);
              }}
            >
              {/* Okunmadı göstergesi */}
              {!n.read && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              
              <div className="flex items-start gap-3 w-full sm:w-auto">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0`} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  {iconMap[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold mb-1 text-sm sm:text-base ${!n.read ? 'text-blue-700' : 'text-gray-800'}`}>
                    {translated.title}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm line-clamp-2">{translated.desc}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                    <div className="text-xs text-gray-400">{n.date}</div>
                    <div className={`text-xs font-medium ${!n.read ? 'text-blue-600' : 'text-gray-500'}`}>
                      {n.read ? t('notifications:readStatus') : t('notifications:unreadStatus')}
                    </div>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-red-500 flex-shrink-0 self-start sm:self-center"
                  onClick={e => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                  title={t('common:delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Paper>
            );
          })}
          {sortedNotifications.length === 0 && (
            <Paper 
              elevation={0} 
              className="p-6 sm:p-8 text-center text-gray-400"
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '2px dashed #cbd5e1'
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 1 }}>
                {t('notifications:noNotifications')}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Yeni bildirimler geldiğinde burada görünecek
              </Typography>
            </Paper>
          )}
        </Box>
        {/* Bildirim Detay Modalı */}
        <Dialog 
          open={!!openDetail} 
          onClose={handleCloseDetail} 
          maxWidth="sm" 
          fullWidth
          fullScreen={window.innerWidth < 600}
        >
          <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, py: { xs: 2, sm: 3 } }}>
            {openDetail && (
              <Box className="flex items-center gap-2">
                <span style={{ color: 'text-primary' }}>{iconMap[openDetail.type]}</span>
                <span>{getTranslatedMessage(openDetail.title, openDetail.desc).title}</span>
              </Box>
            )}
          </DialogTitle>
          <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            <Typography variant="body1" sx={{ 
              mb: 2, 
              whiteSpace: 'pre-line',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6
            }}>
              {getTranslatedMessage(openDetail?.title || '', openDetail?.desc || '').desc}
            </Typography>
            
            {/* Kabul detayları varsa göster */}
            {openDetail?.data && (openDetail.data.accept_date || openDetail.data.details) && (
              <Box sx={{ 
                mt: 3, 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: 'success.light', 
                borderRadius: 1 
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 1, 
                  color: 'success.dark',
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  📋 {t('notifications:acceptanceDetails')}
                </Typography>
                {openDetail.data.accept_date && (
                  <Typography variant="body2" sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    <strong>{t('notifications:startDate')}:</strong> {new Date(openDetail.data.accept_date).toLocaleDateString('tr-TR')}
                  </Typography>
                )}
                {openDetail.data.accept_time && (
                  <Typography variant="body2" sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    <strong>{t('notifications:time')}:</strong> {openDetail.data.accept_time}
                  </Typography>
                )}
                {openDetail.data.details && (
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'pre-line',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    <strong>{t('notifications:details')}:</strong><br />
                    {openDetail.data.details}
                  </Typography>
                )}
              </Box>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ 
              mt: 2, 
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              {openDetail?.date}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
            <Button 
              onClick={handleCloseDetail} 
              variant="contained" 
              color="primary"
              fullWidth={window.innerWidth < 600}
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                py: { xs: 0.75, sm: 1 }
              }}
            >
              {t('notifications:close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sözleşme Onayı Dialog */}
        <Dialog 
          open={contractDialogOpen} 
          onClose={() => setContractDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={window.innerWidth < 600}
        >
          <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, py: { xs: 2, sm: 3 } }}>
            {t('common:contractApproval')}
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            <Typography variant="body2" mb={2} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {t('common:contractTermsText')}
            </Typography>
            <ul className="list-disc pl-4 sm:pl-6 text-gray-700 mb-4 space-y-1">
              <li className="text-sm sm:text-base">{t('common:contractItem1')}</li>
              <li className="text-sm sm:text-base">{t('common:contractItem2')}</li>
              <li className="text-sm sm:text-base">{t('common:contractItem3')}</li>
              <li className="text-sm sm:text-base">{t('common:contractItem4')}</li>
            </ul>
            <FormControlLabel
              control={<Checkbox checked={contractAccepted} onChange={e => setContractAccepted(e.target.checked)} />}
              label={
                <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {t('common:contractTerms')}
                </Typography>
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button 
              onClick={() => setContractDialogOpen(false)}
              fullWidth={window.innerWidth < 600}
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {t('common:cancel')}
            </Button>
            <Button 
              onClick={handleContractConfirm} 
              disabled={!contractAccepted}
              variant="contained"
              fullWidth={window.innerWidth < 600}
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {t('common:approveContract')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Bilgilendirme */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ open: false, message: '' })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
      <Footer />
    </div>
  );
};

export default IndividualNotifications; 