import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, RadioGroup, FormControlLabel, Radio, Stepper, Step, StepLabel, IconButton, Switch } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';

const departments = [
  'Turizm ve Otelcilik',
  'İnsan Kaynakları',
  'Yazılım ve Bilişim Teknolojileri',
  'Satış ve Pazarlama',
  'Finans ve Muhasebe',
  'Müşteri Hizmetleri',
  'Üretim ve Operasyon',
  'Lojistik ve Tedarik Zinciri',
  'Mühendislik',
  'Eğitim ve Akademik',
  'Hukuk',
  'Tasarım ve Kreatif',
  'Sağlık ve Medikal',
  'İnşaat ve Mimarlık',
  'Yönetim ve İdari İşler',
  'Medya ve İletişim',
  'Güvenlik',
  'Danışmanlık',
  'Çağrı Merkezi',
  'E-ticaret',
  'Enerji ve Çevre',
  'Tarım ve Hayvancılık',
  'Spor ve Fitness',
  'Gıda ve İçecek',
  'Moda ve Tekstil',
  'Sigortacılık',
  'Bankacılık ve Finansal Hizmetler',
];
const locations = [
  'LEFKOŞA',
  'GİRNE',
  'GAZİMAĞUSA',
  'LEFKE',
  'GÜZELYURT',
];
const experienceLevels = [
  { label: 'Başlangıç Seviyesi', value: 'junior', desc: '0-2 yıl deneyim' },
  { label: 'Orta Seviye', value: 'mid', desc: '2-5 yıl deneyim' },
  { label: 'Kıdemli', value: 'senior', desc: '5+ yıl deneyim' },
];
const employmentTypes = ['Tam Zamanlı', 'Yarı Zamanlı', 'Sözleşmeli', 'Staj', 'Geçici'];

const steps = ['Temel Bilgiler', 'İş Detayları', 'İnceleme'];

const JobPost: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    department: '',
    location: '',
    experience: '',
    employment: '',
    extraRequirements: [false, false, false, false, false]
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob = {
      id: Date.now().toString(),
      title: form.title,
      department: form.department,
      location: form.location,
      experience: form.experience,
      employment: form.employment,
      status: 'active' as 'active' | 'closed',
      createdAt: new Date().toISOString(),
      applications: 0
    };

    const jobs = localStorage.getItem('corporate_jobs');
    const jobsArr = jobs ? JSON.parse(jobs) : [];
    jobsArr.push(newJob);
    localStorage.setItem('corporate_jobs', JSON.stringify(jobsArr));

    // Başarılı mesajı göster
    alert('İlan başarıyla oluşturuldu!');
    
    // İlanlar sayfasına yönlendir
    navigate('/corporate/jobs');
  };

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ mt: 8 }}>
        <Box sx={{ background: '#fafbfc', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            {/* Üst Bar */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small" sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={700}>
        Yeni İş İlanı Oluştur
      </Typography>
              </Box>
            </Box>
            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label, idx) => (
                <Step key={label} completed={activeStep > idx}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {/* Temel Bilgiler Formu */}
            {activeStep === 0 && (
              <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: '0 2px 8px #ececec' }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Temel Bilgiler
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
            <TextField
              fullWidth
              required
                      label="İlan Başlığı"
              name="title"
                      placeholder="Örn: Kıdemli Yazılım Geliştirici"
                      value={form.title}
              onChange={handleChange}
                      margin="dense"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      Aday aramalarında öne çıkması için açıklayıcı bir başlık seçin
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required margin="dense" sx={{ minWidth: { xs: '100%', md: 250 } }}>
                      <InputLabel>Departman seçin</InputLabel>
                <Select
                        label="Departman seçin"
                        name="department"
                        value={form.department}
                  onChange={handleChange}
                      >
                        <MenuItem value=""><em>Departman seçin</em></MenuItem>
                        {departments.map((d) => (
                          <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required margin="dense" sx={{ minWidth: { xs: '100%', md: 250 } }}>
                      <InputLabel>Konum seçin</InputLabel>
                <Select
                        label="Konum seçin"
                        name="location"
                        value={form.location}
                  onChange={handleChange}
                      >
                        <MenuItem value=""><em>Konum seçin</em></MenuItem>
                        {locations.map((l) => (
                          <MenuItem key={l} value={l}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography fontWeight={600} mb={1} mt={2}>Deneyim Seviyesi *</Typography>
                    <RadioGroup row name="experience" value={form.experience} onChange={handleChange}>
                      {experienceLevels.map((exp) => (
                        <FormControlLabel
                          key={exp.value}
                          value={exp.value}
                          control={<Radio sx={{ display: 'none' }} />}
                          label={
                            <Box sx={{
                              border: 1,
                              borderColor: form.experience === exp.value ? '#1746a2' : '#e0e3e7',
                              bgcolor: form.experience === exp.value ? '#f5f8ff' : '#fff',
                              borderRadius: 3,
                              px: 3,
                              py: 2,
                              minWidth: 180,
                              boxShadow: form.experience === exp.value ? '0 2px 8px #e3e8f0' : 'none',
                              color: '#222',
                              fontWeight: 500,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}>
                              <Typography fontWeight={600}>{exp.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{exp.desc}</Typography>
                            </Box>
                          }
                          sx={{ mr: 2, ml: 0 }}
                        />
                      ))}
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography fontWeight={600} mb={1} mt={2}>İstihdam Türü *</Typography>
                    <RadioGroup row name="employment" value={form.employment} onChange={handleChange}>
                      {employmentTypes.map((type) => (
                        <FormControlLabel
                          key={type}
                          value={type}
                          control={<Radio sx={{ display: 'none' }} />}
                          label={
                            <Box sx={{
                              border: 1,
                              borderColor: form.employment === type ? '#1746a2' : '#e0e3e7',
                              bgcolor: form.employment === type ? '#f5f8ff' : '#fff',
                              borderRadius: 3,
                              px: 3,
                              py: 2,
                              minWidth: 120,
                              boxShadow: form.employment === type ? '0 2px 8px #e3e8f0' : 'none',
                              color: '#222',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              justifyContent: 'center',
                            }}>
                              <Typography fontWeight={600}>{type}</Typography>
            </Box>
                          }
                          sx={{ mr: 2, ml: 0 }}
                        />
                      ))}
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
                    <Button variant="contained" sx={{ borderRadius: 2, px: 4, bgcolor: '#1746a2', '&:hover': { bgcolor: '#12306b' } }} onClick={() => setActiveStep((prev) => prev + 1)}>
                      Sonraki Adım
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}
            {/* İş Detayları Adımı */}
            {activeStep === 1 && (
              <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: '0 2px 8px #ececec', mt: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  İş Detayları
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography fontWeight={600} mb={1}>Maaş Aralığı</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="salaryMin"
                      placeholder="Minimum"
                      margin="dense"
                      InputProps={{ startAdornment: <span style={{ color: '#bdbdbd', marginRight: 8 }}>₺</span> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
            <TextField
              fullWidth
                      name="salaryMax"
                      placeholder="Maksimum"
                      margin="dense"
                      InputProps={{ startAdornment: <span style={{ color: '#bdbdbd', marginRight: 8 }}>₺</span> }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Switch size="small" />
                      <Typography variant="body2">Maaş bilgisini adaylara gösterme</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="İş Tanımı"
              name="description"
                      placeholder="İş tanımını, sorumlulukları ve gereksinimleri detaylı olarak açıklayın..."
                      margin="dense"
              multiline
                      minRows={5}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      Aday profilinizi, günlük sorumlulukları ve pozisyonun şirketinizdeki rolünü açıklayın
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                <TextField
                      fullWidth
                      label="Gerekli Beceriler"
                      name="skills"
                      placeholder="Beceri eklemek için yazın ve Enter'a basın"
                      margin="dense"
                />
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      {/* Örnek chipler */}
                      <Button size="small" variant="outlined">JavaScript</Button>
                      <Button size="small" variant="outlined">React</Button>
                      <Button size="small" variant="outlined">Node.js</Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                <TextField
                      fullWidth
                      label="Son Başvuru Tarihi"
                      name="deadline"
                      placeholder="mm/dd/yyyy"
                      margin="dense"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography fontWeight={600} mb={1} mt={2}>Ek Gereksinimler</Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {[
                        'Üniversite mezunu',
                        'Seyahat edebilir',
                        'Sertifika sahibi',
                        'Yabancı dil bilgisi',
                        'Askerlik durumunu tamamlamış (Erkek adaylar için)'
                      ].map((label, idx) => {
                        const checked = (form.extraRequirements || [])[idx];
                        return (
                          <Box
                            key={label}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: 1,
                              borderColor: checked ? '#1746a2' : '#e0e3e7',
                              bgcolor: checked ? '#f5f8ff' : '#fff',
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              transition: 'all 0.2s',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const arr = [...(form.extraRequirements || [false, false, false, false, false])];
                              arr[idx] = !arr[idx];
                              setForm((prev) => ({ ...prev, extraRequirements: arr }));
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!!checked}
                              readOnly
                              style={{ marginRight: 12 }}
                            />
                            <Typography>{label}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Grid>
                </Grid>
                {/* Butonlar kutunun en altında, tam sola ve tam sağa hizalı */}
                <Box mt={5} display="flex" justifyContent="space-between" alignItems="center">
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2, minWidth: 120 }} onClick={() => setActiveStep((prev) => prev - 1)}>
                    Önceki Adım
                  </Button>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2, minWidth: 140, bgcolor: '#1746a2', '&:hover': { bgcolor: '#12306b' } }} onClick={() => setActiveStep((prev) => prev + 1)}>
                    Sonraki Adım
                  </Button>
                </Box>
              </Paper>
            )}
            {/* İnceleme ve Yayınlama Adımı */}
            {activeStep === 2 && (
              <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: '0 2px 8px #ececec', mt: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  İnceleme ve Yayınlama
                </Typography>
                <Typography variant="subtitle1" fontWeight={500} mb={2}>
                  İlan Önizleme
                  <Button size="small" sx={{ float: 'right' }}>Tam Önizleme</Button>
                </Typography>
                <Paper elevation={0} sx={{ borderRadius: 3, p: 3, background: '#fafbfc', mb: 2 }}>
                  <Typography variant="h5" fontWeight={700} mb={1}>Kıdemli Yazılım Geliştirici</Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Typography variant="body2">Teknoloji A.Ş.</Typography>
                    <Typography variant="body2">• İstanbul</Typography>
                    <Typography variant="body2">• Tam Zamanlı</Typography>
                    <Typography variant="body2">• Kıdemli (5+ yıl)</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>Son Başvuru: 07.07.2025</Typography>
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle1" fontWeight={600}>İş Tanımı</Typography>
                    <Typography variant="body2" mb={1}>
                      Teknoloji A.Ş. olarak, yazılım ekibimize katılacak deneyimli bir Kıdemli Yazılım Geliştirici arıyoruz. Bu pozisyonda, modern web uygulamaları geliştirmek, mevcut sistemleri optimize etmek ve teknik ekibe liderlik etmek için çalışacaksınız.
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>Sorumluluklar:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Frontend ve backend sistemlerin geliştirilmesi</li>
                      <li>Kod kalitesinin ve performansının optimize edilmesi</li>
                      <li>Junior geliştiricilere mentorluk yapılması</li>
                      <li>Teknik gereksinimlerin analiz edilmesi ve çözüm önerileri sunulması</li>
                    </ul>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>Gerekli Beceriler</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    <Button size="small" variant="outlined">JavaScript</Button>
                    <Button size="small" variant="outlined">React</Button>
                    <Button size="small" variant="outlined">Node.js</Button>
                    <Button size="small" variant="outlined">SQL</Button>
                    <Button size="small" variant="outlined">Git</Button>
          </Box>
                  <Typography variant="body2" fontWeight={600}>Maaş Aralığı</Typography>
                  <Typography variant="body2" mb={1}>₺30,000 - ₺45,000 / ay</Typography>
                </Paper>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button variant="outlined" sx={{ borderRadius: 2, px: 4 }} onClick={() => setActiveStep((prev) => prev - 1)}>
                    Önceki Adım
            </Button>
                  <Button variant="contained" sx={{ borderRadius: 2, px: 4, bgcolor: '#1746a2', '&:hover': { bgcolor: '#12306b' } }}>
                    Oluştur
            </Button>
          </Box>
              </Paper>
            )}
    </Container>
        </Box>
      </Box>
    </>
  );
};

export default JobPost; 