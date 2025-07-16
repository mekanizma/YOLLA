import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// Styled components for mobile responsiveness
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

interface CompanySettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  companySize: string;
  notifications: {
    newApplications: boolean;
    applicationUpdates: boolean;
    jobExpiry: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    showCompanyInfo: boolean;
    allowDirectMessages: boolean;
    showActiveJobs: boolean;
  };
}

const CorporateSettings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Tech Solutions Ltd.',
    email: 'contact@techsolutions.com',
    phone: '+90 555 123 4567',
    address: 'İstanbul, Türkiye',
    website: 'www.techsolutions.com',
    industry: 'Teknoloji',
    companySize: '50-100',
    notifications: {
      newApplications: true,
      applicationUpdates: true,
      jobExpiry: true,
      marketingEmails: false,
    },
    privacy: {
      showCompanyInfo: true,
      allowDirectMessages: true,
      showActiveJobs: true,
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: keyof CompanySettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field],
      },
    }));
  };

  const handlePrivacyChange = (field: keyof CompanySettings['privacy']) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: !prev.privacy[field],
      },
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ mt: 8, bgcolor: '#f7fafd', minHeight: '100vh' }}>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 4, textAlign: 'center', position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', mb: 1 }}>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #e3e8ef',
                    bgcolor: '#f4f6fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  {logo ? (
                    <img src={logo} alt="Şirket Logosu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <PhotoCamera sx={{ fontSize: 40, color: '#b0b8c9' }} />
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ mt: 1, fontWeight: 500, borderRadius: 2 }}
                >
                  Logo Yükle
                  <input hidden accept="image/*" type="file" onChange={handleLogoChange} />
                </Button>
              </Box>
              <Typography variant="h5" fontWeight={700} mb={1}>
                {settings.companyName}
              </Typography>
              <Typography color="text.secondary" fontSize={16}>
                Şirket profilinizi güncelleyin ve daha profesyonel görünün.
              </Typography>
            </Box>
          </Paper>
          <form onSubmit={handleSubmit}>
            <StyledPaper elevation={0} sx={{ mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Şirket Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Şirket Adı"
                    value={settings.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="E-posta"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Telefon"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Website"
                    value={settings.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Adres"
                    value={settings.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Sektör"
                    value={settings.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Şirket Büyüklüğü"
                    value={settings.companySize}
                    onChange={(e) => handleChange('companySize', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </StyledPaper>
            <StyledPaper elevation={0} sx={{ mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Bildirim Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.newApplications}
                      onChange={() => handleNotificationChange('newApplications')}
                    />
                  }
                  label="Yeni başvurular için bildirim"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.applicationUpdates}
                      onChange={() => handleNotificationChange('applicationUpdates')}
                    />
                  }
                  label="Başvuru güncellemeleri için bildirim"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.jobExpiry}
                      onChange={() => handleNotificationChange('jobExpiry')}
                    />
                  }
                  label="İlan süresi dolmak üzere bildirimi"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                    />
                  }
                  label="Pazarlama e-postaları"
                />
              </Box>
            </StyledPaper>
            <StyledPaper elevation={0} sx={{ mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Gizlilik Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showCompanyInfo}
                      onChange={() => handlePrivacyChange('showCompanyInfo')}
                    />
                  }
                  label="Şirket bilgilerini göster"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.allowDirectMessages}
                      onChange={() => handlePrivacyChange('allowDirectMessages')}
                    />
                  }
                  label="Doğrudan mesajlara izin ver"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showActiveJobs}
                      onChange={() => handlePrivacyChange('showActiveJobs')}
                    />
                  }
                  label="Aktif iş ilanlarını göster"
                />
              </Box>
            </StyledPaper>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ borderRadius: 2, minWidth: 180, fontWeight: 600, fontSize: 16 }}
              >
                Değişiklikleri Kaydet
              </Button>
            </Box>
            {showSuccess && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Ayarlar başarıyla kaydedildi!
              </Alert>
            )}
          </form>
        </Container>
      </Box>
    </>
  );
};

export default CorporateSettings; 