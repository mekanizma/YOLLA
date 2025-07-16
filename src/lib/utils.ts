import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const jobCategories = [
  'Bilişim / Teknoloji',
  'Finans / Muhasebe',
  'Satış / Pazarlama',
  'Mühendislik',
  'Sağlık / Medikal',
  'Tasarım / Yaratıcı İşler',
  'Eğitim / Akademik',
  'Üretim / Operasyon',
  'Lojistik / Taşımacılık',
  'İnsan Kaynakları',
  'Hukuk',
  'Müşteri Hizmetleri',
  'Turizm / Otelcilik',
  'Diğer / Genel',
];

export const cities = [
  'LEFKOŞA',
  'GİRNE',
  'GAZİMAĞOSA',
  'LEFKE',
];

export const experienceLevels = [
  'Stajyer',
  '0-1 Yıl',
  '1-3 Yıl',
  '3-5 Yıl',
  '5-10 Yıl',
  '10+ Yıl',
];

export const workTypes = [
  'Tam Zamanlı',
  'Yarı Zamanlı',
  'Uzaktan',
  'Hibrit',
  'Sözleşmeli',
  'Staj',
];