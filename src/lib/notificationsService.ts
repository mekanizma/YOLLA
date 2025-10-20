import supabase from './supabaseClient';

export async function getMyNotifications(userId: string) {
  console.log('getMyNotifications çağrıldı, userId:', userId);
  
  // Artık direkt UUID kullanıyoruz (notifications.user_id UUID tipinde)
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId) // UUID direkt kullan
    .order('created_at', { ascending: false });
  
  console.log('getMyNotifications sonucu:', { data, error });
  if (error) {
    console.error('Notifications hatası:', error);
    throw error;
  }
  return data;
}

export async function markNotificationRead(id: number) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

// Kurumsal: Şirket bildirimlerini getir
export async function getCorporateNotifications(companyId: number) {
  // Önce şirketin kullanıcılarını al
  const { data: companyUsers, error: usersError } = await supabase
    .from('users')
    .select('user_id') // UUID kullan
    .eq('company_id', companyId);
  
  if (usersError) throw usersError;
  
  if (!companyUsers || companyUsers.length === 0) {
    return [];
  }
  
  // Bu kullanıcıların bildirimlerini al
  const userIds = companyUsers.map(user => user.user_id).filter(Boolean);
  if (userIds.length === 0) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Bildirim oluştur
export async function createNotification(payload: {
  user_id?: string;
  company_id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}) {
  console.log('createNotification çağrıldı:', payload);
  
  // Eğer company_id verilmişse, şirketin kullanıcılarına bildirim gönder
  if (payload.company_id) {
    console.log('company_id ile bildirim gönderiliyor:', payload.company_id);
    
    const { data: companyUsers, error: usersError } = await supabase
      .from('users')
      .select('user_id') // UUID kullan
      .eq('company_id', payload.company_id);
    
    console.log('Şirket kullanıcıları:', companyUsers);
    console.log('Kullanıcı sorgu hatası:', usersError);
    
    if (usersError) throw usersError;
    
    if (companyUsers && companyUsers.length > 0) {
      const userIds = companyUsers.map(user => user.user_id).filter(Boolean);
      console.log('Kullanıcı ID\'leri:', userIds);
      
      if (userIds.length === 0) {
        console.log('Geçerli kullanıcı ID\'si bulunamadı');
        return [];
      }
      
      // Her kullanıcı için bildirim oluştur
      const notifications = userIds.map(userId => ({
        user_id: userId, // UUID direkt kullan
        title: payload.title,
        message: payload.message,
        type: payload.type
      }));
      
      console.log('Oluşturulacak bildirimler:', notifications);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
      
      console.log('Bildirim oluşturma sonucu:', data);
      console.log('Bildirim oluşturma hatası:', error);
      
      if (error) throw error;
      return data;
    }
    console.log('Şirket kullanıcısı bulunamadı');
    return [];
  }
  
  // Tek kullanıcı için bildirim - artık direkt UUID kullanıyoruz
  console.log('Tek kullanıcı için bildirim gönderiliyor:', payload.user_id);
  
  if (!payload.user_id) {
    console.warn('Geçerli user_id bulunamadı');
    return null;
  }
  
  const notificationData = {
    user_id: payload.user_id, // UUID direkt kullan
    title: payload.title,
    message: payload.message,
    type: payload.type
  };
  
  console.log('Bildirim verisi:', notificationData);
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single();
  
  console.log('Tek kullanıcı bildirim sonucu:', data);
  console.log('Tek kullanıcı bildirim hatası:', error);
  
  if (error) throw error;
  return data;
}

// Bildirim sil
export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

