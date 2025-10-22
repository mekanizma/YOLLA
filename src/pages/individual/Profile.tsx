import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getCurrentUserProfile, updateCurrentUserProfile } from '../../lib/profileService';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ModernCV } from '../../components/cv-templates/ModernCV';
import { MinimalCV } from '../../components/cv-templates/MinimalCV';
import { ElegantCV } from '../../components/cv-templates/ElegantCV';
import { ProfessionalCV } from '../../components/cv-templates/ProfessionalCV';
import { CreativeCV } from '../../components/cv-templates/CreativeCV';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import supabase from '../../lib/supabaseClient';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';

// Boş başlangıç dizileri: kullanıcı kendi dolduracak (state içinde tutulur)

// Mock veriler kaldırıldı: kullanıcı boş başlayacak ve kendi dolduracak

const cvTemplates = [
  { key: 'modern', label: 'Modern', component: ModernCV },
  { key: 'minimal', label: 'Minimal', component: MinimalCV },
  { key: 'elegant', label: 'Elegant', component: ElegantCV },
  { key: 'professional', label: 'Professional', component: ProfessionalCV },
  { key: 'creative', label: 'Creative', component: CreativeCV },
];

// Rozetler artık Dashboard'da gerçek verilerle gösteriliyor

const Profile = () => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    about: ''
  });
  const [skillsState, setSkillsState] = useState<string[]>([]);
  const [languagesState, setLanguagesState] = useState<{ name: string; level?: string; percent?: number }[]>([]);
  const [experiencesState, setExperiencesState] = useState<{ title: string; company: string; desc: string; date: string }[]>([]);
  const [educationsState, setEducationsState] = useState<{ degree: string; school: string; desc: string; date: string }[]>([]);
  const [formBackup, setFormBackup] = useState(form);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [cvDialogOpen, setCvDialogOpen] = useState(false);
  const [cvType, setCvType] = useState('modern');
  const [completion, setCompletion] = useState(0);
  // Dialog states for add forms
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  // Temp form states
  const [newSkill, setNewSkill] = useState('');
  const [newLangName, setNewLangName] = useState('');
  const [newLangPercent, setNewLangPercent] = useState<number | ''>('');
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpDate, setNewExpDate] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduSchool, setNewEduSchool] = useState('');
  const [newEduDate, setNewEduDate] = useState('');
  const [newEduDesc, setNewEduDesc] = useState('');

  const Transition = React.useMemo(
    () => React.forwardRef(function Transition(
      props: TransitionProps & { children: React.ReactElement<any, any> }, ref: React.Ref<unknown>
    ) {
      return <Slide direction="up" ref={ref} {...props} />;
    }),
    []
  );

  const handleAvatarClick = () => setAvatarDialogOpen(true);
  const handleDialogClose = () => {
    setAvatarDialogOpen(false);
    setNewImage(null);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setNewImage(URL.createObjectURL(file));
    }
  };
  const handleSaveImage = async () => {
    try {
      if (selectedFile) {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user?.id) throw new Error('Giriş yapılmamış.');
        const path = `user-${user.id}/${Date.now()}-${selectedFile.name}`;
        const { error: upErr } = await supabase
          .storage
          .from('avatars')
          .upload(path, selectedFile, { contentType: selectedFile.type, upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
        const publicUrl = pub.publicUrl;
        setProfileImage(publicUrl);
        await updateCurrentUserProfile({ avatar: publicUrl });
      }
    } finally {
      setAvatarDialogOpen(false);
      setNewImage(null);
      setSelectedFile(null);
    }
  };
  const handleRemoveImage = () => {
    setProfileImage('');
    updateCurrentUserProfile({ avatar: '' }).catch(() => {});
    setAvatarDialogOpen(false);
    setNewImage(null);
    setSelectedFile(null);
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
  const handleSaveEdit = async () => {
    await updateCurrentUserProfile({ 
      name: form.name, 
      title: form.title, 
      phone: form.phone, 
      location: form.location,
      about: form.about,
      skills: skillsState,
      languages: languagesState,
      experiences: experiencesState,
      educations: educationsState
    });
    setEditMode(false);
    recomputeCompletion();
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
    skills: [],
    languages: [],
    experiences: [],
    educations: [],
    photo: profileImage,
  };
  const SelectedCV = cvTemplates.find(t => t.key === cvType)?.component;

  const recomputeCompletion = () => {
    const checks = [
      !!form.name,
      !!form.title,
      !!form.phone,
      !!form.location,
      !!form.about,
      skillsState.length > 0,
      languagesState.length > 0,
      experiencesState.length > 0,
      educationsState.length > 0,
    ];
    const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    setCompletion(pct);
  };

  useEffect(() => {
    recomputeCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.title, form.phone, form.location, form.about, skillsState, languagesState, experiencesState, educationsState]);

  return (
    <>
      <Header userType="individual" />
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        {/* Supabase profilini yükle */}
        <LoadProfile setForm={setForm} setProfileImage={setProfileImage} setSkills={setSkillsState} setLanguages={setLanguagesState} setExperiences={setExperiencesState} setEducations={setEducationsState} />
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
                <Button size="small" variant="outlined" sx={{ mt: 1, mb: 2 }}>{t('profile:experienceYears', { years: 5 })}</Button>
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
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={500} fontSize={15} mb={1}>{t('profile:profileCompletion')}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Button size="small" variant="outlined">{t('profile:progress')}</Button>
                <Box sx={{ flex: 1, ml: 2, fontWeight: 600 }}>{completion}%</Box>
              </Box>
              <LinearProgress variant="determinate" value={completion} sx={{ height: 8, borderRadius: 5, mb: 2 }} />
              {!editMode && (
                <>
                  <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={handleEditClick}>{t('profile:editProfile')}</Button>
                  <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={handleOpenCvDialog}>{t('profile:createAutoCV')}</Button>
                  <Dialog open={cvDialogOpen} onClose={handleCloseCvDialog} fullScreen={fullScreen} maxWidth="md">
                    <DialogTitle>{t('profile:selectCVDesign')}</DialogTitle>
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
                      <Button onClick={handleCloseCvDialog}>{t('profile:cancel')}</Button>
                      {SelectedCV && (
                        <PDFDownloadLink 
                          document={<SelectedCV profile={profileData} />} 
                          fileName={`${form.name.replace(/ /g, '_')}_CV.pdf`}
                        >
                          <Button variant="contained">
                            {t('profile:createAndDownload')}
                          </Button>
                        </PDFDownloadLink>
                      )}
                    </DialogActions>
                  </Dialog>
                </>
              )}
              {editMode && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleSaveEdit} fullWidth>{t('profile:save')}</Button>
                  <Button variant="outlined" color="secondary" onClick={handleCancelEdit} fullWidth>{t('profile:cancel')}</Button>
                </Stack>
              )}
            </Paper>
            {/* Rozetler artık Dashboard'da gösteriliyor */}
          </Box>

          {/* Right Column */}
          <Box sx={{ width: { xs: '100%', md: '67%' } }}>
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>{t('common:aboutMe')}</Typography>
                  <Tooltip title={t('common:edit')}>
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
                    {(form.about || '').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </Typography>
                )}
              </Paper>

              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>{t('profile:workExperience')}</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={() => { if (!editMode) setEditMode(true); setExperienceDialogOpen(true); }}>{t('profile:addExperience')}</Button>
                </Box>
                <Stack spacing={2}>
                  {experiencesState.map((exp, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={600}>{exp.title}</Typography>
                        <Typography color="text.secondary" fontSize={14}>{exp.date}</Typography>
                      </Box>
                      <Typography color="text.secondary" fontSize={15} fontWeight={500}>{exp.company}</Typography>
                      <Typography color="text.secondary" fontSize={15}>{exp.desc}</Typography>
                      {editMode && (
                        <Button size="small" color="error" onClick={() => setExperiencesState(prev => prev.filter((_, idx) => idx !== i))} sx={{ mt: 0.5 }}>{t('profile:delete')}</Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>{t('profile:education')}</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={() => { if (!editMode) setEditMode(true); setEducationDialogOpen(true); }}>{t('profile:addEducation')}</Button>
                </Box>
                <Stack spacing={2}>
                  {educationsState.map((edu, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={600}>{edu.degree}</Typography>
                        <Typography color="text.secondary" fontSize={14}>{edu.date}</Typography>
                      </Box>
                      <Typography color="text.secondary" fontSize={15} fontWeight={500}>{edu.school}</Typography>
                      <Typography color="text.secondary" fontSize={15}>{edu.desc}</Typography>
                      {editMode && (
                        <Button size="small" color="error" onClick={() => setEducationsState(prev => prev.filter((_, idx) => idx !== i))} sx={{ mt: 0.5 }}>{t('profile:delete')}</Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Skills moved under Education */}
              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>{t('profile:skills')}</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={() => { if (!editMode) setEditMode(true); setSkillDialogOpen(true); }}>{t('profile:addSkill')}</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {skillsState.map((skill, i) => (
                    <Chip key={i} label={skill} onDelete={editMode ? () => setSkillsState(prev => prev.filter((_, idx) => idx !== i)) : undefined} />
                  ))}
                </Box>
              </Paper>

              {/* Languages moved under Education */}
              <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography fontWeight={600}>{t('profile:languages')}</Typography>
                  <Button size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={() => { if (!editMode) setEditMode(true); setLanguageDialogOpen(true); }}>{t('profile:addLanguage')}</Button>
                </Box>
                <Stack spacing={2}>
                  {languagesState.map((lang, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}>{lang.name}</Typography>
                        <Typography color="text.secondary" fontSize={14}>{lang.level || ''}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={lang.percent || 0} sx={{ height: 8, borderRadius: 5, mt: 0.5 }} />
                      {editMode && (
                        <Button size="small" color="error" onClick={() => setLanguagesState(prev => prev.filter((_, idx) => idx !== i))} sx={{ mt: 0.5 }}>{t('profile:delete')}</Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>

        {/* Avatar Dialog */}
        <Dialog open={avatarDialogOpen} onClose={handleDialogClose} fullScreen={fullScreen}>
          <DialogTitle>{t('profile:profilePhoto')}</DialogTitle>
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
                {t('profile:uploadNewPhoto')}
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
                  {t('profile:removePhoto')}
                </Button>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>{t('profile:cancel')}</Button>
            <Button onClick={handleSaveImage} variant="contained" disabled={!newImage && !profileImage}>
              {t('profile:save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      {/* Add Skill Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 3, backdropFilter: 'saturate(180%) blur(6px)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('common:addNewSkill')}</DialogTitle>
        <DialogContent dividers>
          <TextField label={t('common:skill')} placeholder={t('common:skillPlaceholder')} fullWidth value={newSkill} onChange={e => setNewSkill(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)} variant="text">{t('common:cancel')}</Button>
          <Button disabled={!newSkill.trim()} onClick={() => { if (newSkill.trim()) setSkillsState(prev => Array.from(new Set([...prev, newSkill.trim()]))); setNewSkill(''); setSkillDialogOpen(false); }} variant="contained">{t('common:create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Language Dialog */}
      <Dialog open={languageDialogOpen} onClose={() => setLanguageDialogOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 3, backdropFilter: 'saturate(180%) blur(6px)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('common:addNewLanguage')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('common:languageName')} placeholder={t('common:languagePlaceholder')} fullWidth value={newLangName} onChange={e => setNewLangName(e.target.value)} autoFocus />
            <TextField label={t('common:percentage')} type="number" fullWidth value={newLangPercent} onChange={e => setNewLangPercent(e.target.value === '' ? '' : Number(e.target.value))} inputProps={{ min: 0, max: 100 }} helperText={t('common:proficiencyHelper')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageDialogOpen(false)} variant="text">{t('common:cancel')}</Button>
          <Button disabled={!newLangName.trim()} onClick={() => { if (newLangName.trim()) setLanguagesState(prev => [...prev, { name: newLangName.trim(), percent: typeof newLangPercent === 'number' ? Math.max(0, Math.min(100, newLangPercent)) : 0 }]); setNewLangName(''); setNewLangPercent(''); setLanguageDialogOpen(false); }} variant="contained">{t('common:create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Experience Dialog */}
      <Dialog open={experienceDialogOpen} onClose={() => setExperienceDialogOpen(false)} maxWidth="sm" fullWidth TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 3, backdropFilter: 'saturate(180%) blur(6px)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('profile:addExperienceTitle')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('profile:position')} placeholder={t('profile:positionPlaceholder')} fullWidth value={newExpTitle} onChange={e => setNewExpTitle(e.target.value)} autoFocus />
            <TextField label={t('profile:company')} placeholder={t('profile:companyPlaceholder')} fullWidth value={newExpCompany} onChange={e => setNewExpCompany(e.target.value)} />
            <TextField label={t('profile:dateRange')} placeholder={t('profile:dateRangePlaceholder')} fullWidth value={newExpDate} onChange={e => setNewExpDate(e.target.value)} />
            <TextField label={t('profile:description')} placeholder={t('profile:descriptionPlaceholder')} multiline minRows={3} fullWidth value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialogOpen(false)} variant="text">{t('profile:cancel')}</Button>
          <Button disabled={!newExpTitle.trim()} onClick={() => { if (newExpTitle.trim()) setExperiencesState(prev => [...prev, { title: newExpTitle.trim(), company: newExpCompany.trim(), date: newExpDate.trim(), desc: newExpDesc.trim() }]); setNewExpTitle(''); setNewExpCompany(''); setNewExpDate(''); setNewExpDesc(''); setExperienceDialogOpen(false); }} variant="contained">{t('profile:add')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Education Dialog */}
      <Dialog open={educationDialogOpen} onClose={() => setEducationDialogOpen(false)} maxWidth="sm" fullWidth TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 3, backdropFilter: 'saturate(180%) blur(6px)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('profile:addEducationTitle')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('profile:degree')} placeholder={t('profile:degreePlaceholder')} fullWidth value={newEduDegree} onChange={e => setNewEduDegree(e.target.value)} autoFocus />
            <TextField label={t('profile:school')} placeholder={t('profile:schoolPlaceholder')} fullWidth value={newEduSchool} onChange={e => setNewEduSchool(e.target.value)} />
            <TextField label={t('profile:dateRange')} placeholder={t('profile:dateRangePlaceholder')} fullWidth value={newEduDate} onChange={e => setNewEduDate(e.target.value)} />
            <TextField label={t('profile:description')} placeholder={t('profile:educationDescriptionPlaceholder')} multiline minRows={3} fullWidth value={newEduDesc} onChange={e => setNewEduDesc(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEducationDialogOpen(false)} variant="text">{t('profile:cancel')}</Button>
          <Button disabled={!newEduDegree.trim()} onClick={() => { if (newEduDegree.trim()) setEducationsState(prev => [...prev, { degree: newEduDegree.trim(), school: newEduSchool.trim(), date: newEduDate.trim(), desc: newEduDesc.trim() }]); setNewEduDegree(''); setNewEduSchool(''); setNewEduDate(''); setNewEduDesc(''); setEducationDialogOpen(false); }} variant="contained">{t('profile:add')}</Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </>
  );
};

export default Profile; 

// Yardımcı alt bileşen: yükleme sırasında profil bilgisini getirir
function LoadProfile({ setForm, setProfileImage, setSkills, setLanguages, setExperiences, setEducations }: { setForm: (v: any) => void; setProfileImage: (v: string) => void; setSkills: (v: string[]) => void; setLanguages: (v: any[]) => void; setExperiences: (v: any[]) => void; setEducations: (v: any[]) => void; }) {
  useEffect(() => {
    (async () => {
      const p = await getCurrentUserProfile();
      if (p) {
        setForm((prev: any) => ({
          ...prev,
          name: p.name || (p.email ? (p.email.split('@')[0]) : ''),
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || '',
          title: p.title || '',
          about: (p as any).about || ''
        }));
        if (p.avatar) setProfileImage(p.avatar);
        if (p.skills) setSkills(p.skills as string[]);
        if (p.languages) setLanguages(p.languages as any[]);
        if (p.experiences) setExperiences(p.experiences as any[]);
        if (p.educations) setEducations(p.educations as any[]);
      }
    })();
  }, [setForm, setProfileImage, setSkills, setLanguages, setExperiences, setEducations]);
  return null;
}