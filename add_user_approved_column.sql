-- applications tablosuna user_approved sütunu ekle
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- user_approved sütunu ekle (boolean, varsayılan false)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_approved BOOLEAN DEFAULT FALSE;

-- approve_date sütunu ekle (eğer yoksa)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS approve_date TIMESTAMP WITH TIME ZONE;

-- Kontrol sorgusu - applications tablosunun yapısını göster
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;

