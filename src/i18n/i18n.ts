import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dil dosyalarını import et
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enJobs from './locales/en/jobs.json';
import enLanding from './locales/en/landing.json';
import enNotifications from './locales/en/notifications.json';
import enProfile from './locales/en/profile.json';
import enApplications from './locales/en/applications.json';

import trCommon from './locales/tr/common.json';
import trAuth from './locales/tr/auth.json';
import trDashboard from './locales/tr/dashboard.json';
import trJobs from './locales/tr/jobs.json';
import trLanding from './locales/tr/landing.json';
import trNotifications from './locales/tr/notifications.json';
import trProfile from './locales/tr/profile.json';
import trApplications from './locales/tr/applications.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    jobs: enJobs,
    landing: enLanding,
    notifications: enNotifications,
    profile: enProfile,
    applications: enApplications,
  },
  tr: {
    common: trCommon,
    auth: trAuth,
    dashboard: trDashboard,
    jobs: trJobs,
    landing: trLanding,
    notifications: trNotifications,
    profile: trProfile,
    applications: trApplications,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    // Dil algılama ayarları
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    },

    // Namespace ayarları
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'jobs', 'landing', 'notifications', 'profile', 'applications'],
  });

export default i18n;
