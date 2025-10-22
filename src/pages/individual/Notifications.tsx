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
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 }, flex: 1 }}>
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <Typography variant="h5" fontWeight={700}>{t('notifications:notifications')}</Typography>
          <Box className="flex items-center gap-4">
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="primary"
              indicatorColor="primary"
              className="min-w-[260px]"
            >
              {tabOptions.map(opt => (
                <Tab key={opt.value} value={opt.value} label={opt.label} className="font-semibold" />
              ))}
            </Tabs>
            <Button onClick={markAllAsRead} variant="text" className="text-primary text-sm ml-2">
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
              className={`flex items-center gap-4 px-6 py-4 rounded-lg border cursor-pointer transition-all relative ${!n.read ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
              onClick={() => {
                markAsRead(n.id);
                handleOpenDetail(n);
              }}
            >
              {/* Okunmadı göstergesi */}
              {!n.read && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              
              <div className={`flex items-center justify-center w-10 h-10 rounded-full`} style={{ background: 'bg-primary/5' }}>
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold mb-1 text-base ${!n.read ? 'text-blue-700' : 'text-gray-800'}`}>
                  {translated.title}
                </div>
                <div className="text-gray-600 text-sm truncate">{translated.desc}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs text-gray-400">{n.date}</div>
                  <div className={`text-xs font-medium ${!n.read ? 'text-blue-600' : 'text-gray-500'}`}>
                    {n.read ? t('notifications:readStatus') : t('notifications:unreadStatus')}
                  </div>
                </div>
              </div>
              <button
                className="ml-2 text-gray-400 hover:text-red-500"
                onClick={e => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                title={t('common:delete')}
              >
                <Trash2 size={18} />
              </button>
            </Paper>
            );
          })}
          {sortedNotifications.length === 0 && (
            <Paper elevation={0} className="p-8 text-center text-gray-400">{t('notifications:noNotifications')}</Paper>
          )}
        </Box>
        {/* Bildirim Detay Modalı */}
        <Dialog open={!!openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
          <DialogTitle>
            {openDetail && (
              <Box className="flex items-center gap-2">
                <span style={{ color: 'text-primary' }}>{iconMap[openDetail.type]}</span>
                <span>{getTranslatedMessage(openDetail.title, openDetail.desc).title}</span>
              </Box>
            )}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              {getTranslatedMessage(openDetail?.title || '', openDetail?.desc || '').desc}
            </Typography>
            
            {/* Kabul detayları varsa göster */}
            {openDetail?.data && (openDetail.data.accept_date || openDetail.data.details) && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, color: 'success.dark' }}>
                  📋 {t('notifications:acceptanceDetails')}
                </Typography>
                {openDetail.data.accept_date && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{t('notifications:startDate')}:</strong> {new Date(openDetail.data.accept_date).toLocaleDateString('tr-TR')}
                  </Typography>
                )}
                {openDetail.data.accept_time && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{t('notifications:time')}:</strong> {openDetail.data.accept_time}
                  </Typography>
                )}
                {openDetail.data.details && (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    <strong>{t('notifications:details')}:</strong><br />
                    {openDetail.data.details}
                  </Typography>
                )}
              </Box>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {openDetail?.date}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetail} variant="contained" color="primary">
              {t('notifications:close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sözleşme Onayı Dialog */}
        <Dialog open={contractDialogOpen} onClose={() => setContractDialogOpen(false)}>
          <DialogTitle>{t('common:contractApproval')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={2}>
              {t('common:contractTermsText')}
            </Typography>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>{t('common:contractItem1')}</li>
              <li>{t('common:contractItem2')}</li>
              <li>{t('common:contractItem3')}</li>
              <li>{t('common:contractItem4')}</li>
            </ul>
            <FormControlLabel
              control={<Checkbox checked={contractAccepted} onChange={e => setContractAccepted(e.target.checked)} />}
              label={t('common:contractTerms')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContractDialogOpen(false)}>{t('common:cancel')}</Button>
            <Button onClick={handleContractConfirm} disabled={!contractAccepted}>{t('common:approveContract')}</Button>
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