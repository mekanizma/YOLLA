import supabase from './supabaseClient';

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content, type: 'text' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getConversation(a: string, b: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}



