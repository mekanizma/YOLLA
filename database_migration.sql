-- VERİTABANI ŞEMASI DÜZELTMESİ (RLS Policy'leri ile uyumlu)
-- Bu migration'ı Supabase SQL Editor'da çalıştırın

-- 1. users tablosuna auth_user_id alanı ekle (UUID tipinde)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 2. Mevcut policy'leri kontrol et ve geçici olarak kaldır
DROP POLICY IF EXISTS applications_select_self ON applications;
DROP POLICY IF EXISTS applications_insert_self ON applications;
DROP POLICY IF EXISTS applications_update_self ON applications;
DROP POLICY IF EXISTS applications_delete_self ON applications;
DROP POLICY IF EXISTS applications_select_corporate ON applications;
DROP POLICY IF EXISTS applications_update_corporate ON applications;

-- 3. Foreign key constraint'leri geçici olarak kaldır
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_reviewed_by_fkey;

-- 4. applications tablosundaki user_id alanını uuid tipine çevir
ALTER TABLE applications ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- 5. applications tablosundaki reviewed_by alanını uuid tipine çevir (varsa)
ALTER TABLE applications ALTER COLUMN reviewed_by TYPE uuid USING reviewed_by::text::uuid;

-- 6. Foreign key constraint'leri yeniden oluştur
ALTER TABLE applications ADD CONSTRAINT applications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE applications ADD CONSTRAINT applications_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. Policy'leri yeniden oluştur
CREATE POLICY applications_select_self ON applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY applications_insert_self ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY applications_update_self ON applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY applications_delete_self ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- Kurumsal kullanıcılar için policy'ler (şirket sahipleri)
CREATE POLICY applications_select_corporate ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.company_id IN (
                SELECT id FROM companies 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

CREATE POLICY applications_update_corporate ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.company_id IN (
                SELECT id FROM companies 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- 8. job_id için de UUID kullanmak istiyorsanız (opsiyonel):
-- ALTER TABLE applications ALTER COLUMN job_id TYPE uuid USING job_id::text::uuid;
-- ALTER TABLE applications ADD CONSTRAINT applications_job_id_fkey 
--     FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
