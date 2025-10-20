import supabase from './supabaseClient';

export async function getMyNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
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
export async function getCorporateNotifications(companyId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Bildirim oluştur
export async function createNotification(payload: {
  user_id?: string;
  company_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select()
    .single();
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

