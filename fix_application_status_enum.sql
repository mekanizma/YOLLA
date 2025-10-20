-- application_status enum'una eksik değerleri ekle
-- Önce mevcut enum'u kontrol et
DO $$ 
BEGIN
    -- Eğer application_status enum'u yoksa oluştur
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'approved');
    END IF;
    
    -- in_review değerini ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'application_status')
        AND enumlabel = 'in_review'
    ) THEN
        ALTER TYPE application_status ADD VALUE 'in_review';
    END IF;
    
    -- Eğer applications tablosundaki status sütunu enum tipinde değilse, güncelle
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'status' 
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- Önce mevcut verileri yedekle
        CREATE TEMP TABLE temp_applications_status AS 
        SELECT id, status FROM applications;
        
        -- Status sütununu enum tipine çevir
        ALTER TABLE applications ALTER COLUMN status TYPE application_status USING status::application_status;
    END IF;
    
END $$;

-- Kontrol sorgusu
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'application_status'
ORDER BY e.enumsortorder;
