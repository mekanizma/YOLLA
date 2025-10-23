-- Eksik kullanıcı kayıtlarını auth.users'dan users tablosuna senkronize et
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut durumu kontrol et
SELECT 
    'Mevcut users kayıt sayısı' as durum,
    COUNT(*) as sayi
FROM users;

SELECT 
    'Mevcut auth.users kayıt sayısı' as durum,
    COUNT(*) as sayi
FROM auth.users;

-- 2. Eksik kullanıcıları bul ve ekle (ON CONFLICT ile)
INSERT INTO public.users (
    auth_user_id, 
    user_id, 
    email, 
    first_name, 
    last_name, 
    role,
    phone,
    location,
    created_at,
    updated_at
)
SELECT 
    au.id as auth_user_id,
    au.id as user_id,
    au.email,
    -- İsim bilgilerini user_metadata'dan al
    COALESCE(
        au.raw_user_meta_data->>'first_name',
        SPLIT_PART(COALESCE(
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'full_name',
            au.email
        ), ' ', 1),
        SPLIT_PART(au.email, '@', 1)
    ) as first_name,
    COALESCE(
        au.raw_user_meta_data->>'last_name',
        CASE 
            WHEN au.raw_user_meta_data->>'name' IS NOT NULL 
            THEN TRIM(SUBSTRING(au.raw_user_meta_data->>'name' FROM POSITION(' ' IN au.raw_user_meta_data->>'name') + 1))
            WHEN au.raw_user_meta_data->>'full_name' IS NOT NULL 
            THEN TRIM(SUBSTRING(au.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN au.raw_user_meta_data->>'full_name') + 1))
            ELSE ''
        END
    ) as last_name,
    COALESCE(au.raw_user_meta_data->>'userType', 'individual') as role,
    au.raw_user_meta_data->>'phone' as phone,
    au.raw_user_meta_data->>'city' as location,
    au.created_at,
    au.updated_at
FROM auth.users au
LEFT JOIN public.users u ON u.auth_user_id = au.id
WHERE u.auth_user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    user_id = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    updated_at = EXCLUDED.updated_at;

-- 3. Sonuçları kontrol et
SELECT 
    'Eklenen kayıt sayısı' as durum,
    COUNT(*) as sayi
FROM users 
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- 4. Belirli kullanıcıyı kontrol et
SELECT 
    'Belirli kullanıcı kontrolü' as durum,
    u.id,
    u.auth_user_id,
    u.email,
    u.first_name,
    u.last_name
FROM users u
WHERE u.auth_user_id = '4410951e-6639-449e-a6a7-8ff58f428fdd';

-- 5. Tüm eksik kullanıcıları listele
SELECT 
    'Hala eksik olan kullanıcılar' as durum,
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as metadata_name,
    au.raw_user_meta_data->>'full_name' as metadata_full_name
FROM auth.users au
LEFT JOIN public.users u ON u.auth_user_id = au.id
WHERE u.auth_user_id IS NULL
  AND au.email IS NOT NULL;
