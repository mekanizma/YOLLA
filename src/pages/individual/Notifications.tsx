import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Bell, CalendarCheck, Lightbulb, Award, Eye, CheckCircle, Briefcase, Trash2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  type: 'job' | 'application' | 'badge' | 'message';
  title: string;
  desc: string;
  date: string;
  read: boolean;
  applicationId?: number;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'job',
    title: 'Yeni iş ilanı: Frontend Geliştirici',
    desc: 'TechSoft A.Ş. yeni bir ilan yayınladı.',
    date: '2 saat önce',
    read: false,
  },
  {
    id: 2,
    type: 'application',
    title: 'Başvuru Sonucu: Görüşmeye Çağrıldınız',
    desc: 'Dijital Vizyon başvurunuz için sizi görüşmeye davet etti.',
    date: '1 gün önce',
    read: false,
  },
  {
    id: 3,
    type: 'badge',
    title: 'Rozet Kazandınız!',
    desc: '“5 ilana başvurdu” rozetini kazandınız.',
    date: '3 gün önce',
    read: true,
  },
  {
    id: 4,
    type: 'application',
    title: 'Başvuru Sonucu: Kabul Edildiniz',
    desc: 'Tebrikler! Başvurunuz kabul edildi.',
    date: '5 dakika önce',
    read: false,
  },
];

const iconMap = {
  job: <Briefcase className="w-6 h-6 text-primary" />,
  application: <CheckCircle className="w-6 h-6 text-green-600" />,
  badge: <Award className="w-6 h-6 text-yellow-500" />,
};

const tabOptions = [
  { label: 'Tümü', value: 'all' },
  { label: 'Okunmamış', value: 'unread' },
  { label: 'Okunmuş', value: 'read' },
];

const IndividualNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [tab, setTab] = useState<'all' | 'unread' | 'read'>('all');
  const [openDetail, setOpenDetail] = useState<Notification | null>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [acceptedOffer, setAcceptedOffer] = useState(false); // mock kayıt
  const navigate = useNavigate();

  // Bildirimleri localStorage'dan da oku
  const [externalNotifications, setExternalNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('individual_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Bildirimler güncellendiğinde localStorage'dan tekrar oku
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setExternalNotifications(JSON.parse(localStorage.getItem('individual_notifications') || '[]'));
      } catch {
        setExternalNotifications([]);
      }
    }, 1000); // Her saniye kontrol et
    return () => clearInterval(interval);
  }, []);

  // Bildirimleri birleştir
  const allNotifications = [...externalNotifications, ...notifications];

  const filtered = allNotifications.filter(n =>
    tab === 'all' ? true : tab === 'unread' ? !n.read : n.read
  );

  // Bildirimleri en yeni en üstte olacak şekilde sırala
  const sortedNotifications = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const handleOpenDetail = (notification: Notification | any) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setOpenDetail(notification);
    if (notification.type === 'message') {
      // Dummy chat ekranına yönlendir
      navigate(`/individual/chat/${notification.applicationId}`);
    }
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
    setAcceptedOffer(true); // mock olarak sisteme kaydet
    setSnackbar({ open: true, message: 'Teklif kabul edildi ve işe alımınız tamamlandı.' });
    // Dummy olarak onaylanan başvuruyu localStorage'a ekle
    if (openDetail && openDetail.applicationId) {
      const approved = JSON.parse(localStorage.getItem('approved_applications') || '[]');
      if (!approved.includes(openDetail.applicationId)) {
        approved.push(openDetail.applicationId);
        localStorage.setItem('approved_applications', JSON.stringify(approved));
      }
    }
  };

  // Bildirimi sil fonksiyonu
  const handleDeleteNotification = (id: number) => {
    // localStorage'dan sil
    const updated = externalNotifications.filter((n: any) => n.id !== id);
    setExternalNotifications(updated);
    localStorage.setItem('individual_notifications', JSON.stringify(updated));
  };

  return (
    <>
      <Header userType="individual" />
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <Typography variant="h5" fontWeight={700}>Bildirimler</Typography>
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
              Tümünü Okundu İşaretle
            </Button>
          </Box>
        </Box>
        <Box className="space-y-3">
          {sortedNotifications.map((n) => (
            <Paper
              key={n.id}
              elevation={0}
              className={`flex items-center gap-4 px-6 py-4 rounded-lg border cursor-pointer transition-all ${!n.read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => {
                markAsRead(n.id);
                handleOpenDetail(n);
              }}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full`} style={{ background: 'bg-primary/5' }}>
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold mb-1 text-base">{n.title}</div>
                <div className="text-gray-600 text-sm truncate">{n.desc}</div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">{n.date}</div>
              <button
                className="ml-2 text-gray-400 hover:text-red-500"
                onClick={e => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                title="Sil"
              >
                <Trash2 size={18} />
              </button>
            </Paper>
          ))}
          {sortedNotifications.length === 0 && (
            <Paper elevation={0} className="p-8 text-center text-gray-400">Hiç bildirim yok.</Paper>
          )}
        </Box>
        {/* Bildirim Detay Modalı */}
        <Dialog open={!!openDetail} onClose={handleCloseDetail} maxWidth="xs" fullWidth>
          <DialogTitle>
            {openDetail && (
              <Box className="flex items-center gap-2">
                <span style={{ color: 'text-primary' }}>{iconMap[openDetail.type]}</span>
                <span>{openDetail.title}</span>
              </Box>
            )}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {openDetail?.desc}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {openDetail?.date}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetail} variant="contained" color="primary">
              Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sözleşme Onayı Dialog */}
        <Dialog open={contractDialogOpen} onClose={() => setContractDialogOpen(false)}>
          <DialogTitle>Sözleşme Onayı</DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={2}>
              Lütfen aşağıdaki sözleşme maddelerini okuyup onaylayın:
            </Typography>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Çalışma koşulları ve iş tanımı tarafınıza iletilmiştir.</li>
              <li>İşe başlama tarihi ve saati işveren tarafından bildirilecektir.</li>
              <li>Tüm yasal haklarınız ve yükümlülükleriniz korunacaktır.</li>
              <li>Gizlilik ve veri koruma kurallarına uyulacaktır.</li>
            </ul>
            <FormControlLabel
              control={<Checkbox checked={contractAccepted} onChange={e => setContractAccepted(e.target.checked)} />}
              label="Sözleşme maddelerini okudum ve kabul ediyorum."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContractDialogOpen(false)}>İptal</Button>
            <Button onClick={handleContractConfirm} disabled={!contractAccepted}>Sözleşmeyi Onayla</Button>
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
    </>
  );
};

export default IndividualNotifications; 