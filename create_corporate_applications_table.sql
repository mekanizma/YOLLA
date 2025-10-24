-- Kurumsal Başvuru Tablosu
-- Bu tablo kurumsal kullanıcıların başvuru formlarını saklar

CREATE TABLE IF NOT EXISTS corporate_applications (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Şifre hash'lenmeli
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_corporate_applications_email ON corporate_applications(email);
CREATE INDEX IF NOT EXISTS idx_corporate_applications_status ON corporate_applications(status);
CREATE INDEX IF NOT EXISTS idx_corporate_applications_created_at ON corporate_applications(created_at);

-- RLS (Row Level Security) politikaları
ALTER TABLE corporate_applications ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıların tüm başvuruları görebilmesi için
CREATE POLICY "Admin can view all corporate applications" ON corporate_applications
    FOR SELECT USING (true);

-- Admin kullanıcıların başvuru durumunu güncelleyebilmesi için
CREATE POLICY "Admin can update corporate applications" ON corporate_applications
    FOR UPDATE USING (true);

-- Admin kullanıcıların başvuruları silebilmesi için
CREATE POLICY "Admin can delete corporate applications" ON corporate_applications
    FOR DELETE USING (true);

-- Herkesin yeni başvuru ekleyebilmesi için (anon kullanıcılar için)
CREATE POLICY "Anyone can insert corporate applications" ON corporate_applications
    FOR INSERT WITH CHECK (true);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_corporate_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_corporate_applications_updated_at
    BEFORE UPDATE ON corporate_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_corporate_applications_updated_at();

-- Örnek veri ekleme (test için)
INSERT INTO corporate_applications (company_name, full_name, phone, email, password, status)
VALUES 
    ('Test Şirketi A', 'Ahmet Yılmaz', '+90 555 123 4567', 'ahmet@testa.com', 'hashed_password_1', 'pending'),
    ('Test Şirketi B', 'Ayşe Demir', '+90 555 234 5678', 'ayse@testb.com', 'hashed_password_2', 'in_review'),
    ('Test Şirketi C', 'Mehmet Kaya', '+90 555 345 6789', 'mehmet@testc.com', 'hashed_password_3', 'approved')
ON CONFLICT (email) DO NOTHING;
