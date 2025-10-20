import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, RadioGroup, FormControlLabel, Radio, Stepper, Step, StepLabel, IconButton, Switch, Divider, SelectChangeEvent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MapPin, Building, Clock, Users, Calendar } from 'lucide-react';
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

const commonBenefits = [
  'Özel Sağlık Sigortası',
  'Yemek Kartı',
  'Servis',
  'Esnek Çalışma Saatleri',
  'Uzaktan Çalışma',
  'Yıllık İzin',
  'Performans Primi',
  'Eğitim Desteği',
  'Yabancı Dil Kursu',
  'Spor Salonu Üyeliği',
  'Kreş Desteği',
  'Telefon Hattı',
  'Şirket Telefonu',
  'Şirket Bilgisayarı',
  'Doğum Günü İzni'
];

const steps = ['Temel Bilgiler', 'İş Detayları', 'İnceleme'];

interface JobForm {
  title: string;
  department: string;
  location: string;
  experience: string;
  employment: string;
  description: string;
  requirements: string;
  deadline: string;
  salary: {
    min: string;
    max: string;
    showSalary: boolean;
  };
  benefits: string[];
  extraRequirements: boolean[];
}

const JobPost: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<JobForm>({
    title: '',
    department: '',
    location: '',
    experience: '',
    employment: '',
    description: '',
    requirements: '',
    deadline: '',
    salary: {
      min: '',
      max: '',
      showSalary: false
    },
    benefits: [],
    extraRequirements: [false, false, false, false, false]
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name?.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'salary') {
        setForm(prev => ({
          ...prev,
          salary: {
            ...prev.salary,
            [child]: value
          }
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name as keyof JobForm]: value }));
    }
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
      description: form.description,
      requirements: form.requirements,
      deadline: form.deadline,
      salary: form.salary,
      benefits: form.benefits,
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

  const getExperienceLabel = (value: string) => {
    const exp = experienceLevels.find(e => e.value === value);
    return exp ? exp.label : '';
  };

  // İş Detayları Adımı
  const renderJobDetailsStep = () => (
    <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: '0 2px 8px #ececec' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        İş Detayları
      </Typography>
      <Grid container spacing={2}>
        {/* İş Tanımı */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="İş Tanımı"
            name="description"
            placeholder="İş tanımını detaylı bir şekilde yazın..."
            multiline
            minRows={5}
            value={form.description}
            onChange={handleChange}
            margin="dense"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Pozisyonun sorumluluklarını, beklentileri ve görevleri detaylı bir şekilde açıklayın
          </Typography>
        </Grid>

        {/* Gereksinimler */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Aranan Nitelikler"
            name="requirements"
            placeholder="Adaylarda aradığınız nitelikleri yazın..."
            multiline
            minRows={5}
            value={form.requirements}
            onChange={handleChange}
            margin="dense"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Adaylarda olmasını beklediğiniz teknik ve kişisel becerileri, deneyimleri ve eğitim gereksinimlerini belirtin
          </Typography>
        </Grid>

        {/* Son Başvuru Tarihi */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Son Başvuru Tarihi"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            İlanın yayında kalacağı son tarihi belirtin
          </Typography>
        </Grid>

        {/* Maaş Bilgisi */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Maaş Aralığı
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Maaş"
                name="salary.min"
                type="number"
                placeholder="30000"
                value={form.salary.min}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <Typography variant="body2">₺</Typography>
                }}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maksimum Maaş"
                name="salary.max"
                type="number"
                placeholder="45000"
                value={form.salary.max}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <Typography variant="body2">₺</Typography>
                }}
                margin="dense"
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Switch
                checked={form.salary.showSalary}
                onChange={(e) => {
                  setForm(prev => ({
                    ...prev,
                    salary: {
                      ...prev.salary,
                      showSalary: e.target.checked
                    }
                  }));
                }}
                size="small"
              />
            }
            label="Maaş bilgisini adaylara göster"
          />
        </Grid>

        {/* Yan Haklar */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Yan Haklar
          </Typography>
          
          {/* Hazır Yan Haklar */}
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Sık Kullanılan Yan Haklar
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {commonBenefits.map((benefit) => (
                <Button
                  key={benefit}
                  variant={form.benefits.includes(benefit) ? "contained" : "outlined"}
                  size="small"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      benefits: prev.benefits.includes(benefit)
                        ? prev.benefits.filter(b => b !== benefit)
                        : [...prev.benefits, benefit]
                    }));
                  }}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.8rem'
                  }}
                >
                  {benefit}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Özel Yan Hak Ekleme */}
          <TextField
            fullWidth
            label="Özel Yan Hak Ekle"
            placeholder="Yan hak eklemek için yazın ve Enter'a basın"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                e.preventDefault();
                const value = (e.target as HTMLInputElement).value.trim();
                if (!form.benefits.includes(value)) {
                  setForm(prev => ({
                    ...prev,
                    benefits: [...prev.benefits, value]
                  }));
                }
                (e.target as HTMLInputElement).value = '';
              }
            }}
            margin="dense"
          />
          
          {/* Seçilen Yan Haklar */}
          {form.benefits.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Seçilen Yan Haklar
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {form.benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {benefit}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          benefits: prev.benefits.filter((_, i) => i !== index)
                        }));
                      }}
                      sx={{ p: 0.5, color: 'primary.main' }}
                    >
                      <ArrowBackIcon style={{ transform: 'rotate(45deg)' }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        {/* Butonlar */}
        <Grid item xs={12} display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="outlined"
            onClick={() => setActiveStep((prev) => prev - 1)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Geri Dön
          </Button>
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            sx={{ borderRadius: 2, px: 4, bgcolor: '#1746a2', '&:hover': { bgcolor: '#12306b' } }}
          >
            Sonraki Adım
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <>
      <Header userType="corporate" />
      <Box sx={{ mt: 8 }}>
        <Box sx={{ background: '#fafbfc', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            {/* Üst Bar */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small" sx={{ mr: 1 }} onClick={() => navigate(-1)}>
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

            {/* Form Steps */}
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
            {activeStep === 1 && renderJobDetailsStep()}
            {activeStep === 2 && (
              <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: '0 2px 8px #ececec' }}>
                <Typography variant="h6" fontWeight={700} mb={4}>
                  İlan Önizleme
                </Typography>

                {/* İlan Başlığı ve Temel Bilgiler */}
                <Box mb={4}>
                  <Typography variant="h5" fontWeight={600} color="primary" mb={2}>
                    {form.title}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Building size={18} className="text-gray-500" />
                        <Typography variant="body2" color="text.secondary">
                          {form.department}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MapPin size={18} className="text-gray-500" />
                        <Typography variant="body2" color="text.secondary">
                          {form.location}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Clock size={18} className="text-gray-500" />
                        <Typography variant="body2" color="text.secondary">
                          {form.employment}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Users size={18} className="text-gray-500" />
                        <Typography variant="body2" color="text.secondary">
                          {getExperienceLabel(form.experience)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Calendar size={18} className="text-gray-500" />
                        <Typography variant="body2" color="text.secondary">
                          Son Başvuru: {new Date(form.deadline).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* İş Tanımı */}
                <Box mb={4}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    İş Tanımı
                  </Typography>
                  <Typography variant="body1" whiteSpace="pre-line">
                    {form.description}
                  </Typography>
                </Box>

                {/* Gereksinimler */}
                <Box mb={4}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Aranan Nitelikler
                  </Typography>
                  <Typography variant="body1" whiteSpace="pre-line">
                    {form.requirements}
                  </Typography>
                </Box>

                {/* Maaş Bilgisi */}
                {form.salary.showSalary && form.salary.min && form.salary.max && (
                  <Box mb={4}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Maaş Aralığı
                    </Typography>
                    <Typography variant="body1">
                      {form.salary.min} ₺ - {form.salary.max} ₺
                    </Typography>
                  </Box>
                )}

                {/* Yan Haklar */}
                {form.benefits.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Yan Haklar
                    </Typography>
                    <Grid container spacing={1}>
                      {form.benefits.map((benefit, index) => (
                        <Grid item key={index}>
                          <Box
                            sx={{
                              bgcolor: 'primary.50',
                              color: 'primary.main',
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              fontSize: '0.875rem'
                            }}
                          >
                            {benefit}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Butonlar */}
                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(prev => prev - 1)}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Geri Dön
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{ borderRadius: 2, px: 4, bgcolor: '#1746a2', '&:hover': { bgcolor: '#12306b' } }}
                  >
                    İlanı Yayınla
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