-- users tablosuna uuid alanı ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid uuid;

-- uuid alanına unique constraint ekle (hata varsa ignore et)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE users ADD CONSTRAINT users_uuid_key UNIQUE (uuid);
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;
END $$;

-- uuid alanına index ekle
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users USING btree (uuid);

-- Mevcut kullanıcıların uuid alanlarını auth_user_id ile doldur (varsa)
UPDATE users 
SET uuid = auth_user_id 
WHERE auth_user_id IS NOT NULL AND uuid IS NULL;

-- applications tablosuna uuid alanı ekle
ALTER TABLE applications ADD COLUMN IF NOT EXISTS uuid uuid;

-- applications uuid alanına index ekle
CREATE INDEX IF NOT EXISTS idx_applications_uuid ON applications USING btree (uuid);

-- Mevcut başvuruların uuid alanlarını user_id ile doldur
UPDATE applications 
SET uuid = user_id 
WHERE user_id IS NOT NULL AND uuid IS NULL;
