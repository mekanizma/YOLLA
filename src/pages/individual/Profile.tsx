import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../../components/layout/Header';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ModernCV } from '../../components/cv-templates/ModernCV';
import { MinimalCV } from '../../components/cv-templates/MinimalCV';
import { ElegantCV } from '../../components/cv-templates/ElegantCV';
import { ProfessionalCV } from '../../components/cv-templates/ProfessionalCV';
import { CreativeCV } from '../../components/cv-templates/CreativeCV';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import BadgesSection from '../../components/BadgesSection';
import ProfileCompletionBox from '../../components/ProfileCompletionBox';

const skills = [
  'JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML5', 'CSS3', 'MongoDB', 'Express.js', 'Git', 'RESTful API', 'UI/UX', 'Responsive Design'
];
const languages = [
  { name: 'Türkçe', level: 'Anadil', percent: 100 },
  { name: 'İngilizce', level: 'İleri Seviye', percent: 85 },
  { name: 'Almanca', level: 'Orta Seviye', percent: 50 }
];
const experiences = [
  {
    title: 'Kıdemli Frontend Geliştirici',
    company: 'ABC Teknoloji',
    desc: 'Şirketin ana ürünü olan SaaS platformunun frontend mimarisini yeniden tasarladım ve geliştirme sürecinde liderlik yaptım. React ve TypeScript kullanarak performans ve kullanıcı deneyimini önemli ölçüde iyileştirdim.',
    date: 'Ocak 2023 - Günümüz'
  },
  {
    title: 'Frontend Geliştirici',
    company: 'XYZ Dijital',
    desc: "E-ticaret web sitelerinin geliştirilmesi ve bakımında görev aldım. Responsive tasarımlar ve modern JavaScript frameworkleri kullanarak kullanıcı arayüzleri oluşturdum.",
    date: 'Mart 2020 - Aralık 2022'
  },
  {
    title: 'Junior Web Geliştirici',
    company: 'Tech Solutions',
    desc: 'HTML, CSS ve JavaScript kullanarak web siteleri geliştirdim. jQuery ve Bootstrap gibi kütüphanelerle çalıştım ve temel backend entegrasyonları gerçekleştirdim.',
    date: 'Haziran 2018 - Şubat 2020'
  }
];
const educations = [
  {
    degree: 'Bilgisayar Mühendisliği, Yüksek Lisans',
    school: 'İstanbul Teknik Üniversitesi',
    desc: 'Yapay Zeka ve Veri Bilimi odaklı çalışmalar yaptım. Tezim "Derin Öğrenme Algoritmaları ile Görüntü İşleme" üzerindeydi.',
    date: '2016 - 2018'
  },
  {
    degree: 'Bilgisayar Mühendisliği, Lisans',
    school: 'Boğaziçi Üniversitesi',
    desc: 'Yazılım geliştirme, algoritma tasarımı ve veri yapıları üzerine kapsamlı eğitim aldım. Bitirme projemde web tabanlı bir öğrenme yönetim sistemi geliştirdim.',
    date: '2012 - 2016'
  }
];

const profileCompletion = 75;
const missingFields = ['Telefon', 'Lokasyon', 'Hakkında'];

const cvTemplates = [
  { key: 'modern', label: 'Modern', component: ModernCV },
  { key: 'minimal', label: 'Minimal', component: MinimalCV },
  { key: 'elegant', label: 'Elegant', component: ElegantCV },
  { key: 'professional', label: 'Professional', component: ProfessionalCV },
  { key: 'creative', label: 'Creative', component: CreativeCV },
];

const badges = [
  {
    id: 1,
    icon: '🏆',
    title: '5 ilana başvurdu',
    desc: 'İlk 5 iş başvurunu tamamladın!'
  },
  {
    id: 3,
    icon: '💯',
    title: 'Profilini %100 doldurdu',
    desc: 'Profilini eksiksiz doldurdun.'
  }
];

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: 'Ahmet Yılmaz',
    title: 'Yazılım Geliştirici',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 555 123 45 67',
    location: 'İstanbul, Türkiye',
    about: `5 yıllık deneyime sahip bir Yazılım Geliştirici olarak, modern web teknolojileri ve geliştirme konusunda uzmanlık sahibiyim. Frontend ve backend teknolojilerinde geniş bir bilgi birikimine sahibim ve çevik metodolojileri benimseyen takım çalışmalarında verimli bir şekilde çalışabiliyorum.\n\nKarmaşık problemleri çözme, temiz ve sürdürülebilir kod yazma konusunda tutkulu bir yaklaşımım var. Sürekli öğrenmeye ve kendimi geliştirmeye odaklanıyorum, yeni teknolojileri takip ediyor ve projelerime entegre ediyorum.`
  });
  const [formBackup, setFormBackup] = useState(form);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [cvDialogOpen, setCvDialogOpen] = useState(false);
  const [cvType, setCvType] = useState('modern');

  const handleAvatarClick = () => setAvatarDialogOpen(true);
  const handleDialogClose = () => {
    setAvatarDialogOpen(false);
    setNewImage(null);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSaveImage = () => {
    if (newImage) setProfileImage(newImage);
    setAvatarDialogOpen(false);
    setNewImage(null);
  };
  const handleRemoveImage = () => {
    setProfileImage('');
    setAvatarDialogOpen(false);
    setNewImage(null);
  };
  const handleEditClick = () => {
    setFormBackup(form);
    setEditMode(true);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleCancelEdit = () => {
    setForm(formBackup);
    setEditMode(false);
  };
  const handleSaveEdit = () => {
    setEditMode(false);
  };
  const handleOpenCvDialog = () => setCvDialogOpen(true);
  const handleCloseCvDialog = () => setCvDialogOpen(false);

  const profileData = {
    name: form.name,
    title: form.title,
    email: form.email,
    phone: form.phone,
    location: form.location,
    about: form.about,
    skills,
    languages,
    experiences,
    educations,
    photo: profileImage,
  };
  const SelectedCV = cvTemplates.find(t => t.key === cvType)?.component;

  return (
    <>
      <Header userType="individual" />
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left Column */}
          <Box sx={{ width: { xs: '100%', md: '33%' } }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                  <Avatar src={newImage || profileImage || undefined} sx={{ width: 96, height: 96, mb: 2 }}>
                    {!profileImage && !newImage && <PhotoCamera fontSize="large" />}
                  </Avatar>
                </IconButton>
                {editMode ? (
                  <TextField
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    variant="standard"
                    fullWidth
                    inputProps={{ style: { textAlign: 'center', fontWeight: 600, fontSize: 20 } }}
                    sx={{ mb: 1 }}
                  />
                ) : (
                  <Typography variant="h6" fontWeight={600}>{form.name}</Typography>
                )}
                <Typography color="text.secondary" fontSize={16}>{form.title}</Typography>
                <Button size="small" variant="outlined" sx={{ mt: 1, mb: 2 }}>5 Yıl Deneyim</Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography fontSize={15}>{form.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography fontSize={15}>{form.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography fontSize={15}>{form.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon fontSize="small" color="action" />
                  <Typography fontSize={15}>ahmetyilmaz.com</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={500} fontSize={15} mb={1}>Profil Tamamlama</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Button size="small" variant="outlined">İLERLEME</Button>
                <Box sx={{ flex: 1, ml: 2, fontWeight: 600 }}>{profileCompletion}%</Box>
              </Box>
              <LinearProgress variant="determinate" value={profileCompletion} sx={{ height: 8, borderRadius: 5, mb: 2 }} />
              {!editMode && (
                <>
                  <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={handleEditClick}>Profili Düzenle</Button>
                  <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={handleOpenCvDialog}>Otomatik CV Oluştur</Button>
                  <Dialog open={cvDialogOpen} onClose={handleCloseCvDialog} fullScreen={fullScreen} maxWidth="md">
                    <DialogTitle>CV Tasarımını Seç</DialogTitle>
                    <DialogContent>
                      <RadioGroup
                        row
                        value={cvType}
                        onChange={e => setCvType(e.target.value)}
                      >
                        {cvTemplates.map(t => (
                          <FormControlLabel key={t.key} value={t.key} control={<Radio />} label={t.label} />
                        ))}
                      </RadioGroup>
                      <Box sx={{ mt: 3, height: 500, border: '1px solid #e3e8ef', borderRadius: 2, overflow: 'hidden', bgcolor: '#fafbfc' }}>
                        {SelectedCV && (
                          <PDFViewer width="100%" height="100%">
                            <SelectedCV profile={profileData} />
                          </PDFViewer>
                        )}
                      </Box>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleCloseCvDialog}>İptal</Button>
                      {SelectedCV && (
                        <PDFDownloadLink document={<SelectedCV profile={profileData} />} fileName={`${form.name.replace(/ /g, '_')}_CV.pdf`}>
                          {({ loading }) => (
                            <Button variant="contained" disabled={loading}>
                              {loading ? 'Hazırlanıyor...' : 'Oluştur ve İndir'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      )}
                    </DialogActions>
                  </Dialog>
                </>
              )}
              {editMode && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleSaveEdit} fullWidth>Kaydet</Button>
                  <Button variant="outlined" color="secondary" onClick={handleCancelEdit} fullWidth>İptal</Button>
                </Stack>
              )}
            </Paper>
            <BadgesSection badges={badges} />

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography fontWeight={600}>Beceriler</Typography>
                <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>Beceri Ekle</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill, i) => (
                  <Chip key={i} label={skill} />
                ))}
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography fontWeight={600}>Diller</Typography>
                <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>Dil Ekle</Button>
              </Box>
              <Stack spacing={2}>
                {languages.map((lang, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography fontWeight={500}>{lang.name}</Typography>
                      <Typography color="text.secondary" fontSize={14}>{lang.level}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={lang.percent} sx={{ height: 8, borderRadius: 5, mt: 0.5 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>

          {/* Right Column */}
          <Box sx={{ width: { xs: '100%', md: '67%' } }}>
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>Hakkımda</Typography>
                  <Tooltip title="Düzenle">
                    <IconButton size="small"><EditIcon /></IconButton>
                  </Tooltip>
                </Box>
                {editMode ? (
                  <TextField
                    name="about"
                    value={form.about}
                    onChange={handleFormChange}
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={4}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography color="text.secondary" fontSize={15}>
                    {form.about.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </Typography>
                )}
              </Paper>

              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>İş Deneyimi</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>Deneyim Ekle</Button>
                </Box>
                <Stack spacing={2}>
                  {experiences.map((exp, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={600}>{exp.title}</Typography>
                        <Typography color="text.secondary" fontSize={14}>{exp.date}</Typography>
                      </Box>
                      <Typography color="text.secondary" fontSize={15} fontWeight={500}>{exp.company}</Typography>
                      <Typography color="text.secondary" fontSize={15}>{exp.desc}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>Eğitim</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>Eğitim Ekle</Button>
                </Box>
                <Stack spacing={2}>
                  {educations.map((edu, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={600}>{edu.degree}</Typography>
                        <Typography color="text.secondary" fontSize={14}>{edu.date}</Typography>
                      </Box>
                      <Typography color="text.secondary" fontSize={15} fontWeight={500}>{edu.school}</Typography>
                      <Typography color="text.secondary" fontSize={15}>{edu.desc}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>

        {/* Avatar Dialog */}
        <Dialog open={avatarDialogOpen} onClose={handleDialogClose} fullScreen={fullScreen}>
          <DialogTitle>Profil Fotoğrafı</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar src={newImage || profileImage || undefined} sx={{ width: 120, height: 120, mb: 2 }}>
                {!profileImage && !newImage && <PhotoCamera fontSize="large" />}
              </Avatar>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mb: 1 }}
              >
                Yeni Fotoğraf Yükle
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {profileImage && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveImage}
                  sx={{ mb: 1 }}
                >
                  Fotoğrafı Kaldır
                </Button>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>İptal</Button>
            <Button onClick={handleSaveImage} variant="contained" disabled={!newImage && !profileImage}>
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Profile; 