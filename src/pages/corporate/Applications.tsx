import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Clock, CheckCircle, XCircle, Eye, Calendar, TrendingUp } from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import { fetchCompanyByEmail } from '../../lib/jobsService';
import { createNotification } from '../../lib/notificationsService';
import { getCorporateApplications, updateApplicationStatus } from '../../lib/applicationsService';

// Styled components for modern design
const StyledPaper = styled(Paper)(() => ({
  padding: 32,
  marginTop: 24,
  borderRadius: 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  '@media (max-width: 600px)': {
    padding: 16,
    borderRadius: 12,
  },
}));

const ApplicationCard = styled(Card)(() => ({
  marginBottom: 24,
  borderRadius: 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  '@media (max-width: 600px)': {
    marginBottom: 16,
    borderRadius: 12,
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

const StatusChip = styled(Chip)(() => ({
  fontWeight: 600,
  borderRadius: 20,
  fontSize: '0.8rem',
  height: 28,
  '&.pending': {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    color: '#92400e',
    border: '1px solid #f59e0b',
  },
  '&.in_review': {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    color: '#1e40af',
    border: '1px solid #3b82f6',
  },
  '&.accepted': {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: '#065f46',
    border: '1px solid #10b981',
  },
  '&.rejected': {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#991b1b',
    border: '1px solid #ef4444',
  },
  '&.approved': {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: '#065f46',
    border: '1px solid #10b981',
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

interface Application {
  id: number;
  applicantName: string;
  position: string;
  appliedDate: string;
  status: 'Beklemede' | 'İnceleniyor' | 'Kabul Edildi' | 'Reddedildi' | 'Onaylandı';
  experience: string;
  skills: string[];
  avatar?: string;
  rejectReason?: string;
  rejectDate?: string;
  user_id?: number;
  jobTitle?: string;
  acceptDate?: string;
  contractAccepted?: boolean;
}


const statusConfig = {
  pending: { 
    label: 'Beklemede', 
    color: 'pending',
    icon: <Clock size={16} />,
    bgColor: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    textColor: '#92400e'
  },
  in_review: { 
    label: 'İnceleniyor', 
    color: 'in_review',
    icon: <Eye size={16} />,
    bgColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    textColor: '#1e40af'
  },
  accepted: { 
    label: 'Kabul Edildi', 
    color: 'accepted',
    icon: <CheckCircle size={16} />,
    bgColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    textColor: '#065f46'
  },
  rejected: { 
    label: 'Reddedildi', 
    color: 'rejected',
    icon: <XCircle size={16} />,
    bgColor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    textColor: '#991b1b'
  },
  approved: { 
    label: 'Onaylandı', 
    color: 'approved',
    icon: <TrendingUp size={16} />,
    bgColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    textColor: '#065f46'
  },
} as const;

const CorporateApplications: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) {
          setApplications([]);
          return;
        }
        // Kurumsal kullanıcıya ait şirketin ilanlarına gelen başvurular
        const company = await fetchCompanyByEmail(user.email || '');
        if (!company) {
          setApplications([]);
          return;
        }
        const data = await getCorporateApplications(company.id);
        console.log('getCorporateApplications verisi:', data);
        const mapped: Application[] = (data as any[]).map((r) => {
          console.log('Mapping için veri:', r);
          const statusKey = r.status as keyof typeof statusConfig;
          const statusInfo = statusConfig[statusKey] || statusConfig.pending;
          
          return {
            id: r.id,
            applicantName: r.users?.full_name || 'Aday',
            position: r.jobs?.title || 'Pozisyon',
            appliedDate: new Date(r.created_at).toLocaleDateString('tr-TR'),
            status: statusInfo.label,
            experience: '-',
            skills: [],
            avatar: r.users?.avatar_url || undefined,
            user_id: r.user_id,
            jobTitle: r.jobs?.title,
          };
        });
        setApplications(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptDetails, setAcceptDetails] = useState({ date: '', time: '', details: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, application: Application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'in_review' | 'accepted' | 'rejected' | 'approved') => {
    if (selectedApplication) {
      try {
        await updateApplicationStatus(selectedApplication.id, newStatus, rejectReason);
        
        // UI'da gösterilecek Türkçe status
        const turkishStatus = statusConfig[newStatus].label;
        
        setApplications(prev => prev.map(app =>
          app.id === selectedApplication.id ? { ...app, status: turkishStatus } : app
        ));
        setSnackbar({ open: true, message: 'Başvuru durumu güncellendi.' });
        
        // Başvuru sahibine bildirim gönder
        try {
          const { data: auth } = await supabase.auth.getUser();
          const user = auth.user;
          if (user) {
            const company = await fetchCompanyByEmail(user.email || '');
            if (company && selectedApplication.user_id) {
              const statusMessage: Record<string, string> = {
                'pending': 'Başvurunuz beklemede.',
                'accepted': 'Başvurunuz kabul edildi!',
                'rejected': 'Başvurunuz reddedildi.',
                'in_review': 'Başvurunuz değerlendiriliyor.',
                'approved': 'Başvurunuz onaylandı!'
              };
              
              await createNotification({
                user_id: selectedApplication.user_id.toString(),
                title: 'Başvuru Durumu Güncellendi',
                message: statusMessage[newStatus] || 'Başvuru durumunuz güncellendi.',
                type: newStatus === 'accepted' || newStatus === 'approved' ? 'success' : 'info',
                data: { 
                  application_id: selectedApplication.id,
                  job_title: selectedApplication.jobTitle,
                  company_name: company.name
                }
              });
            }
          }
        } catch (notificationError) {
          console.warn('Bildirim gönderilemedi:', notificationError);
        }
        
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Güncelleme başarısız.' });
      }
      
      if (newStatus === 'rejected') {
        setRejectDialogOpen(true);
        return;
      }
      if (newStatus === 'accepted') {
        setAcceptDialogOpen(true);
        return;
      }
    }
    handleMenuClose();
  };

  const handleRejectConfirm = async () => {
    if (selectedApplication) {
      try {
        await updateApplicationStatus(selectedApplication.id, 'rejected', rejectReason);
        setApplications(prev => prev.map(app =>
          app.id === selectedApplication.id ? { ...app, status: 'Reddedildi', rejectReason, rejectDate: new Date().toISOString() } : app
        ));
        setSnackbar({ open: true, message: 'Red sebebiniz başarıyla iletildi.' });
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Güncelleme başarısız.' });
      }
    }
    setRejectDialogOpen(false);
    setRejectReason('');
    handleMenuClose();
  };

  const handleAcceptConfirm = async () => {
    if (selectedApplication) {
      try {
        await updateApplicationStatus(selectedApplication.id, 'accepted');
        setApplications(prev => prev.map(app =>
          app.id === selectedApplication.id ? { ...app, status: 'Kabul Edildi', acceptDate: new Date().toISOString(), contractAccepted: true } : app
        ));
        
        // Başvuru sahibine detaylı bildirim gönder
        try {
          const { data: auth } = await supabase.auth.getUser();
          const user = auth.user;
          if (user) {
            const company = await fetchCompanyByEmail(user.email || '');
            if (company && selectedApplication.user_id) {
              const detailsMessage = acceptDetails.details 
                ? `\n\nDetaylar:\n${acceptDetails.details}`
                : '';
              
              const fullMessage = `Başvurunuz kabul edildi! İşe başlama tarihi: ${acceptDetails.date}, Saat: ${acceptDetails.time}.${detailsMessage}`;
              
              await createNotification({
                user_id: selectedApplication.user_id.toString(),
                title: 'Başvuru Kabul Edildi! 🎉',
                message: fullMessage,
                type: 'success',
                data: { 
                  application_id: selectedApplication.id,
                  job_title: selectedApplication.jobTitle,
                  company_name: company.name,
                  accept_date: acceptDetails.date,
                  accept_time: acceptDetails.time,
                  details: acceptDetails.details
                }
              });
            }
          }
        } catch (notificationError) {
          console.warn('Bildirim gönderilemedi:', notificationError);
        }
        
        setSnackbar({ open: true, message: 'İşe alımınız tamamlanmıştır.' });
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Güncelleme başarısız.' });
      }
    }
    setAcceptDialogOpen(false);
    setAcceptDetails({ date: '', time: '', details: '' });
    handleMenuClose();
  };

  // Başvuruları filtrele (localStorage kaldırıldı)
  const filteredApplications = applications.filter(app => {
    switch (currentTab) {
      case 0: return app.status === 'Beklemede';
      case 1: return app.status === 'İnceleniyor';
      case 2: return app.status === 'Kabul Edildi';
      case 3: return app.status === 'Reddedildi';
      case 4: return app.status === 'Onaylandı';
      default: return true;
    }
  });

  // İstatistikler hesapla
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Beklemede').length,
    inReview: applications.filter(app => app.status === 'İnceleniyor').length,
    accepted: applications.filter(app => app.status === 'Kabul Edildi').length,
    rejected: applications.filter(app => app.status === 'Reddedildi').length,
    approved: applications.filter(app => app.status === 'Onaylandı').length,
  };

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ 
        mt: 8, 
        background: '#ffffff',
        minHeight: '100vh',
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
              {t('common:applicationsTitle')}
            </Typography>
            
            {/* İstatistik Kartları */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              <Paper sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <Users size={24} color="#3b82f6" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('common:totalApplications')}
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <Clock size={24} color="#f59e0b" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('common:pending')}
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <Eye size={24} color="#3b82f6" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  {stats.inReview}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('common:underReview')}
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <CheckCircle size={24} color="#10b981" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#065f46' }}>
                  {stats.accepted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('common:accepted')}
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <TrendingUp size={24} color="#10b981" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#065f46' }}>
                  {stats.approved}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('common:approved')}
                </Typography>
              </Paper>
            </Box>
          </Box>

          <StyledPaper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <StyledTabs
                value={currentTab}
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons={isMobile ? 'auto' : false}
                aria-label="application status tabs"
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={18} />
                      {t('common:pendingTab')}
                      {stats.pending > 0 && (
                        <Chip 
                          label={stats.pending} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            color: '#92400e'
                          }} 
                        />
                      )}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Eye size={18} />
                      {t('common:reviewedTab')}
                      {stats.inReview > 0 && (
                        <Chip 
                          label={stats.inReview} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            color: '#1e40af'
                          }} 
                        />
                      )}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={18} />
                      {t('common:acceptedTab')}
                      {stats.accepted > 0 && (
                        <Chip 
                          label={stats.accepted} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            color: '#065f46'
                          }} 
                        />
                      )}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <XCircle size={18} />
                      {t('common:rejectedTab')}
                      {stats.rejected > 0 && (
                        <Chip 
                          label={stats.rejected} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            color: '#991b1b'
                          }} 
                        />
                      )}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp size={18} />
                      {t('common:approvedTab')}
                      {stats.approved > 0 && (
                        <Chip 
                          label={stats.approved} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            color: '#065f46'
                          }} 
                        />
                      )}
                    </Box>
                  } 
                />
              </StyledTabs>
            </Box>

            {/* Loading State */}
            {loading ? (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {[1, 2, 3].map((i) => (
                  <ApplicationCard key={i}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={56} height={56} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="40%" height={20} />
                          <Skeleton variant="text" width="30%" height={16} />
                        </Box>
                        <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 14 }} />
                      </Box>
                    </CardContent>
                  </ApplicationCard>
                ))}
              </Box>
            ) : filteredApplications.length === 0 ? (
              <EmptyStateContainer>
                <Users size={64} color="#94a3b8" />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                  Henüz başvuru bulunmuyor
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bu kategoride henüz başvuru bulunmuyor. Yeni başvurular geldiğinde burada görünecek.
                </Typography>
              </EmptyStateContainer>
            ) : (
              <Box sx={{ display: 'grid', gap: 3 }}>
                {filteredApplications.map((application, index) => {
                  const statusKey = Object.keys(statusConfig).find(key => 
                    statusConfig[key as keyof typeof statusConfig].label === application.status
                  ) as keyof typeof statusConfig;
                  const statusInfo = statusConfig[statusKey] || statusConfig.pending;
                  
                  return (
                    <Fade in timeout={300 + index * 100} key={application.id}>
                      <ApplicationCard>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Avatar
                                src={application.avatar}
                                alt={application.applicantName}
                                sx={{ 
                                  width: 64, 
                                  height: 64,
                                  border: '3px solid rgba(59, 130, 246, 0.1)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Box>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                                  {application.applicantName}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                                  {application.position}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Calendar size={16} color="#64748b" />
                                  <Typography variant="caption" color="text.secondary">
                                    {t('common:applicationDate')}: {application.appliedDate}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <StatusChip
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {statusInfo.icon}
                                    {application.status === 'Beklemede' ? t('common:pending') : 
                                     application.status === 'İnceleniyor' ? t('common:underReview') :
                                     application.status === 'Kabul Edildi' ? t('common:accepted') :
                                     application.status === 'Reddedildi' ? t('common:rejected') :
                                     application.status === 'Onaylandı' ? t('common:approved') :
                                     application.status}
                                  </Box>
                                }
                                className={statusInfo.color}
                                size="small"
                              />
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, application)}
                                size="small"
                                sx={{
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  '&:hover': {
                                    background: 'rgba(59, 130, 246, 0.2)',
                                  }
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t('common:experience')}: {application.experience}
                              </Typography>
                              {application.skills.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {application.skills.slice(0, 3).map((skill) => (
                                    <Chip
                                      key={skill}
                                      label={skill}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                  {application.skills.length > 3 && (
                                    <Typography variant="caption" color="text.secondary">
                                      +{application.skills.length - 3} daha
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                            
                            <Link
                              to={`/corporate/applications/${application.id}${currentTab === 4 ? '?chat=1' : ''}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                color: '#3b82f6',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: 'rgba(59, 130, 246, 0.1)',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                e.currentTarget.style.transform = 'translateX(2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              {t('common:viewDetails')} <ChevronRight size={16} />
                            </Link>
                          </Box>
                        </CardContent>
                      </ApplicationCard>
                    </Fade>
                  );
                })}
              </Box>
            )}

          </StyledPaper>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {selectedApplication?.status === 'Beklemede' && (
              <MenuItem onClick={() => handleStatusChange('in_review')}>{t('common:takeUnderReview')}</MenuItem>
            )}
            {selectedApplication?.status === 'Beklemede' || selectedApplication?.status === 'İnceleniyor' ? (
              <MenuItem onClick={() => handleStatusChange('accepted')}>{t('common:accept')}</MenuItem>
            ) : null}
            {selectedApplication?.status !== 'Reddedildi' && (
              <MenuItem onClick={() => handleStatusChange('rejected')}>{t('common:reject')}</MenuItem>
            )}
          </Menu>

          {/* Red Sebebi Dialog */}
          <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
            <DialogTitle>Red Sebebini Giriniz</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={t('common:rejectionReason')}
                type="text"
                fullWidth
                required
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                error={!rejectReason.trim()}
                helperText={!rejectReason.trim() ? 'Red sebebi zorunludur.' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRejectDialogOpen(false)}>İptal</Button>
              <Button onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>Gönder</Button>
            </DialogActions>
          </Dialog>

          {/* Kabul Detayları Dialog */}
          <Dialog 
            open={acceptDialogOpen} 
            onClose={() => setAcceptDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                maxHeight: '90vh',
                margin: '20px',
              }
            }}
          >
            <DialogTitle>Kabul Detayları</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label={t('common:date')}
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={acceptDetails.date}
                onChange={e => setAcceptDetails({ ...acceptDetails, date: e.target.value })}
              />
              <TextField
                margin="dense"
                label={t('common:time')}
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={acceptDetails.time}
                onChange={e => setAcceptDetails({ ...acceptDetails, time: e.target.value })}
              />
              <TextField
                margin="dense"
                label={t('common:otherDetails')}
                multiline
                rows={4}
                fullWidth
                placeholder={t('common:otherDetailsPlaceholder')}
                value={acceptDetails.details}
                onChange={e => setAcceptDetails({ ...acceptDetails, details: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAcceptDialogOpen(false)}>İptal</Button>
              <Button onClick={handleAcceptConfirm} disabled={!acceptDetails.date || !acceptDetails.time}>Onayla</Button>
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
      </Box>
    </>
  );
};

export default CorporateApplications; 