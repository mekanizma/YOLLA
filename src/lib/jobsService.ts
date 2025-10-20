import supabase from './supabaseClient';

export type JobRecord = {
  id: string;
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
  company_id: string;
  views: number;
  applications: number;
  created_at: string;
  updated_at: string;
};

export async function fetchPublishedJobs(params?: { search?: string; city?: string }) {
  const query = supabase
    .from('jobs')
    .select(`
      *,
      companies!inner(
        id,
        name,
        logo,
        location,
        industry,
        website,
        phone,
        email
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (params?.city) query.ilike('location', `%${params.city}%`);
  if (params?.search) {
    // basit arama: title veya description
    query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as (JobRecord & { 
    companies: { 
      id: number; 
      name: string; 
      logo?: string; 
      location?: string; 
      industry?: string;
      website?: string;
      phone?: string;
      email?: string;
    } 
  })[];
}

export async function fetchJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as JobRecord | null;
}

// Şirket e-postasından company kaydını getir
export async function fetchCompanyByEmail(email: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('id,name,email,phone,address,website,industry,location,description,size,founded_year,logo')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data as { 
    id: number; 
    name: string; 
    email: string; 
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    industry?: string | null;
    location?: string | null;
    description?: string | null;
    size?: string | null;
    founded_year?: number | null;
    logo?: string | null;
  } | null;
}

// Belirli şirketin ilanlarını getir (en yeni ilk)
export async function fetchCorporateJobs(companyId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('id,title,status,applications,created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Array<Pick<JobRecord, 'id' | 'title' | 'status' | 'applications' | 'created_at'>>;
}

// İlan oluştur
export async function createCorporateJob(companyId: string, payload: {
  title: string;
  description: string;
  requirements: string;
  location: string;
  department?: string | null;
  experience_level?: JobRecord['experience_level'];
  type?: JobRecord['type'];
  salary?: { min?: number; max?: number; currency?: string } | null;
  benefits?: string[] | null;
  application_deadline?: string | null;
  status?: JobRecord['status'];
}) {
  const insertPayload: Partial<JobRecord> = {
    title: payload.title,
    description: payload.description,
    requirements: payload.requirements,
    responsibilities: '',
    location: payload.location,
    type: payload.type || 'full-time',
    experience_level: payload.experience_level || 'mid',
    education_level: null,
    salary: payload.salary ? { min: Number(payload.salary.min || 0), max: Number(payload.salary.max || 0), currency: payload.salary.currency || 'TRY' } : null,
    skills: [],
    benefits: payload.benefits || null,
    department: payload.department || null,
    status: payload.status || 'published',
    is_remote: false,
    application_deadline: payload.application_deadline || null,
    company_id: companyId,
    views: 0,
    applications: 0,
  } as Partial<JobRecord>;
  const { data, error } = await supabase
    .from('jobs')
    .insert(insertPayload)
    .select('*')
    .single();
  if (error) throw error;
  return data as JobRecord;
}

// İlan durumunu değiştir
export async function setJobStatus(jobId: string, status: JobRecord['status']) {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select('id,status')
    .single();
  if (error) throw error;
  return data as Pick<JobRecord, 'id' | 'status'>;
}
