-- Veritabanı şeması düzeltmeleri
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. applications tablosundaki job_id alanını uuid tipine çevir
ALTER TABLE applications ALTER COLUMN job_id TYPE uuid USING job_id::text::uuid;

-- 2. jobs tablosundaki id alanını uuid tipine çevir (eğer değilse)
ALTER TABLE jobs ALTER COLUMN id TYPE uuid USING id::text::uuid;

-- 3. jobs tablosundaki company_id alanını uuid tipine çevir (eğer değilse)
ALTER TABLE jobs ALTER COLUMN company_id TYPE uuid USING company_id::text::uuid;

-- 4. companies tablosundaki id alanını uuid tipine çevir (eğer değilse)
ALTER TABLE companies ALTER COLUMN id TYPE uuid USING id::text::uuid;

-- 5. notifications tablosundaki company_id alanını uuid tipine çevir (eğer varsa)
ALTER TABLE notifications ALTER COLUMN company_id TYPE uuid USING company_id::text::uuid;

-- 6. Foreign key constraint'leri yeniden oluştur
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE applications ADD CONSTRAINT applications_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_company_id_fkey;
ALTER TABLE jobs ADD CONSTRAINT jobs_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_company_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 7. Index'leri yeniden oluştur
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
