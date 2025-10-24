import supabase from './supabaseClient';

// Mevcut "Bilinmeyen Kullanıcı" kayıtlarını temizlemek için yardımcı fonksiyon
export async function cleanupUnknownUsers() {
  try {
    // "Bilinmeyen Kullanıcı" kayıtlarını bul
    const { data: unknownUsers, error: selectError } = await supabase
      .from('users')
      .select('id, auth_user_id, user_id')
      .eq('first_name', 'Bilinmeyen')
      .eq('last_name', 'Kullanıcı');
    
    if (selectError) {
      console.error('Bilinmeyen kullanıcılar sorgulanamadı:', selectError);
      return;
    }
    
    if (!unknownUsers || unknownUsers.length === 0) {
      console.log('Temizlenecek bilinmeyen kullanıcı bulunamadı');
      return;
    }
    
    console.log(`${unknownUsers.length} adet bilinmeyen kullanıcı bulundu, temizleniyor...`);
    
    // Her bilinmeyen kullanıcı için auth.users'dan bilgi almaya çalış
    for (const user of unknownUsers) {
      const userId = user.auth_user_id || user.user_id;
      if (!userId) continue;
      
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        
        if (authUser?.user) {
          const userMetadata = authUser.user.user_metadata || {};
          const email = authUser.user.email || 'user@example.com';
          const fullName = userMetadata.name || userMetadata.full_name || '';
          const [firstName, ...rest] = fullName.split(' ');
          const lastName = rest.join(' ');
          
          // Kullanıcı bilgilerini güncelle
          const { error: updateError } = await supabase
            .from('users')
            .update({
              first_name: firstName || email.split('@')[0] || 'Kullanıcı',
              last_name: lastName || '',
              email: email,
              phone: userMetadata.phone || null,
              location: userMetadata.city || null,
              role: userMetadata.userType || 'individual'
            })
            .eq('id', user.id);
          
          if (updateError) {
            console.error(`Kullanıcı ${user.id} güncellenemedi:`, updateError);
          } else {
            console.log(`Kullanıcı ${user.id} başarıyla güncellendi`);
          }
        } else {
          // Auth.users'da bulunamazsa, aynı user_id ile başka bir kayıt var mı kontrol et
          const { data: existingUser } = await supabase
            .from('users')
            .select('first_name, last_name, email, phone, location')
            .eq('user_id', userId)
            .neq('first_name', 'Bilinmeyen')
            .single();
          
          if (existingUser) {
            console.log(`user_id ${userId} ile doğru kayıt bulundu, bilinmeyen kayıt güncelleniyor...`);
            const { error: updateError } = await supabase
              .from('users')
              .update({
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                phone: existingUser.phone,
                location: existingUser.location
              })
              .eq('id', user.id);
            
            if (updateError) {
              console.error(`Kullanıcı ${user.id} güncellenemedi:`, updateError);
            } else {
              console.log(`Kullanıcı ${user.id} başarıyla güncellendi`);
            }
          }
        }
      } catch (authError) {
        console.error(`Kullanıcı ${user.id} için auth sorgusu başarısız:`, authError);
      }
    }
  } catch (error) {
    console.error('Bilinmeyen kullanıcılar temizlenirken hata:', error);
  }
}

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
        .maybeSingle();
      
      console.log('Başvuru user_id:', app.user_id);
      console.log('Kullanıcı sorgu hatası:', userError);
      console.log('Kullanıcı verisi:', applicantUser);
      
      // Eğer auth_user_id ile bulunamazsa, user_id ile dene
      let finalApplicantUser = applicantUser;
      if (!applicantUser) {
        console.log('auth_user_id ile bulunamadı, user_id ile deneniyor...');
        const { data: applicantUser2, error: userError2 } = await supabase
          .from('users')
          .select('first_name,last_name,email,phone,location')
          .eq('user_id', app.user_id)
          .maybeSingle();
        
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
        
        if (applicantUser2 && applicantUser2.first_name !== 'Bilinmeyen') {
          finalApplicantUser = applicantUser2;
          console.log('user_id ile doğru kullanıcı bulundu, auth_user_id kaydını güncelliyor...');
          
          // auth_user_id kaydını da güncelle
          try {
            await supabase
              .from('users')
              .update({
                first_name: applicantUser2.first_name,
                last_name: applicantUser2.last_name,
                email: applicantUser2.email,
                phone: applicantUser2.phone,
                location: applicantUser2.location
              })
              .eq('auth_user_id', app.user_id);
            console.log('auth_user_id kaydı başarıyla güncellendi');
          } catch (updateError) {
            console.error('auth_user_id kaydı güncellenemedi:', updateError);
          }
        }
      }
      
      // Eğer hiçbir alanda bulunamazsa, auth.users tablosundan bilgileri almaya çalış
      if (!finalApplicantUser) {
        console.log('users tablosunda bulunamadı, auth.users tablosundan bilgi alınmaya çalışılıyor...');
        
        try {
          // Auth.users tablosundan kullanıcı bilgilerini al
          const { data: authUser } = await supabase.auth.admin.getUserById(app.user_id);
          
          if (authUser?.user) {
            const userMetadata = authUser.user.user_metadata || {};
            const email = authUser.user.email || 'user@example.com';
            const fullName = userMetadata.name || userMetadata.full_name || '';
            const [firstName, ...rest] = fullName.split(' ');
            const lastName = rest.join(' ');
            
            // Kullanıcıyı users tablosuna ekle (upsert kullan)
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .upsert({
                auth_user_id: app.user_id,
                user_id: app.user_id,
                first_name: firstName || email.split('@')[0] || 'Kullanıcı',
                last_name: lastName || '',
                email: email,
                phone: userMetadata.phone || null,
                location: userMetadata.city || null,
                role: 'individual'
              }, { 
                onConflict: 'auth_user_id',
                ignoreDuplicates: false 
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('Kullanıcı eklenemedi:', insertError);
              // Hata durumunda auth bilgilerini kullan
              finalApplicantUser = {
                first_name: firstName || email.split('@')[0] || 'Kullanıcı',
                last_name: lastName || '',
                email: email,
                phone: userMetadata.phone || null,
                location: userMetadata.city || null
              };
            } else {
              console.log('Kullanıcı başarıyla eklendi/güncellendi:', newUser);
              finalApplicantUser = newUser;
            }
          } else {
            // Auth.users'da da bulunamazsa varsayılan bilgiler
            finalApplicantUser = {
              first_name: 'Kullanıcı',
              last_name: '',
              email: 'user@example.com',
              phone: null,
              location: null
            };
          }
        } catch (authError) {
          console.error('Auth.users sorgusu başarısız:', authError);
          // Hata durumunda varsayılan bilgiler
          finalApplicantUser = {
            first_name: 'Kullanıcı',
            last_name: '',
            email: 'user@example.com',
            phone: null,
            location: null
          };
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
  
  if (status === 'approved') {
    payload.approve_date = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', applicationId)
    .select('id,status,reject_reason,reject_date,accept_date,approve_date')
    .single();
  if (error) throw error;
  return data;
}

// Bireysel kullanıcı tarafından başvuruyu onaylama
export async function approveApplicationByUser(applicationId: number) {
  try {
    // Önce mevcut başvuruyu kontrol et
    const { data: existingApp, error: fetchError } = await supabase
      .from('applications')
      .select('id, status, user_id')
      .eq('id', applicationId)
      .single();
    
    if (fetchError) {
      console.error('Başvuru bulunamadı:', fetchError);
      throw new Error('Başvuru bulunamadı veya yetkiniz yok - Application not found or no permission');
    }
    
    if (!existingApp) {
      throw new Error('Başvuru bulunamadı veya yetkiniz yok - Application not found or no permission');
    }
    
    if (existingApp.status !== 'accepted') {
      throw new Error('Sadece kabul edilmiş başvurular onaylanabilir - Only accepted applications can be approved');
    }
    
    // Başvuruyu onayla
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status: 'approved',
        approve_date: new Date().toISOString(),
        user_approved: true
      })
      .eq('id', applicationId)
      .select('id,status,approve_date,user_approved')
      .single();
    
    if (error) {
      console.error('Onaylama hatası:', error);
      // Daha açıklayıcı hata mesajı
      const errorMessage = error.message?.includes('permission') || error.message?.includes('yetki') 
        ? 'Yetkiniz yok - No permission'
        : error.message?.includes('network') || error.message?.includes('internet')
        ? 'Bağlantı hatası - Connection error'
        : 'Onaylama işlemi başarısız - Approval process failed';
      
      throw new Error(`${errorMessage}: ${error.message || 'Bilinmeyen hata - Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error('approveApplicationByUser hatası:', error);
    throw error;
  }
}

