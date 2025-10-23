# Yollabi - İş İlanları ve CV Platformu

Modern React + Vite + Supabase teknolojileri ile geliştirilmiş iş ilanları ve CV platformu.

## 🚀 Teknolojiler

- **Frontend:** React 18, TypeScript, Vite
- **UI Framework:** Ant Design, Material-UI
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Charts:** Ant Design Charts
- **PDF Generation:** React PDF, jsPDF
- **Excel Export:** XLSX

## 📦 Kurulum

### Geliştirme Ortamı

```bash
# Repository'yi klonlayın
git clone https://github.com/your-username/yollabi.git
cd yollabi

# Bağımlılıkları yükleyin
npm install

# Environment variables'ı ayarlayın
cp env.example .env.local
# .env.local dosyasını düzenleyin ve Supabase bilgilerinizi ekleyin

# Geliştirme sunucusunu başlatın
npm run dev
```

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🐳 Docker ile Çalıştırma

```bash
# Docker ile build ve çalıştırma
docker build -t yollabi .
docker run -p 3000:80 yollabi

# Docker Compose ile çalıştırma
docker-compose up -d
```

## ☁️ Coolify ile Deploy

### 1. Coolify Kurulumu
```bash
# Sunucunuza Coolify kurun
curl -sSL https://coolify.io/install | bash
```

### 2. Proje Ayarları
- Coolify arayüzünde yeni proje oluşturun
- GitHub repository'nizi bağlayın
- Docker Compose seçeneğini seçin

### 3. Environment Variables
Coolify dashboard'unda şu değişkenleri ekleyin:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=https://your-domain.com
VITE_APP_DOMAIN=your-domain.com
```

### 4. Deploy Ayarları
- **Build Command:** `docker-compose up -d --build`
- **Port:** `3000`
- **Domain:** Kendi domain'inizi ekleyin

### 5. Otomatik Deploy
- Repository'nize push yaptığınızda otomatik deploy olacak
- Coolify otomatik SSL sertifikası sağlar

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── cv-templates/   # CV şablonları
│   ├── layout/         # Layout bileşenleri
│   └── ui/             # UI bileşenleri
├── lib/                # Servisler ve utilities
├── pages/              # Sayfa bileşenleri
│   ├── admin/          # Admin paneli
│   ├── auth/           # Kimlik doğrulama
│   ├── corporate/      # Şirket paneli
│   └── individual/     # Bireysel panel
└── assets/             # Statik dosyalar
```

## 🔧 Geliştirme Komutları

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run preview      # Build önizleme
npm run lint         # ESLint kontrolü
```

## 📝 Özellikler

### Bireysel Kullanıcılar
- ✅ Profil oluşturma ve düzenleme
- ✅ CV şablonları (5 farklı tasarım)
- ✅ İş ilanlarını görüntüleme ve başvuru
- ✅ Şirketlerle mesajlaşma
- ✅ Bildirimler

### Şirketler
- ✅ İş ilanı oluşturma ve yönetme
- ✅ Başvuruları görüntüleme
- ✅ Adaylarla mesajlaşma
- ✅ Dashboard ve istatistikler

### Admin Panel
- ✅ Kullanıcı yönetimi
- ✅ İş ilanı moderasyonu
- ✅ Sistem istatistikleri
- ✅ Genel ayarlar

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorunuz için GitHub Issues kullanabilirsiniz.
