-- Bildirim sistemi durum kontrolü
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Notifications tablosunun yapısını kontrol et
SELECT 
    'Notifications tablosu yapısı' as kontrol,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 2. Notifications tablosundaki kayıt sayısını kontrol et
SELECT 
    'Toplam bildirim sayısı' as kontrol,
    COUNT(*) as sayi
FROM notifications;

-- 3. Bireysel kullanıcı bildirimlerini kontrol et
SELECT 
    'Bireysel kullanıcı bildirimleri' as kontrol,
    COUNT(*) as sayi
FROM notifications 
WHERE user_id IS NOT NULL;

-- 4. Kurumsal şirket bildirimlerini kontrol et
SELECT 
    'Kurumsal şirket bildirimleri' as kontrol,
    COUNT(*) as sayi
FROM notifications 
WHERE company_id IS NOT NULL;

-- 5. Okunmamış bildirimleri kontrol et
SELECT 
    'Okunmamış bildirimler' as kontrol,
    COUNT(*) as sayi
FROM notifications 
WHERE is_read = false OR is_read IS NULL;

-- 6. Bildirim tiplerini kontrol et
SELECT 
    'Bildirim tipleri' as kontrol,
    type,
    COUNT(*) as sayi
FROM notifications 
GROUP BY type
ORDER BY sayi DESC;

-- 7. Son 7 gün içindeki bildirimleri kontrol et
SELECT 
    'Son 7 gün bildirimleri' as kontrol,
    COUNT(*) as sayi
FROM notifications 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 8. Policy'leri kontrol et
SELECT 
    'Notifications policy''leri' as kontrol,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'notifications';

-- 9. Foreign key constraint'leri kontrol et
SELECT 
    'Notifications foreign key''leri' as kontrol,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'notifications'::regclass;

-- 10. Örnek bildirim verilerini kontrol et (son 5 kayıt)
SELECT 
    'Son 5 bildirim örneği' as kontrol,
    id,
    user_id,
    company_id,
    title,
    type,
    is_read,
    created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- 11. Hatalı kayıtları kontrol et (user_id ve company_id ikisi de null)
SELECT 
    'Hatalı kayıtlar (user_id ve company_id null)' as kontrol,
    COUNT(*) as sayi
FROM notifications 
WHERE user_id IS NULL AND company_id IS NULL;

-- 12. UUID formatında olmayan user_id'leri kontrol et
SELECT 
    'UUID formatında olmayan user_id''ler' as kontrol,
    COUNT(*) as sayi
FROM notifications 
WHERE user_id IS NOT NULL 
  AND user_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 13. Test bildirimi oluştur (opsiyonel)
-- Bu kısmı sadece test etmek istiyorsanız açın
/*
INSERT INTO notifications (user_id, title, message, type, data)
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Test Bildirimi',
    'Bu bir test bildirimidir.',
    'info',
    '{"test": true}'::jsonb
);
*/
