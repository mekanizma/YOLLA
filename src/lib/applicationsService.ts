import supabase from './supabaseClient';

export async function applyToJob(jobId: string, userId: string, payload?: { cover_letter?: string; resume_url?: string; answers?: any }) {
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

// Kurumsal: Şirketin ilanlarına gelen başvuruları getir
export async function getCorporateApplications(companyId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('id,status,created_at,cover_letter,resume_url,users(full_name,avatar_url,email),jobs(title,company_id)')
    .eq('jobs.company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Başvuru durumunu güncelle
export async function updateApplicationStatus(applicationId: string, status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'approved', rejectReason?: string) {
  const payload: any = { status };
  if (rejectReason) payload.reject_reason = rejectReason;
  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', applicationId)
    .select('id,status')
    .single();
  if (error) throw error;
  return data;
}

