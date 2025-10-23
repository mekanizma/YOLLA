-- Companies tablosuna bildirim ve gizlilik ayarları için sütunlar ekle
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Bildirim ayarları için sütunlar
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notification_new_applications BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notification_application_updates BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notification_job_expiry BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notification_marketing_emails BOOLEAN DEFAULT false;

-- Gizlilik ayarları için sütunlar
ALTER TABLE companies ADD COLUMN IF NOT EXISTS privacy_show_company_info BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS privacy_allow_direct_messages BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS privacy_show_active_jobs BOOLEAN DEFAULT true;

-- Mevcut şirketler için varsayılan değerleri ayarla
UPDATE companies SET 
  notification_new_applications = true,
  notification_application_updates = true,
  notification_job_expiry = true,
  notification_marketing_emails = false,
  privacy_show_company_info = true,
  privacy_allow_direct_messages = true,
  privacy_show_active_jobs = true
WHERE notification_new_applications IS NULL;
