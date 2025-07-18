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

// SEO Helper Fonksiyonları
export const updateMetaTags = (
  title: string,
  description: string,
  keywords?: string,
  image?: string,
  url?: string
) => {
  // Sayfa başlığını güncelle
  document.title = title ? `${title} | İşBul` : 'İşBul - Kıbrıs\'ın En Kapsamlı İş Arama ve Kariyer Platformu';

  // Meta description güncelle
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  // Meta keywords güncelle
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords && keywords) {
    metaKeywords.setAttribute('content', keywords);
  }

  // Open Graph meta etiketlerini güncelle
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');

  if (ogTitle) ogTitle.setAttribute('content', title ? `${title} | İşBul` : 'İşBul');
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogImage && image) ogImage.setAttribute('content', image);
  if (ogUrl && url) ogUrl.setAttribute('content', url);

  // Twitter meta etiketlerini güncelle
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  const twitterImage = document.querySelector('meta[property="twitter:image"]');
  const twitterUrl = document.querySelector('meta[property="twitter:url"]');

  if (twitterTitle) twitterTitle.setAttribute('content', title ? `${title} | İşBul` : 'İşBul');
  if (twitterDescription) twitterDescription.setAttribute('content', description);
  if (twitterImage && image) twitterImage.setAttribute('content', image);
  if (twitterUrl && url) twitterUrl.setAttribute('content', url);

  // Canonical URL güncelle
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && url) {
    canonical.setAttribute('href', url);
  }
};

// Örnek kullanım için hazır SEO içerikleri
export const pageSEOContent = {
  home: {
    title: 'Ana Sayfa',
    description: 'İşBul ile hayalinizdeki işi bulun! Kıbrıs\'ın en kapsamlı iş ilanları, CV oluşturma ve kariyer fırsatları.',
    keywords: 'iş ilanları, kariyer, cv oluşturma, iş arama, kıbrıs iş ilanları'
  },
  jobs: {
    title: 'İş İlanları',
    description: 'Binlerce güncel iş ilanı arasından size en uygun pozisyonu bulun. Hemen başvurun!',
    keywords: 'açık pozisyonlar, iş fırsatları, tam zamanlı, yarı zamanlı, uzaktan çalışma'
  },
  profile: {
    title: 'Profil',
    description: 'Profesyonel profilinizi oluşturun ve güncelleyin. CV\'nizi öne çıkarın!',
    keywords: 'cv oluşturma, özgeçmiş, profil düzenleme, kariyer profili'
  },
  companies: {
    title: 'Şirketler',
    description: 'Kıbrıs\'ın önde gelen şirketlerini keşfedin. Hayalinizdeki şirkette çalışma fırsatını yakalayın!',
    keywords: 'şirketler, işverenler, firma profilleri, şirket kültürü'
  }
};