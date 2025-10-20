-- notifications tablosundaki user_id sütununu UUID tipine çevir
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce mevcut notifications tablosunun yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Mevcut foreign key constraint'leri kontrol et
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'notifications'::regclass 
AND conname LIKE '%user%';

-- Mevcut policy'leri kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- user_id sütununu UUID tipine çevir
DO $$ 
BEGIN
    -- Eğer user_id sütunu bigint ise UUID'ye çevir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND data_type = 'bigint'
    ) THEN
        -- Önce mevcut policy'leri kaldır
        DROP POLICY IF EXISTS notifications_self ON notifications;
        DROP POLICY IF EXISTS notifications_select_self ON notifications;
        DROP POLICY IF EXISTS notifications_insert_self ON notifications;
        DROP POLICY IF EXISTS notifications_update_self ON notifications;
        DROP POLICY IF EXISTS notifications_delete_self ON notifications;
        
        RAISE NOTICE 'Policy''ler kaldırıldı';
        
        -- Foreign key constraint'i kaldır
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
        
        RAISE NOTICE 'Foreign key constraint kaldırıldı';
        
        -- Önce mevcut verileri yedekle
        CREATE TEMP TABLE temp_notifications_user_id AS 
        SELECT id, user_id FROM notifications WHERE user_id IS NOT NULL;
        
        -- user_id sütununu UUID tipine çevir
        ALTER TABLE notifications ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
        
        RAISE NOTICE 'user_id sütunu UUID tipine çevrildi';
        
        -- Policy'leri yeniden oluştur
        CREATE POLICY notifications_select_self ON notifications
            FOR SELECT USING (auth.uid()::text = user_id::text);
        
        CREATE POLICY notifications_insert_self ON notifications
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
        
        CREATE POLICY notifications_update_self ON notifications
            FOR UPDATE USING (auth.uid()::text = user_id::text);
        
        CREATE POLICY notifications_delete_self ON notifications
            FOR DELETE USING (auth.uid()::text = user_id::text);
        
        RAISE NOTICE 'Policy''ler yeniden oluşturuldu';
        
    ELSE
        RAISE NOTICE 'user_id sütunu zaten UUID tipinde veya bulunamadı';
    END IF;
END $$;

-- Kontrol sorgusu - notifications tablosunun yapısını tekrar göster
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Policy'leri kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- Foreign key constraint'leri kontrol et
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'notifications'::regclass 
AND conname LIKE '%user%';
