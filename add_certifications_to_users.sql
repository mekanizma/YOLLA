-- Users tablosuna sertifikalar için kolonlar ekle
-- Bu SQL dosyasını Supabase SQL Editor'da çalıştırın

-- Sertifikalar için JSON kolonu ekle
ALTER TABLE users 
ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;

-- Sertifikalar için index ekle (performans için)
CREATE INDEX idx_users_certifications ON users USING GIN (certifications);

-- Sertifikalar için RLS policy ekle (eğer RLS aktifse)
-- Kullanıcılar sadece kendi sertifikalarını görebilir
CREATE POLICY "Users can view own certifications"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

-- Kullanıcılar sadece kendi sertifikalarını güncelleyebilir
CREATE POLICY "Users can update own certifications"
ON users FOR UPDATE
USING (auth.uid()::text = id::text);

-- Örnek sertifika verisi ekle (isteğe bağlı)
-- Bu kısmı çalıştırmak istemiyorsanız yorum satırı yapabilirsiniz
/*
UPDATE users 
SET certifications = '[
  {
    "id": "cert_1",
    "name": "React Developer Certificate",
    "issuer": "Meta",
    "issueDate": "2024-01-15",
    "expiryDate": "2025-01-15",
    "credentialId": "META-REACT-2024-001",
    "credentialUrl": "https://example.com/verify/META-REACT-2024-001",
    "skills": ["React", "JavaScript", "Frontend Development"]
  },
  {
    "id": "cert_2", 
    "name": "AWS Cloud Practitioner",
    "issuer": "Amazon Web Services",
    "issueDate": "2023-11-20",
    "expiryDate": "2026-11-20",
    "credentialId": "AWS-CP-2023-456",
    "credentialUrl": "https://aws.amazon.com/verification/AWS-CP-2023-456",
    "skills": ["AWS", "Cloud Computing", "DevOps"]
  }
]'::jsonb
WHERE id = auth.uid();
*/

-- Sertifikalar için yardımcı fonksiyonlar (isteğe bağlı)
-- Sertifika ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_certification(
  user_id TEXT,
  cert_name TEXT,
  cert_issuer TEXT,
  cert_issue_date DATE,
  cert_expiry_date DATE DEFAULT NULL,
  cert_credential_id TEXT DEFAULT NULL,
  cert_credential_url TEXT DEFAULT NULL,
  cert_skills TEXT[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  new_cert JSONB;
  current_certs JSONB;
BEGIN
  -- Yeni sertifika objesi oluştur
  new_cert := jsonb_build_object(
    'id', 'cert_' || extract(epoch from now())::text,
    'name', cert_name,
    'issuer', cert_issuer,
    'issueDate', cert_issue_date,
    'expiryDate', cert_expiry_date,
    'credentialId', cert_credential_id,
    'credentialUrl', cert_credential_url,
    'skills', cert_skills
  );
  
  -- Mevcut sertifikaları al
  SELECT certifications INTO current_certs 
  FROM users 
  WHERE id::text = user_id;
  
  -- Eğer sertifikalar yoksa boş array oluştur
  IF current_certs IS NULL THEN
    current_certs := '[]'::jsonb;
  END IF;
  
  -- Yeni sertifikayı ekle
  current_certs := current_certs || new_cert;
  
  -- Güncelle
  UPDATE users 
  SET certifications = current_certs 
  WHERE id::text = user_id;
  
  RETURN current_certs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sertifika silme fonksiyonu
CREATE OR REPLACE FUNCTION remove_certification(
  user_id TEXT,
  cert_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_certs JSONB;
  updated_certs JSONB;
BEGIN
  -- Mevcut sertifikaları al
  SELECT certifications INTO current_certs 
  FROM users 
  WHERE id::text = user_id;
  
  -- Sertifikayı sil
  updated_certs := (
    SELECT jsonb_agg(cert)
    FROM jsonb_array_elements(current_certs) AS cert
    WHERE cert->>'id' != cert_id
  );
  
  -- Güncelle
  UPDATE users 
  SET certifications = COALESCE(updated_certs, '[]'::jsonb)
  WHERE id::text = user_id;
  
  RETURN COALESCE(updated_certs, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sertifika güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_certification(
  user_id TEXT,
  cert_id TEXT,
  cert_name TEXT DEFAULT NULL,
  cert_issuer TEXT DEFAULT NULL,
  cert_issue_date DATE DEFAULT NULL,
  cert_expiry_date DATE DEFAULT NULL,
  cert_credential_id TEXT DEFAULT NULL,
  cert_credential_url TEXT DEFAULT NULL,
  cert_skills TEXT[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  current_certs JSONB;
  updated_certs JSONB;
  cert JSONB;
BEGIN
  -- Mevcut sertifikaları al
  SELECT certifications INTO current_certs 
  FROM users 
  WHERE id::text = user_id;
  
  -- Sertifikayı güncelle
  updated_certs := (
    SELECT jsonb_agg(
      CASE 
        WHEN cert->>'id' = cert_id THEN
          COALESCE(
            jsonb_build_object(
              'id', cert->>'id',
              'name', COALESCE(cert_name, cert->>'name'),
              'issuer', COALESCE(cert_issuer, cert->>'issuer'),
              'issueDate', COALESCE(cert_issue_date::text, cert->>'issueDate'),
              'expiryDate', COALESCE(cert_expiry_date::text, cert->>'expiryDate'),
              'credentialId', COALESCE(cert_credential_id, cert->>'credentialId'),
              'credentialUrl', COALESCE(cert_credential_url, cert->>'credentialUrl'),
              'skills', COALESCE(to_jsonb(cert_skills), cert->'skills')
            ),
            cert
          )
        ELSE cert
      END
    )
    FROM jsonb_array_elements(current_certs) AS cert
  );
  
  -- Güncelle
  UPDATE users 
  SET certifications = updated_certs
  WHERE id::text = user_id;
  
  RETURN updated_certs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage Policies for Certificates
-- avatars bucket'ında certificates klasörü için policy'ler

-- Kullanıcılar kendi sertifika dosyalarını yükleyebilir
CREATE POLICY "Users can upload own certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Kullanıcılar kendi sertifika dosyalarını görüntüleyebilir
CREATE POLICY "Users can view own certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Kullanıcılar kendi sertifika dosyalarını güncelleyebilir
CREATE POLICY "Users can update own certificates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Kullanıcılar kendi sertifika dosyalarını silebilir
CREATE POLICY "Users can delete own certificates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Admin'ler tüm sertifika dosyalarını görebilir
CREATE POLICY "Admins can view all certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'certificates'
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Sertifika dosyası URL'i oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION get_certificate_url(
  user_id TEXT,
  file_name TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'certificates/' || user_id || '/' || file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sertifika ekleme fonksiyonu (dosya URL'i ile)
CREATE OR REPLACE FUNCTION add_certification_with_file(
  user_id TEXT,
  cert_name TEXT,
  cert_issuer TEXT,
  cert_issue_date DATE,
  cert_expiry_date DATE DEFAULT NULL,
  cert_credential_id TEXT DEFAULT NULL,
  cert_credential_url TEXT DEFAULT NULL,
  cert_skills TEXT[] DEFAULT NULL,
  file_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  new_cert JSONB;
  current_certs JSONB;
  file_url TEXT;
BEGIN
  -- Dosya URL'i oluştur
  IF file_name IS NOT NULL THEN
    file_url := get_certificate_url(user_id, file_name);
  END IF;
  
  -- Yeni sertifika objesi oluştur
  new_cert := jsonb_build_object(
    'id', 'cert_' || extract(epoch from now())::text,
    'name', cert_name,
    'issuer', cert_issuer,
    'issueDate', cert_issue_date,
    'expiryDate', cert_expiry_date,
    'credentialId', cert_credential_id,
    'credentialUrl', cert_credential_url,
    'skills', cert_skills,
    'fileUrl', file_url,
    'fileName', file_name
  );
  
  -- Mevcut sertifikaları al
  SELECT certifications INTO current_certs 
  FROM users 
  WHERE id::text = user_id;
  
  -- Eğer sertifikalar yoksa boş array oluştur
  IF current_certs IS NULL THEN
    current_certs := '[]'::jsonb;
  END IF;
  
  -- Yeni sertifikayı ekle
  current_certs := current_certs || new_cert;
  
  -- Güncelle
  UPDATE users 
  SET certifications = current_certs 
  WHERE id::text = user_id;
  
  RETURN current_certs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örnekleri:
/*
-- Sertifika ekleme (dosya ile)
SELECT add_certification_with_file(
  auth.uid()::text,
  'React Developer Certificate',
  'Meta',
  '2024-01-15',
  '2025-01-15',
  'META-REACT-2024-001',
  'https://example.com/verify/META-REACT-2024-001',
  ARRAY['React', 'JavaScript', 'Frontend Development'],
  'react-certificate.pdf'
);

-- Sertifika ekleme (dosya olmadan)
SELECT add_certification(
  auth.uid()::text,
  'AWS Cloud Practitioner',
  'Amazon Web Services',
  '2023-11-20',
  '2026-11-20',
  'AWS-CP-2023-456',
  'https://aws.amazon.com/verification/AWS-CP-2023-456',
  ARRAY['AWS', 'Cloud Computing', 'DevOps']
);

-- Sertifika silme
SELECT remove_certification(auth.uid()::text, 'cert_1');

-- Sertifika güncelleme
SELECT update_certification(
  auth.uid()::text,
  'cert_1',
  'Updated Certificate Name',
  'Updated Issuer',
  '2024-02-01',
  '2025-02-01'
);
*/
