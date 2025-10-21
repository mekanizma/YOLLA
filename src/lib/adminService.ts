import supabase from './supabaseClient';

// Supabase bağlantısını test et
export async function testSupabaseConnection() {
  try {
    console.log('Supabase bağlantısı test ediliyor...');
    const { data, error } = await supabase.from('jobs').select('count').limit(1);
    
    if (error) {
      console.error('Supabase bağlantı hatası:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase bağlantısı başarılı');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase bağlantı test hatası:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
  }
}

// Tablo yapısını kontrol et
export async function checkTableStructure() {
  try {
    console.log('Tablo yapısı kontrol ediliyor...');
    
    // Önce hangi tabloların mevcut olduğunu kontrol edelim
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Tablo listesi alınamadı:', tablesError);
    } else {
      console.log('Mevcut tablolar:', tables?.map(t => t.table_name));
    }
    
    // Jobs tablosunun kolonlarını kontrol edelim
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'jobs')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('Jobs tablosu kolonları alınamadı:', columnsError);
    } else {
      console.log('Jobs tablosu kolonları:', columns);
    }
    
    return { tables, columns };
  } catch (error) {
    console.error('Tablo yapısı kontrol hatası:', error);
    return null;
  }
}

// Admin Jobs Servisleri
export type AdminJobRecord = {
  id: string;
  title: string;
  company_name: string | null;
  status: 'published' | 'draft' | 'closed';
  created_at: string;
  updated_at: string;
  applications: number;
  views: number;
  location: string;
  type: string;
  experience_level: string;
};

export async function fetchAdminJobs() {
  try {
    console.log('fetchAdminJobs başlatılıyor...');
    
    // Önce basit sorgu deneyelim
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(50);

    if (error) {
      console.error('fetchAdminJobs hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('Tam hata objesi:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('fetchAdminJobs başarılı, veri sayısı:', data?.length || 0);
    console.log('İlk veri örneği:', data?.[0]);
    
    if (!data || data.length === 0) {
      console.log('Jobs tablosunda veri bulunamadı');
      return [];
    }
    
    // Her job için ayrı ayrı company bilgisini ve başvuru sayısını çekelim
    const jobsWithCompanies = await Promise.all(
      data.map(async (job) => {
        let companyName = job.company_name || 'Şirket Yok';
        let applicationCount = 0;
        let viewCount = 0;
        
        // Eğer company_id varsa, companies tablosundan şirket ismini çek
        if (job.company_id && !job.company_name) {
          try {
            const { data: companyData } = await supabase
              .from('companies')
              .select('name')
              .eq('id', job.company_id)
              .single();
            
            if (companyData) {
              companyName = companyData.name;
              console.log(`Company ID ${job.company_id} için şirket ismi bulundu: ${companyName}`);
            }
          } catch (companyError) {
            console.warn(`Company ID ${job.company_id} için şirket bilgisi alınamadı:`, companyError);
          }
        }
        
        // Bu iş ilanına gelen başvuru sayısını çek
        try {
          const { count: appCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);
          
          applicationCount = appCount || 0;
          console.log(`Job ID ${job.id} için başvuru sayısı: ${applicationCount}`);
        } catch (appError) {
          console.warn(`Job ID ${job.id} için başvuru sayısı alınamadı:`, appError);
        }
        
        // Görüntülenme sayısını jobs tablosundan al (eğer varsa)
        viewCount = job.views || 0;
        
        console.log('Job verisi:', job);
        console.log('Company ID:', job.company_id);
        console.log('Company Name:', companyName);
        console.log('Application Count:', applicationCount);
        console.log('View Count:', viewCount);
        
        return {
          id: job.id?.toString() || 'unknown',
          title: job.title || 'Başlık Yok',
          company_name: companyName,
          status: job.status || 'draft',
          created_at: job.created_at || new Date().toISOString(),
          updated_at: job.updated_at || job.created_at || new Date().toISOString(),
          applications: applicationCount,
          views: viewCount,
          location: job.location || 'Lokasyon Yok',
          type: job.type || 'full-time',
          experience_level: job.experience_level || 'mid'
        };
      })
    );
    
    console.log('Formatlanmış veri:', jobsWithCompanies);
    return jobsWithCompanies as AdminJobRecord[];
  } catch (error) {
    console.error('fetchAdminJobs genel hatası:', error);
    console.error('Genel hata detayları:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function updateJobStatus(jobId: string, status: 'published' | 'draft' | 'closed') {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select('id, status')
    .single();

  if (error) throw error;
  return data;
}

export async function updateJobDetails(jobId: string, updates: {
  title?: string;
  company_name?: string;
  status?: 'published' | 'draft' | 'closed';
}) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

// Admin Applications Servisleri
export type AdminApplicationRecord = {
  id: number;
  user_id: string;
  job_id: string;
  status: 'pending' | 'in_review' | 'accepted' | 'rejected' | 'approved';
  created_at: string;
  updated_at: string;
  cover_letter: string | null;
  resume_url: string | null;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
    location: string | null;
  } | null;
  jobs: {
    title: string;
    company_name: string | null;
  } | null;
};

export async function fetchAdminApplications() {
  try {
    console.log('fetchAdminApplications başlatılıyor...');
    
    // Applications tablosundan veri çek
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('fetchAdminApplications hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('fetchAdminApplications başarılı, veri sayısı:', data?.length || 0);
    console.log('İlk veri örneği:', data?.[0]);
    
    if (!data || data.length === 0) {
      console.log('Applications tablosunda veri bulunamadı');
      return [];
    }
    
    // Her başvuru için ayrı ayrı user, job ve company bilgilerini çekelim
    const applicationsWithDetails = await Promise.all(
      data.map(async (app) => {
        let userInfo = {
          full_name: 'Bilinmeyen Kullanıcı',
          email: 'user@example.com',
          phone: null,
          location: null
        };
        
        let jobInfo = {
          title: 'Bilinmeyen İş',
          company_name: 'Bilinmeyen Şirket'
        };
        
        // User bilgilerini çek - önce users tablosunun yapısını kontrol edelim
        try {
          console.log(`User ID ${app.user_id} için kullanıcı bilgisi aranıyor...`);
          
          // Önce users tablosundaki tüm verileri görelim
          const { data: allUsers, error: allUsersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);
          
          if (allUsersError) {
            console.error('Users tablosu sorgu hatası:', allUsersError);
          } else {
            console.log('Users tablosundaki ilk 5 veri:', allUsers);
            console.log('Users tablosu detayları:', JSON.stringify(allUsers, null, 2));
          }
          
          // user_id ile deneyelim (doğru kolon)
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name, email, phone, location')
            .eq('user_id', app.user_id)
            .single();
          
          if (userError) {
            console.warn(`User ID ${app.user_id} için user_id ile kullanıcı bilgisi alınamadı:`, userError);
          } else if (userData) {
            userInfo = {
              full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email?.split('@')[0] || 'Kullanıcı',
              email: userData.email || 'user@example.com',
              phone: userData.phone,
              location: userData.location
            };
            console.log(`User ID ${app.user_id} için user_id ile kullanıcı bilgisi bulundu: ${userInfo.full_name}`);
          } else {
            console.log(`User ID ${app.user_id} için user_id ile eşleşme bulunamadı`);
            
            // Eğer auth_user_id ile bulunamazsa, id ile deneyelim
            try {
              const { data: userDataById, error: userByIdError } = await supabase
                .from('users')
                .select('first_name, last_name, email, phone, location')
                .eq('id', app.user_id)
                .single();
              
              if (userByIdError) {
                console.warn(`User ID ${app.user_id} için id ile kullanıcı bilgisi alınamadı:`, userByIdError);
              } else if (userDataById) {
                userInfo = {
                  full_name: `${userDataById.first_name || ''} ${userDataById.last_name || ''}`.trim() || userDataById.email?.split('@')[0] || 'Kullanıcı',
                  email: userDataById.email || 'user@example.com',
                  phone: userDataById.phone,
                  location: userDataById.location
                };
                console.log(`User ID ${app.user_id} için id ile kullanıcı bilgisi bulundu: ${userInfo.full_name}`);
              } else {
                console.log(`User ID ${app.user_id} için id ile de eşleşme bulunamadı`);
              }
            } catch (userByIdError) {
              console.warn(`User ID ${app.user_id} için id ile de kullanıcı bilgisi alınamadı:`, userByIdError);
            }
          }
        } catch (userError) {
          console.warn(`User ID ${app.user_id} için kullanıcı bilgisi alınamadı:`, userError);
        }
        
        // Job bilgilerini çek
        try {
          console.log(`Job ID ${app.job_id} için iş bilgisi aranıyor...`);
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('title, company_id')
            .eq('id', app.job_id)
            .single();
          
          if (jobError) {
            console.error(`Job ID ${app.job_id} için iş sorgusu hatası:`, jobError);
          } else if (jobData) {
            let companyName = 'Bilinmeyen Şirket';
            
            console.log(`Job verisi bulundu:`, jobData);
            console.log(`Company ID: ${jobData.company_id}`);
            
            // company_id ile companies tablosundan çek
            if (jobData.company_id) {
              try {
                console.log(`Company ID ${jobData.company_id} için şirket bilgisi aranıyor...`);
                const { data: companyData, error: companyError } = await supabase
                  .from('companies')
                  .select('name')
                  .eq('id', jobData.company_id)
                  .single();
                
                if (companyError) {
                  console.error(`Company ID ${jobData.company_id} için şirket sorgusu hatası:`, companyError);
                } else if (companyData) {
                  companyName = companyData.name;
                  console.log(`Company ID ${jobData.company_id} için şirket ismi bulundu: ${companyName}`);
                } else {
                  console.log(`Company ID ${jobData.company_id} için şirket verisi bulunamadı`);
                }
              } catch (companyError) {
                console.warn(`Company ID ${jobData.company_id} için şirket bilgisi alınamadı:`, companyError);
              }
            }
            
            jobInfo = {
              title: jobData.title || 'Bilinmeyen İş',
              company_name: companyName
            };
            console.log(`Job ID ${app.job_id} için iş bilgisi bulundu: ${jobInfo.title}`);
          } else {
            console.log(`Job ID ${app.job_id} için iş verisi bulunamadı`);
          }
        } catch (jobError) {
          console.warn(`Job ID ${app.job_id} için iş bilgisi alınamadı:`, jobError);
        }
        
        console.log('Application verisi:', app);
        console.log('User Info:', userInfo);
        console.log('Job Info:', jobInfo);
        
        return {
          id: app.id,
          user_id: app.user_id || '',
          job_id: app.job_id || '',
          status: app.status || 'pending',
          created_at: app.created_at || new Date().toISOString(),
          updated_at: app.updated_at || app.created_at || new Date().toISOString(),
          cover_letter: app.cover_letter || null,
          resume_url: app.resume_url || null,
          users: userInfo,
          jobs: jobInfo
        };
      })
    );

    console.log('Formatlanmış applications verisi:', applicationsWithDetails);
    return applicationsWithDetails as AdminApplicationRecord[];
  } catch (error) {
    console.error('fetchAdminApplications genel hatası:', error);
    throw error;
  }
}

export async function deleteApplication(applicationId: number) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId);

  if (error) throw error;
  return true;
}

export async function updateApplicationStatus(applicationId: number, status: 'pending' | 'in_review' | 'accepted' | 'rejected' | 'approved') {
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select('id, status')
    .single();

  if (error) throw error;
  return data;
}

// Admin Reports Servisleri
export type AdminStatsData = {
  totalJobs: number;
  totalApplications: number;
  totalUsers: number;
  totalCompanies: number;
  publishedJobs: number;
  draftJobs: number;
  closedJobs: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  recentApplications: AdminApplicationRecord[];
  topCompanies: Array<{
    company_name: string;
    job_count: number;
    application_count: number;
  }>;
  monthlyStats: Array<{
    month: string;
    jobs: number;
    applications: number;
  }>;
};

export async function fetchAdminStats(): Promise<AdminStatsData> {
  try {
    console.log('fetchAdminStats başlatılıyor...');
    
        // Gerçek verileri çekelim - companies tablosu ile join yap
        const jobsResult = await supabase
          .from('jobs')
          .select(`
            id,
            status,
            created_at,
            company_id,
            title,
            companies!inner(
              id,
              name
            )
          `)
          .limit(1000);
    
    const applicationsResult = await supabase
      .from('applications')
      .select('id, status, created_at, job_id, user_id')
      .limit(1000);
    
    const usersResult = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(1000);
    
    const companiesResult = await supabase
      .from('companies')
      .select('id, name')
      .limit(1000);

    console.log('Supabase sorguları tamamlandı');

    if (jobsResult.error) {
      console.error('Jobs sorgu hatası:', jobsResult.error);
      throw jobsResult.error;
    }
    if (applicationsResult.error) {
      console.error('Applications sorgu hatası:', applicationsResult.error);
      throw applicationsResult.error;
    }
    if (usersResult.error) {
      console.error('Users sorgu hatası:', usersResult.error);
      throw usersResult.error;
    }
    if (companiesResult.error) {
      console.error('Companies sorgu hatası:', companiesResult.error);
      throw companiesResult.error;
    }

    const jobs = jobsResult.data || [];
    const applications = applicationsResult.data || [];
    const users = usersResult.data || [];
    const companies = companiesResult.data || [];

    console.log('Veri sayıları:', {
      jobs: jobs.length,
      applications: applications.length,
      users: users.length,
      companies: companies.length
    });

    // İş ilanı istatistikleri
    const publishedJobs = jobs.filter(j => j.status === 'published').length;
    const draftJobs = jobs.filter(j => j.status === 'draft').length;
    const closedJobs = jobs.filter(j => j.status === 'closed').length;

    // Başvuru istatistikleri
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

    // Şirket istatistikleri - gerçek verilerle
    const companyStats = new Map<string, { job_count: number; application_count: number }>();
    
    // Önce companies tablosundan şirket isimlerini al
    const companyMap = new Map();
    companies.forEach(company => {
      companyMap.set(company.id, company.name);
    });
    
        jobs.forEach(job => {
          // Companies tablosundan şirket ismini al
          let companyName = job.companies?.[0]?.name || 'Bilinmeyen Şirket';

          if (!companyStats.has(companyName)) {
            companyStats.set(companyName, { job_count: 0, application_count: 0 });
          }
          companyStats.get(companyName)!.job_count++;
        });

        applications.forEach(app => {
          const job = jobs.find(j => j.id === app.job_id);
          if (job) {
            // Companies tablosundan şirket ismini al
            let companyName = job.companies?.[0]?.name || 'Bilinmeyen Şirket';

            if (!companyStats.has(companyName)) {
              companyStats.set(companyName, { job_count: 0, application_count: 0 });
            }
            companyStats.get(companyName)!.application_count++;
          }
        });

    const topCompanies = Array.from(companyStats.entries())
      .map(([company_name, stats]) => ({ company_name, ...stats }))
      .sort((a, b) => b.application_count - a.application_count)
      .slice(0, 10);

    // Aylık istatistikler
    const monthlyStats = new Map<string, { jobs: number; applications: number }>();
    
    jobs.forEach(job => {
      const month = new Date(job.created_at).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyStats.has(month)) {
        monthlyStats.set(month, { jobs: 0, applications: 0 });
      }
      monthlyStats.get(month)!.jobs++;
    });

    applications.forEach(app => {
      const month = new Date(app.created_at).toISOString().substring(0, 7);
      if (!monthlyStats.has(month)) {
        monthlyStats.set(month, { jobs: 0, applications: 0 });
      }
      monthlyStats.get(month)!.applications++;
    });

    const monthlyStatsArray = Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Son 12 ay

    // Son başvuruları gerçek verilerle formatla
    const recentApplications = await Promise.all(
      applications.slice(0, 10).map(async (app) => {
        let userInfo = {
          full_name: 'Bilinmeyen Kullanıcı',
          email: 'user@example.com',
          phone: null,
          location: null
        };

        let jobInfo = {
          title: 'Bilinmeyen İş',
          company_name: 'Bilinmeyen Şirket'
        };

        // User bilgilerini çek - user_id ile
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name, email, phone, location')
            .eq('user_id', app.user_id)
            .single();
          
          if (userData) {
            userInfo = {
              full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email?.split('@')[0] || 'Kullanıcı',
              email: userData.email || 'user@example.com',
              phone: userData.phone,
              location: userData.location
            };
            console.log(`Recent App - User ID ${app.user_id} için kullanıcı bilgisi bulundu: ${userInfo.full_name}`);
          }
        } catch (userError) {
          console.warn(`Recent App - User ID ${app.user_id} için kullanıcı bilgisi alınamadı:`, userError);
        }
        
        // Job bilgilerini çek
        try {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('title, company_id')
            .eq('id', app.job_id)
            .single();
          
          if (jobError) {
            console.error(`Recent App - Job ID ${app.job_id} için iş sorgusu hatası:`, jobError);
          } else if (jobData) {
            let companyName = 'Bilinmeyen Şirket';
            
            console.log(`Recent App - Job verisi bulundu:`, jobData);
            console.log(`Recent App - Company ID: ${jobData.company_id}`);
            
            // company_id ile companies tablosundan çek
            if (jobData.company_id) {
              try {
                console.log(`Recent App - Company ID ${jobData.company_id} için şirket bilgisi aranıyor...`);
                const { data: companyData, error: companyError } = await supabase
                  .from('companies')
                  .select('name')
                  .eq('id', jobData.company_id)
                  .single();
                
                if (companyError) {
                  console.error(`Recent App - Company ID ${jobData.company_id} için şirket sorgusu hatası:`, companyError);
                } else if (companyData) {
                  companyName = companyData.name;
                  console.log(`Recent App - Company ID ${jobData.company_id} için şirket ismi bulundu: ${companyName}`);
                } else {
                  console.log(`Recent App - Company ID ${jobData.company_id} için şirket verisi bulunamadı`);
                }
              } catch (companyError) {
                console.warn(`Recent App - Company ID ${jobData.company_id} için şirket bilgisi alınamadı:`, companyError);
              }
            }
            
            jobInfo = {
              title: jobData.title || 'Bilinmeyen İş',
              company_name: companyName
            };
            console.log(`Recent App - Job ID ${app.job_id} için iş bilgisi bulundu: ${jobInfo.title}`);
          } else {
            console.log(`Recent App - Job ID ${app.job_id} için iş verisi bulunamadı`);
          }
        } catch (jobError) {
          console.warn(`Recent App - Job ID ${app.job_id} için iş bilgisi alınamadı:`, jobError);
        }
    
        return {
          id: app.id,
          user_id: app.user_id || '',
          job_id: app.job_id || '',
          status: app.status || 'pending',
          created_at: app.created_at || new Date().toISOString(),
          updated_at: app.created_at || new Date().toISOString(),
          cover_letter: null,
          resume_url: null,
          users: userInfo,
          jobs: jobInfo
        };
      })
    );

    const result = {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      totalUsers: users.length,
      totalCompanies: companies.length,
      publishedJobs,
      draftJobs,
      closedJobs,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      recentApplications: recentApplications as AdminApplicationRecord[],
      topCompanies,
      monthlyStats: monthlyStatsArray
    };

    console.log('fetchAdminStats başarılı:', result);
    return result;
  } catch (error) {
    console.error('fetchAdminStats genel hatası:', error);
    throw error;
  }
}

// Filtrelenmiş raporlar için
export async function fetchFilteredApplications(filters: {
  dateRange?: { start: string; end: string };
  company?: string;
  status?: string;
}) {
  try {
    let query = supabase
      .from('applications')
      .select('*');

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('fetchFilteredApplications hatası:', error);
      throw error;
    }

    // Basit formatla
    return (data || []).map(app => ({
      id: app.id,
      user_id: app.user_id || '',
      job_id: app.job_id || '',
      status: app.status || 'pending',
      created_at: app.created_at || new Date().toISOString(),
      updated_at: app.updated_at || app.created_at || new Date().toISOString(),
      cover_letter: app.cover_letter || null,
      resume_url: app.resume_url || null,
      users: {
        full_name: 'Kullanıcı',
        email: 'user@example.com',
        phone: null,
        location: null
      },
      jobs: {
        title: 'İş İlanı',
        company_name: 'Şirket'
      }
    })) as AdminApplicationRecord[];
  } catch (error) {
    console.error('fetchFilteredApplications genel hatası:', error);
    throw error;
  }
}
