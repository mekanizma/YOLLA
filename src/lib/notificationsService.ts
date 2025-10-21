import supabase from './supabaseClient';

// Bireysel kullanıcı bildirimlerini getir
export async function getMyNotifications(userId: string) {
  console.log('getMyNotifications çağrıldı, userId:', userId);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  console.log('getMyNotifications sonucu:', { data, error });
  if (error) {
    console.error('Notifications hatası:', error);
    throw error;
  }
  return data || [];
}

// Kurumsal şirket bildirimlerini getir
export async function getCorporateNotifications(companyId: number) {
  console.log('getCorporateNotifications çağrıldı, companyId:', companyId);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  
  console.log('getCorporateNotifications sonucu:', { data, error });
  if (error) {
    console.error('Corporate notifications hatası:', error);
    throw error;
  }
  return data || [];
}

// Bildirim okundu olarak işaretle
export async function markNotificationRead(id: string) {
  console.log('markNotificationRead çağrıldı, id:', id);
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  
  if (error) {
    console.error('markNotificationRead hatası:', error);
    throw error;
  }
}

// Bildirim oluştur (hem bireysel hem kurumsal için)
export async function createNotification(payload: {
  user_id?: string;
  company_id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'job' | 'application' | 'badge';
  data?: Record<string, any>;
}) {
  console.log('=== createNotification FONKSİYONU ÇAĞRILDI ===');
  console.log('Gelen payload:', payload);
  
  // En az bir user_id veya company_id olmalı
  if (!payload.user_id && !payload.company_id) {
    console.error('HATA: En az bir user_id veya company_id gerekli');
    throw new Error('En az bir user_id veya company_id gerekli');
  }
  
  const notificationData = {
    user_id: payload.user_id || null,
    company_id: payload.company_id || null,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    data: payload.data || {}
  };
  
  console.log('Oluşturulacak bildirim verisi:', notificationData);
  
  console.log('Supabase insert işlemi başlatılıyor...');
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single();
  
  console.log('=== SUPABASE INSERT SONUCU ===');
  console.log('Bildirim oluşturma sonucu:', data);
  console.log('Bildirim oluşturma hatası:', error);
  
  if (error) {
    console.error('Bildirim oluşturma hatası detayı:', error);
    throw error;
  }
  
  console.log('Bildirim başarıyla oluşturuldu!');
  return data;
}

// Bildirim sil
export async function deleteNotification(id: string) {
  console.log('deleteNotification çağrıldı, id:', id);
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('deleteNotification hatası:', error);
    throw error;
  }
}

// Toplu bildirim oluştur (şirket kullanıcılarına)
export async function createBulkNotifications(payload: {
  company_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'job' | 'application' | 'badge';
  data?: Record<string, any>;
}) {
  console.log('createBulkNotifications çağrıldı:', payload);
  
  // Şirketin kullanıcılarını al
  const { data: companyUsers, error: usersError } = await supabase
    .from('users')
    .select('user_id')
    .eq('company_id', payload.company_id);
  
  if (usersError) {
    console.error('Şirket kullanıcıları alınamadı:', usersError);
    throw usersError;
  }
  
  if (!companyUsers || companyUsers.length === 0) {
    console.log('Şirket kullanıcısı bulunamadı');
    return [];
  }
  
  // Her kullanıcı için bildirim oluştur
  const notifications = companyUsers.map(user => ({
    user_id: user.user_id,
    company_id: payload.company_id,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    data: payload.data || {}
  }));
  
  console.log('Oluşturulacak bildirimler:', notifications);
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();
  
  console.log('Toplu bildirim oluşturma sonucu:', data);
  console.log('Toplu bildirim oluşturma hatası:', error);
  
  if (error) throw error;
  return data || [];
}

