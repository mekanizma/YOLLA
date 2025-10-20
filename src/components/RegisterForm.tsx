import React, { useState } from 'react';
import {
  Button, MenuItem, TextField, Select, InputLabel, FormControl, FormHelperText, Card, CardContent, Typography, Box, Divider
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Link } from 'react-router-dom';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import WcIcon from '@mui/icons-material/Wc';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import TimelineIcon from '@mui/icons-material/Timeline';
import Grid from '@mui/material/Grid';
import { cities } from '../lib/utils';

const educationLevels = [
  'İlköğretim', 'Lise', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora'
];
const genders = [
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
  { value: 'other', label: 'Diğer' },
];

interface RegisterFormProps {
  onSubmit?: (data: any) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: null as Date | null,
    city: '',
    gender: '',
    education: '',
    job: '',
    experience: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = 'Ad zorunlu';
    if (!form.surname) newErrors.surname = 'Soyad zorunlu';
    if (!form.email) newErrors.email = 'E-posta zorunlu';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!form.password) newErrors.password = 'Şifre zorunlu';
    else if (form.password.length < 8) newErrors.password = 'Şifre en az 8 karakter olmalı';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Şifre tekrar zorunlu';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    if (!form.phone) newErrors.phone = 'Telefon zorunlu';
    if (!form.birthDate) newErrors.birthDate = 'Doğum tarihi zorunlu';
    if (!form.city) newErrors.city = 'Şehir zorunlu';
    if (!form.gender) newErrors.gender = 'Cinsiyet zorunlu';
    if (!form.education) newErrors.education = 'Eğitim seviyesi zorunlu';
    if (!form.job) newErrors.job = 'Meslek zorunlu';
    if (!form.experience) newErrors.experience = 'Deneyim yılı zorunlu';
    if (!agree) newErrors.agree = 'Kullanım şartlarını ve gizlilik politikasını kabul etmelisiniz.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setForm((prev) => ({ ...prev, birthDate: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const data = {
      ...form,
      birthDate: form.birthDate ? form.birthDate.toISOString().split('T')[0] : null,
      agree
    };
    if (onSubmit) onSubmit(data);
    setLoading(false);
  };

  return (
    <Card elevation={4} sx={{ borderRadius: 3, mt: 2, mb: 2, p: { xs: 1, sm: 2 } }}>
      <CardContent>
        <Box textAlign="center" mb={2}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={700} mb={0.5} color="primary.main">
            Kayıt Ol
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hemen kaydol, iş fırsatlarını kaçırma!
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ad"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                InputProps={{ startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Soyad"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                error={!!errors.surname}
                helperText={errors.surname}
                fullWidth
                InputProps={{ startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="E-posta"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                InputProps={{ startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Şifre"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                InputProps={{ startAdornment: <LockIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Şifre Tekrar"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
                InputProps={{ startAdornment: <LockIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Telefon"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
                InputProps={{ startAdornment: <PhoneIphoneIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DatePicker
                  label="Doğum Tarihi"
                  value={form.birthDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      name: 'birthDate',
                      error: !!errors.birthDate,
                      helperText: errors.birthDate,
                      fullWidth: true,
                      InputProps: { startAdornment: <CalendarMonthIcon color="action" sx={{ mr: 1 }} /> },
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.city}>
                <InputLabel><LocationCityIcon sx={{ mr: 1, mb: -0.5 }} />Şehir</InputLabel>
                <Select
                  name="city"
                  value={form.city}
                  onChange={(e) => handleChange({ target: { name: 'city', value: e.target.value } } as any)}
                  label="Şehir"
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.city}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel><WcIcon sx={{ mr: 1, mb: -0.5 }} />Cinsiyet</InputLabel>
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={(e) => handleChange({ target: { name: 'gender', value: e.target.value } } as any)}
                  label="Cinsiyet"
                >
                  {genders.map((g) => (
                    <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.gender}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.education}>
                <InputLabel><SchoolIcon sx={{ mr: 1, mb: -0.5 }} />Eğitim Seviyesi</InputLabel>
                <Select
                  name="education"
                  value={form.education}
                  onChange={(e) => handleChange({ target: { name: 'education', value: e.target.value } } as any)}
                  label="Eğitim Seviyesi"
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.education}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meslek"
                name="job"
                value={form.job}
                onChange={handleChange}
                error={!!errors.job}
                helperText={errors.job}
                fullWidth
                InputProps={{ startAdornment: <WorkIcon color="action" sx={{ mr: 1 }} /> }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Deneyim Yılı"
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                error={!!errors.experience}
                helperText={errors.experience}
                fullWidth
                InputProps={{ startAdornment: <TimelineIcon color="action" sx={{ mr: 1 }} /> }}
                required
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <FormControlLabel
              control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
              label={
                <Typography variant="body2">
                  <Link to="/terms" className="text-primary">Kullanım Şartları</Link> ve <Link to="/privacy" className="text-primary">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                </Typography>
              }
            />
          </Box>
          {errors.agree && (
            <Typography variant="caption" color="error" sx={{ mt: -1, mb: 1, display: 'block' }}>
              {errors.agree}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 2, boxShadow: 2, transition: '0.2s', ':hover': { backgroundColor: 'primary.dark', boxShadow: 4 } }}
            disabled={loading}
          >
            Kayıt Ol
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm; 