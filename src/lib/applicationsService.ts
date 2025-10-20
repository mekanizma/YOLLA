import supabase from './supabaseClient';

export async function applyToJob(jobId: number, userId: string, payload?: { cover_letter?: string; resume_url?: string; answers?: any }) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id: jobId, user_id: userId, status: 'pending', cover_letter: payload?.cover_letter, resume_url: payload?.resume_url, answers: payload?.answers })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyApplications(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, jobs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}





