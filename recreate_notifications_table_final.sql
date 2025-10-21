-- Bildirimler tablosunu hem kurumsal hem bireysel için optimize et
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce mevcut tabloyu ve bağımlılıklarını kaldır
DROP TABLE IF EXISTS notifications CASCADE;

-- Yeni bildirimler tablosunu oluştur
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Nullable, bireysel bildirimler için
    company_id INTEGER, -- Nullable, kurumsal bildirimler için
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'job', 'application', 'badge', 'message')),
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- En az bir user_id veya company_id olmalı
    CONSTRAINT notifications_user_or_company CHECK (
        (user_id IS NOT NULL) OR (company_id IS NOT NULL)
    )
);

-- Index'ler oluştur
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_company_id ON notifications(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS (Row Level Security) etkinleştir
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy'ler oluştur
-- Bireysel kullanıcılar sadece kendi bildirimlerini görebilir
CREATE POLICY notifications_select_individual ON notifications
    FOR SELECT USING (
        user_id IS NOT NULL AND auth.uid() = user_id
    );

-- Bireysel kullanıcılar kendi bildirimlerini oluşturabilir
CREATE POLICY notifications_insert_individual ON notifications
    FOR INSERT WITH CHECK (
        user_id IS NOT NULL AND auth.uid() = user_id
    );

-- Bireysel kullanıcılar kendi bildirimlerini güncelleyebilir
CREATE POLICY notifications_update_individual ON notifications
    FOR UPDATE USING (
        user_id IS NOT NULL AND auth.uid() = user_id
    );

-- Bireysel kullanıcılar kendi bildirimlerini silebilir
CREATE POLICY notifications_delete_individual ON notifications
    FOR DELETE USING (
        user_id IS NOT NULL AND auth.uid() = user_id
    );

-- Kurumsal kullanıcılar şirket bildirimlerini görebilir
CREATE POLICY notifications_select_corporate ON notifications
    FOR SELECT USING (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Kurumsal kullanıcılar şirket bildirimlerini oluşturabilir
CREATE POLICY notifications_insert_corporate ON notifications
    FOR INSERT WITH CHECK (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Kurumsal kullanıcılar şirket bildirimlerini güncelleyebilir
CREATE POLICY notifications_update_corporate ON notifications
    FOR UPDATE USING (
        company_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
            AND users.company_id = notifications.company_id
            AND users.role = 'corporate'
        )
    );

-- Kurumsal kullanıcılar şirket bildirimlerini silebilir
CREATE POLICY notifications_delete_corporate ON notifications
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

-- Test verisi ekle (opsiyonel - gerçek kullanıcı/şirket ID'leri ile)
-- INSERT INTO notifications (user_id, title, message, type) VALUES
--     ('gerçek-user-uuid', 'Hoş Geldiniz!', 'Yollabi platformuna hoş geldiniz.', 'info');

-- INSERT INTO notifications (company_id, title, message, type) VALUES
--     (1, 'Yeni Başvuru', 'Bir kullanıcı iş ilanınıza başvurdu.', 'info');

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

