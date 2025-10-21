-- Bildirimler tablosunu tamamen yeniden oluştur
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce mevcut tabloyu ve bağımlılıklarını kaldır
DROP TABLE IF EXISTS notifications CASCADE;

-- Yeni bildirimler tablosunu oluştur
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'job', 'application', 'badge', 'message')),
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}', -- Ek veri için
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- En az bir user_id veya company_id olmalı
    CONSTRAINT notifications_user_or_company CHECK (
        (user_id IS NOT NULL) OR (company_id IS NOT NULL)
    )
);

-- Index'ler oluştur
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS (Row Level Security) etkinleştir
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy'ler oluştur
-- Kullanıcılar sadece kendi bildirimlerini görebilir
CREATE POLICY notifications_select_self ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini oluşturabilir
CREATE POLICY notifications_insert_self ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini güncelleyebilir
CREATE POLICY notifications_update_self ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini silebilir
CREATE POLICY notifications_delete_self ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Şirket yöneticileri şirket bildirimlerini görebilir
CREATE POLICY notifications_select_company ON notifications
    FOR SELECT USING (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Şirket yöneticileri şirket bildirimlerini oluşturabilir
CREATE POLICY notifications_insert_company ON notifications
    FOR INSERT WITH CHECK (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Şirket yöneticileri şirket bildirimlerini güncelleyebilir
CREATE POLICY notifications_update_company ON notifications
    FOR UPDATE USING (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Şirket yöneticileri şirket bildirimlerini silebilir
CREATE POLICY notifications_delete_company ON notifications
    FOR DELETE USING (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Admin'ler tüm bildirimleri görebilir
CREATE POLICY notifications_select_admin ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admin'ler tüm bildirimleri oluşturabilir
CREATE POLICY notifications_insert_admin ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admin'ler tüm bildirimleri güncelleyebilir
CREATE POLICY notifications_update_admin ON notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admin'ler tüm bildirimleri silebilir
CREATE POLICY notifications_delete_admin ON notifications
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at trigger'ı
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Örnek veri ekle (test için) - Gerçek kullanıcı ID'si ile
-- Bu kısmı gerçek kullanıcı ID'si ile değiştirin veya tamamen kaldırın
-- INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
--     ('gerçek-user-uuid-buraya', 'Hoş Geldiniz!', 'Yollabi platformuna hoş geldiniz. Profilinizi tamamlayarak iş aramaya başlayabilirsiniz.', 'info', false),
--     ('gerçek-user-uuid-buraya', 'Profil Tamamlandı', 'Profiliniz başarıyla tamamlandı. Artık iş ilanlarına başvurabilirsiniz.', 'success', false);

-- Tablo yapısını kontrol et
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
WHERE tablename = 'notifications'
ORDER BY policyname;
