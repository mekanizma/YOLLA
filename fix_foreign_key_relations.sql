-- applications ve jobs tabloları arasında foreign key ilişkisi oluştur
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce mevcut constraint'leri kontrol et
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'applications'::regclass 
AND conname LIKE '%job%';

-- Eğer job_id constraint'i yoksa ekle
DO $$ 
BEGIN
    -- applications tablosunda job_id sütunu var mı kontrol et
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'job_id'
    ) THEN
        -- Foreign key constraint'i ekle (eğer yoksa)
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'applications'::regclass 
            AND conname = 'applications_job_id_fkey'
        ) THEN
            ALTER TABLE applications 
            ADD CONSTRAINT applications_job_id_fkey 
            FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
            
            RAISE NOTICE 'Foreign key constraint eklendi: applications_job_id_fkey';
        ELSE
            RAISE NOTICE 'Foreign key constraint zaten mevcut: applications_job_id_fkey';
        END IF;
    ELSE
        RAISE NOTICE 'applications tablosunda job_id sütunu bulunamadı';
    END IF;
END $$;

-- Kontrol sorgusu
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'applications'::regclass 
AND conname LIKE '%job%';
