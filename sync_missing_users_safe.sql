-- Alternatif: Mevcut kullanıcıları güncelle, eksikleri ekle
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

-- 2. Mevcut kullanıcıları güncelle (auth_user_id eksik olanları)
UPDATE public.users 
SET 
    auth_user_id = au.id,
    user_id = au.id,
    first_name = COALESCE(
        au.raw_user_meta_data->>'first_name',
        SPLIT_PART(COALESCE(
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'full_name',
            au.email
        ), ' ', 1),
        SPLIT_PART(au.email, '@', 1)
    ),
    last_name = COALESCE(
        au.raw_user_meta_data->>'last_name',
        CASE 
            WHEN au.raw_user_meta_data->>'name' IS NOT NULL 
            THEN TRIM(SUBSTRING(au.raw_user_meta_data->>'name' FROM POSITION(' ' IN au.raw_user_meta_data->>'name') + 1))
            WHEN au.raw_user_meta_data->>'full_name' IS NOT NULL 
            THEN TRIM(SUBSTRING(au.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN au.raw_user_meta_data->>'full_name') + 1))
            ELSE ''
        END
    ),
    role = COALESCE(au.raw_user_meta_data->>'userType', 'individual'),
    phone = au.raw_user_meta_data->>'phone',
    location = au.raw_user_meta_data->>'city',
    updated_at = au.updated_at
FROM auth.users au
WHERE users.email = au.email
  AND (users.auth_user_id IS NULL OR users.auth_user_id != au.id);

-- 3. Eksik kullanıcıları ekle (sadece gerçekten eksik olanları)
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
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.email = au.email
)
AND au.email IS NOT NULL;

-- 4. Sonuçları kontrol et
SELECT 
    'Güncellenen kayıt sayısı' as durum,
    COUNT(*) as sayi
FROM users 
WHERE updated_at >= NOW() - INTERVAL '1 minute';

-- 5. Belirli kullanıcıyı kontrol et
SELECT 
    'Belirli kullanıcı kontrolü' as durum,
    u.id,
    u.auth_user_id,
    u.email,
    u.first_name,
    u.last_name
FROM users u
WHERE u.auth_user_id = '4410951e-6639-449e-a6a7-8ff58f428fdd';

-- 6. Tüm eksik kullanıcıları listele
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
