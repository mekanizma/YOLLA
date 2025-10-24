import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import supabase from '../../lib/supabaseClient';
import { fetchCompanyByEmail } from '../../lib/jobsService';

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
}

const CorporateSettings: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    companySize: '',
    notifications: {
      newApplications: true,
      applicationUpdates: true,
      jobExpiry: true,
      marketingEmails: false,
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;
        
        const company = await fetchCompanyByEmail(user.email || '');
        if (company) {
          setSettings(prev => ({
            ...prev,
            companyName: company.name || '',
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || '',
            website: company.website || '',
            industry: company.industry || '',
            companySize: company.size || '',
            // Bildirim ayarları
            notifications: {
              newApplications: company.notification_new_applications ?? true,
              applicationUpdates: company.notification_application_updates ?? true,
              jobExpiry: company.notification_job_expiry ?? true,
              marketingEmails: company.notification_marketing_emails ?? false,
            },
          }));
          if (company.logo) {
            setLogo(company.logo);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    };
    load();
  }, []);

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


  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('auth:passwordMismatch'));
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError(t('auth:passwordTooShort'));
      return;
    }
    
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        // Supabase hata mesajlarını Türkçe'ye çevir
        let errorMessage = error.message;
        if (error.message.includes('Password should be at least')) {
          errorMessage = t('auth:passwordTooShort');
        } else if (error.message.includes('Invalid password')) {
          errorMessage = t('auth:passwordChangeError');
        } else if (error.message.includes('User not found')) {
          errorMessage = t('auth:passwordChangeError');
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = t('auth:passwordChangeError');
        }
        setPasswordError(errorMessage);
        return;
      }
      
      // Başarılı olduğunda formu temizle ve kapat
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || t('auth:passwordChangeError'));
    } finally {
      setPasswordLoading(false);
    }
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

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    setLogoLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;
      
      const company = await fetchCompanyByEmail(user.email || '');
      if (company) {
        // Önce storage'ı dene
        try {
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `company_${company.id}_${Date.now()}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage.from('avatars').upload(fileName, logoFile, { upsert: true });
          if (uploadErr) throw uploadErr;
          const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          const logoUrl = publicUrlData.publicUrl;

          const { error } = await supabase
            .from('companies')
            .update({ logo: logoUrl })
            .eq('id', company.id);
          if (error) throw error;
          
          setLogo(logoUrl);
        } catch (storageError) {
          // Storage başarısız olursa base64 olarak kaydet
          console.warn('Storage upload failed, using base64:', storageError);
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            const { error } = await supabase
              .from('companies')
              .update({ logo: base64 })
              .eq('id', company.id);
            if (error) throw error;
            setLogo(base64);
          };
          reader.readAsDataURL(logoFile);
        }
        
        setLogoFile(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn(e);
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;
      
      const company = await fetchCompanyByEmail(user.email || '');
      if (company) {
        const normalizedWebsite = settings.website
          ? (settings.website.startsWith('http://') || settings.website.startsWith('https://')
              ? settings.website.trim()
              : `https://${settings.website.trim()}`)
          : null;

        const { error } = await supabase
          .from('companies')
          .update({
            name: settings.companyName,
            phone: settings.phone || null,
            address: settings.address || null,
            website: normalizedWebsite,
            industry: settings.industry || '',
            size: settings.companySize || null,
            location: settings.address ? settings.address : (company.location || null),
            // Bildirim ayarları
            notification_new_applications: settings.notifications.newApplications,
            notification_application_updates: settings.notifications.applicationUpdates,
            notification_job_expiry: settings.notifications.jobExpiry,
            notification_marketing_emails: settings.notifications.marketingEmails,
          })
          .eq('id', company.id);
        if (error) throw error;
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn(e);
    } finally {
      setLoading(false);
    }
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
                    <img src={logo} alt={t('common:companyLogo')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <PhotoCamera sx={{ fontSize: 40, color: '#b0b8c9' }} />
                  )}
                </Box>
                {logoFile ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleLogoUpload}
                    disabled={logoLoading}
                    sx={{ fontWeight: 500, borderRadius: 2 }}
                  >
                    {logoLoading ? t('common:saving') : t('common:saveLogo')}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ fontWeight: 500, borderRadius: 2 }}
                  >
                    {t('common:uploadLogo')}
                    <input hidden accept="image/*" type="file" onChange={handleLogoChange} />
                  </Button>
                )}
              </Box>
              <Typography variant="h5" fontWeight={700} mb={1}>
                {settings.companyName}
              </Typography>
              <Typography color="text.secondary" fontSize={16}>
                {t('common:companyProfileSubtitle')}
              </Typography>
            </Box>
          </Paper>
          <form onSubmit={handleSubmit}>
            <StyledPaper elevation={0} sx={{ mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common:companyInfo')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('common:companyName')}
                    value={settings.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('common:email')}
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('common:phone')}
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('common:website')}
                    value={settings.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('common:address')}
                    value={settings.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('common:industry')}
                    value={settings.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    margin="normal"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('common:companySize')}
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
                {t('common:notificationSettings')}
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
                  label={t('common:newApplicationNotification')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.applicationUpdates}
                      onChange={() => handleNotificationChange('applicationUpdates')}
                    />
                  }
                  label={t('common:applicationUpdateNotification')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.jobExpiry}
                      onChange={() => handleNotificationChange('jobExpiry')}
                    />
                  }
                  label={t('common:jobExpiryNotification')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                    />
                  }
                  label={t('common:marketingEmails')}
                />
              </Box>
            </StyledPaper>
            <StyledPaper elevation={0} sx={{ mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('auth:changePassword')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {t('auth:changePasswordTitle')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('auth:changePasswordDescription')}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordChange(true)}
                  sx={{ borderRadius: 2, fontWeight: 500 }}
                >
                  {t('auth:changePassword')}
                </Button>
              </Box>
            </StyledPaper>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ borderRadius: 2, minWidth: 180, fontWeight: 600, fontSize: 16 }}
              >
                {loading ? t('common:savingChanges') : t('common:saveChanges')}
              </Button>
            </Box>
            {showSuccess && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {t('common:passwordChangedSuccess')}
              </Alert>
            )}
          </form>
          
          {/* Şifre Değiştirme Modal */}
          {showPasswordChange && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
                p: 2
              }}
            >
              <Paper
                elevation={24}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  p: 3,
                  borderRadius: 3
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('auth:changePasswordTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('auth:changePasswordDescription')}
                </Typography>
                
                <form onSubmit={handlePasswordSubmit}>
                  <TextField
                    label={t('auth:newPassword')}
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    margin="normal"
                    fullWidth
                    required
                    helperText={t('auth:passwordTooShort')}
                  />
                  <TextField
                    label={t('auth:confirmPassword')}
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    margin="normal"
                    fullWidth
                    required
                  />
                  
                  {passwordError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {passwordError}
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setPasswordError('');
                      }}
                      disabled={passwordLoading}
                    >
                      {t('auth:cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={passwordLoading}
                      sx={{ minWidth: 100 }}
                    >
                      {passwordLoading ? t('auth:passwordChanging') : t('auth:passwordChange')}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CorporateSettings; 