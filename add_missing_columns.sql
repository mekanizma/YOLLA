-- applications tablosuna eksik sütunları ekle
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- reject_reason sütunu ekle
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reject_reason TEXT;

-- reject_date sütunu ekle
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reject_date TIMESTAMP WITH TIME ZONE;

-- accept_date sütunu ekle
ALTER TABLE applications ADD COLUMN IF NOT EXISTS accept_date TIMESTAMP WITH TIME ZONE;

-- Kontrol sorgusu - applications tablosunun yapısını göster
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;
