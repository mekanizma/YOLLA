import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import { JobRecord, fetchCompanyByEmail } from '../../lib/jobsService';
import { createNotification } from '../../lib/notificationsService';
import { getCorporateApplications, updateApplicationStatus } from '../../lib/applicationsService';

// Styled components for mobile responsiveness
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ApplicationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
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

type ApplicationRow = {
  id: number;
  status: 'pending' | 'in_review' | 'accepted' | 'rejected' | 'approved';
  created_at: string;
  user_id: number;
  users: { full_name?: string; avatar_url?: string } | null;
  jobs: Pick<JobRecord, 'title'> | null;
};

const statusColors = {
  pending: 'warning',
  in_review: 'info',
  accepted: 'success',
  rejected: 'error',
  approved: 'success',
} as const;

const statusLabels = {
  pending: 'Beklemede',
  in_review: 'İnceleniyor',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
  approved: 'Onaylandı',
} as const;

const CorporateApplications: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
          return {
            id: r.id,
            applicantName: r.users?.full_name || 'Aday',
            position: r.jobs?.title || 'Pozisyon',
            appliedDate: new Date(r.created_at).toLocaleDateString('tr-TR'),
            status: statusLabels[r.status as keyof typeof statusLabels] || 'Beklemede',
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
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
        const turkishStatus = statusLabels[newStatus];
        
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
              const statusMessage = {
                'accepted': 'Başvurunuz kabul edildi!',
                'rejected': 'Başvurunuz reddedildi.',
                'in_review': 'Başvurunuz değerlendiriliyor.',
                'approved': 'Başvurunuz onaylandı!'
              };
              
              await createNotification({
                user_id: selectedApplication.user_id,
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

  const handleAcceptConfirm = () => {
    setAcceptDialogOpen(false);
    setContractDialogOpen(true);
  };

  const handleContractConfirm = async () => {
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
                user_id: selectedApplication.user_id,
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
    setContractDialogOpen(false);
    setContractAccepted(false);
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

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ mt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Başvurular
          </Typography>

          <StyledPaper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons={isMobile ? 'auto' : false}
                aria-label="application status tabs"
              >
                <Tab label="Bekleyen" />
                <Tab label="İncelenen" />
                <Tab label="Kabul Edilen" />
                <Tab label="Reddedilen" />
                <Tab label="Onaylanan" />
              </Tabs>
            </Box>

            <Box sx={{ display: 'grid', gap: 2 }}>
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={application.avatar}
                          alt={application.applicantName}
                          sx={{ width: 56, height: 56 }}
                        />
                        <Box>
                          <Typography variant="h6" component="div">
                            {application.applicantName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.position}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Başvuru Tarihi: {application.appliedDate}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={statusLabels[application.status]}
                          color={statusColors[application.status]}
                          size="small"
                        />
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, application)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Deneyim: {application.experience}
                      </Typography>
                      {application.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {/* <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(`/resume/${application.id}`, '_blank')}
                      >
                        CV Görüntüle
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => window.open(`/profile/${application.id}`, '_blank')}
                      >
                        Profili Görüntüle
                      </Button> */}
                    </Box>

                    {currentTab === 2 ? (
                      <Link
                        to={`/corporate/applications/${application.id}`}
                        className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        Detayları Görüntüle <ChevronRight size={16} />
                      </Link>
                    ) : currentTab === 4 ? (
                      <Link
                        to={`/corporate/applications/${application.id}?chat=1`}
                        className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        Detayları Görüntüle <ChevronRight size={16} />
                      </Link>
                    ) : (
                      <Link
                        to={`/corporate/applications/${application.id}`}
                        className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        Detayları Görüntüle <ChevronRight size={16} />
                      </Link>
                    )}
                  </CardContent>
                </ApplicationCard>
              ))}
            </Box>
          </StyledPaper>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {selectedApplication?.status === 'Beklemede' && (
              <MenuItem onClick={() => handleStatusChange('in_review')}>İncelemeye Al</MenuItem>
            )}
            {selectedApplication?.status === 'Beklemede' || selectedApplication?.status === 'İnceleniyor' ? (
              <MenuItem onClick={() => handleStatusChange('accepted')}>Kabul Et</MenuItem>
            ) : null}
            {selectedApplication?.status !== 'Reddedildi' && (
              <MenuItem onClick={() => handleStatusChange('rejected')}>Reddet</MenuItem>
            )}
          </Menu>

          {/* Red Sebebi Dialog */}
          <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
            <DialogTitle>Red Sebebini Giriniz</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Red Sebebi"
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
                label="Tarih"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={acceptDetails.date}
                onChange={e => setAcceptDetails({ ...acceptDetails, date: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Saat"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={acceptDetails.time}
                onChange={e => setAcceptDetails({ ...acceptDetails, time: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Diğer Detaylar"
                multiline
                rows={4}
                fullWidth
                placeholder="İşe başlama tarihi, çalışma saatleri, maaş bilgileri, özel koşullar vb. detayları buraya yazabilirsiniz..."
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