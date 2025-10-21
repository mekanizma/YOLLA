-- Mesajlaşma tablolarını ve ilgili verileri sil
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce mevcut mesajlaşma tablolarını kontrol et
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%message%' OR table_name LIKE '%chat%' OR table_name LIKE '%conversation%')
ORDER BY table_name;

-- Mesajlaşma ile ilgili policy'leri kontrol et
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
WHERE tablename LIKE '%message%' 
   OR tablename LIKE '%chat%' 
   OR tablename LIKE '%conversation%'
ORDER BY tablename, policyname;

-- Mesajlaşma tablolarını sil (eğer varsa)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS user_messages CASCADE;

-- Mesajlaşma ile ilgili fonksiyonları sil (eğer varsa)
DROP FUNCTION IF EXISTS send_message(text, text, text);
DROP FUNCTION IF EXISTS get_conversation(text, text);
DROP FUNCTION IF EXISTS create_chat(text, text);

-- Mesajlaşma ile ilgili trigger'ları sil (eğer varsa)
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS trigger_chats_updated_at ON chats;

-- Mesajlaşma ile ilgili index'leri sil (eğer varsa)
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_receiver_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_chats_participants;
DROP INDEX IF EXISTS idx_chats_created_at;

-- Mesajlaşma ile ilgili sequence'ları sil (eğer varsa)
DROP SEQUENCE IF EXISTS messages_id_seq;
DROP SEQUENCE IF EXISTS chats_id_seq;

-- Temizlik sonrası kontrol
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%message%' OR table_name LIKE '%chat%' OR table_name LIKE '%conversation%')
ORDER BY table_name;

-- Bildirimler tablosundan mesajlaşma tipini kaldır (eğer varsa)
-- Bu kısım notifications tablosu yeniden oluşturulduğu için gerekli değil
-- ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
-- ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
--     CHECK (type IN ('info', 'success', 'warning', 'error', 'job', 'application', 'badge'));

-- Temizlik tamamlandı mesajı
SELECT 'Mesajlaşma tabloları ve ilgili veriler başarıyla silindi.' as result;

