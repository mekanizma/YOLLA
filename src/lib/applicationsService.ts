import supabase from './supabaseClient';
import { createNotification } from './notificationsService';

export async function applyToJob(jobId: string, userId: string, payload?: { cover_letter?: string; resume_url?: string; answers?: any }) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ 
      job_id: jobId, // Artık UUID kullanıyoruz
      user_id: userId, // Artık UUID kullanıyoruz
      status: 'pending', 
      cover_letter: payload?.cover_letter, 
      resume_url: payload?.resume_url, 
      answers: payload?.answers 
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyApplications(userId: string) {
  console.log('getMyApplications çağrıldı, userId:', userId);
  
  // Basit sorgu - sadece applications tablosundan veri al
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  console.log('getMyApplications sonucu:', { data, error });
  if (error) throw error;
  
  // Job bilgilerini ayrı ayrı al
  const enrichedData = await Promise.all(
    (data || []).map(async (app) => {
      try {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('id, title, location, company_id')
          .eq('id', app.job_id)
          .single();
        
        // Company bilgilerini al
        let companyData = null;
        if (jobData?.company_id) {
          const { data: compData } = await supabase
            .from('companies')
            .select('name, logo')
            .eq('id', jobData.company_id)
            .single();
          companyData = compData;
        }
        
        return {
          ...app,
          jobs: jobData ? {
            ...jobData,
            companies: companyData
          } : null
        };
      } catch (err) {
        console.warn('Job/Company verisi alınamadı:', err);
        return {
          ...app,
          jobs: null
        };
      }
    })
  );
  
  console.log('Enriched data:', enrichedData);
  return enrichedData;
}

// Kurumsal: Şirketin ilanlarına gelen başvuruları getir
export async function getCorporateApplications(companyId: number) {
  // Önce şirketin iş ilanlarını al
  const { data: companyJobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id')
    .eq('company_id', companyId);
  
  if (jobsError) throw jobsError;
  
  if (!companyJobs || companyJobs.length === 0) {
    return [];
  }
  
  // Sonra bu iş ilanlarına gelen başvuruları al
  const jobIds = companyJobs.map(job => job.id);
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('id,status,created_at,cover_letter,resume_url,job_id,user_id')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false });
  
  if (applicationsError) throw applicationsError;
  
  if (!applications || applications.length === 0) {
    return [];
  }
  
  // Her başvuru için ayrı ayrı job ve user bilgilerini al
  const enrichedApplications = await Promise.all(
    applications.map(async (app) => {
      // Job bilgilerini al
      const { data: jobData } = await supabase
        .from('jobs')
        .select('title,company_id')
        .eq('id', app.job_id)
        .single();
      
      // Başvuru yapan kişinin bilgilerini al (auth_user_id ile)
      const { data: applicantUser, error: userError } = await supabase
        .from('users')
        .select('first_name,last_name,email,phone,location')
        .eq('auth_user_id', app.user_id)
        .single();
      
      console.log('Başvuru user_id:', app.user_id);
      console.log('Kullanıcı sorgu hatası:', userError);
      console.log('Kullanıcı verisi:', applicantUser);
      
      // Eğer auth_user_id ile bulunamazsa, user_id ile dene
      let finalApplicantUser = applicantUser;
      if (!applicantUser && !userError) {
        console.log('auth_user_id ile bulunamadı, user_id ile deneniyor...');
        const { data: applicantUser2, error: userError2 } = await supabase
          .from('users')
          .select('first_name,last_name,email,phone,location')
          .eq('user_id', app.user_id)
          .single();
        
        console.log('user_id ile sorgu hatası:', userError2);
        console.log('user_id ile kullanıcı verisi:', applicantUser2);
        
        if (applicantUser2) {
          finalApplicantUser = applicantUser2;
        }
      }
      
      // Eğer auth_user_id ile "Bilinmeyen Kullanıcı" bulunduysa, user_id ile dene
      if (applicantUser && applicantUser.first_name === 'Bilinmeyen') {
        console.log('auth_user_id ile "Bilinmeyen Kullanıcı" bulundu, user_id ile deneniyor...');
        const { data: applicantUser2, error: userError2 } = await supabase
          .from('users')
          .select('first_name,last_name,email,phone,location')
          .eq('user_id', app.user_id)
          .single();
        
        console.log('user_id ile sorgu hatası:', userError2);
        console.log('user_id ile kullanıcı verisi:', applicantUser2);
        
        if (applicantUser2) {
          finalApplicantUser = applicantUser2;
        }
      }
      
      // Eğer hiçbir alanda bulunamazsa, kullanıcıyı users tablosuna ekle
      if (!finalApplicantUser) {
        console.log('auth_user_id ile bulunamadı, kullanıcı users tablosuna ekleniyor...');
        
        // Kullanıcıyı users tablosuna ekle
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            auth_user_id: app.user_id,
            first_name: 'Bilinmeyen',
            last_name: 'Kullanıcı',
            email: 'user@example.com',
            phone: null,
            location: null,
            role: 'individual'
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Kullanıcı eklenemedi:', insertError);
          // Hata durumunda varsayılan bilgiler
          finalApplicantUser = {
            first_name: 'Bilinmeyen',
            last_name: 'Kullanıcı',
            email: 'user@example.com',
            phone: null,
            location: null
          };
        } else {
          console.log('Kullanıcı başarıyla eklendi:', newUser);
          finalApplicantUser = newUser;
        }
      }
      
      const displayName = finalApplicantUser 
        ? `${finalApplicantUser.first_name || ''} ${finalApplicantUser.last_name || ''}`.trim() || finalApplicantUser.email?.split('@')[0] || 'Kullanıcı'
        : 'Bilinmeyen Kullanıcı';
      
      return {
        ...app,
        users: {
          full_name: displayName,
          email: finalApplicantUser?.email || 'user@example.com',
          phone: finalApplicantUser?.phone || null,
          location: finalApplicantUser?.location || null
        },
        jobs: jobData
      };
    })
  );
  
  return enrichedApplications;
}

// Başvuru durumunu güncelle
export async function updateApplicationStatus(applicationId: number, status: 'pending' | 'in_review' | 'accepted' | 'rejected' | 'approved', rejectReason?: string) {
  const payload: any = { status };
  
  if (rejectReason) {
    payload.reject_reason = rejectReason;
    payload.reject_date = new Date().toISOString();
  }
  
  if (status === 'accepted') {
    payload.accept_date = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', applicationId)
    .select('id,status,reject_reason,reject_date,accept_date')
    .single();
  if (error) throw error;
  return data;
}

