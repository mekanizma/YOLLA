-- Jobs tablosuna çalışma saatleri alanları ekle
-- Bu migration'ı Supabase SQL Editor'da çalıştırın

-- Jobs tablosuna çalışma saatleri alanları ekle
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_start_time time;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_end_time time;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_days text[]; -- ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

-- Açıklama ekle
COMMENT ON COLUMN jobs.work_start_time IS 'İşe başlama saati (HH:MM formatında)';
COMMENT ON COLUMN jobs.work_end_time IS 'İşten çıkış saati (HH:MM formatında)';
COMMENT ON COLUMN jobs.work_days IS 'Çalışma günleri (haftanın günleri)';

