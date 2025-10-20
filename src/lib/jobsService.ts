import supabase from './supabaseClient';

export type JobRecord = {
  id: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  education_level: string | null;
  salary: { min: number; max: number; currency: string } | null;
  skills: string[];
  benefits: string[] | null;
  department: string | null;
  status: 'draft' | 'published' | 'closed';
  is_remote: boolean;
  application_deadline: string | null;
  company_id: number;
  views: number;
  applications: number;
  created_at: string;
  updated_at: string;
};

export async function fetchPublishedJobs(params?: { search?: string; city?: string }) {
  const query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (params?.city) query.ilike('location', `%${params.city}%`);
  if (params?.search) {
    // basit arama: title veya description
    query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as JobRecord[];
}

export async function fetchJobById(id: number) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as JobRecord | null;
}



