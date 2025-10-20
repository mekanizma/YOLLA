import supabase from './supabaseClient';

// Bu fonksiyonlar minimum ortak kolonlarla (email, first_name, last_name, role) çalışır
async function ensureUserRowByEmail(payload: { email: string; first_name?: string | null; last_name?: string | null; role?: string | null }) {
  const email = payload.email;
  // 1) Var mı?
  const { data: existing, error: selErr } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!existing) {
    const { error: insErr } = await supabase
      .from('users')
      .insert({
        email,
        first_name: payload.first_name || null,
        last_name: payload.last_name || null,
        role: payload.role || 'individual'
      });
    if (insErr) throw insErr;
  } else {
    const { error: updErr } = await supabase
      .from('users')
      .update({
        first_name: payload.first_name ?? undefined,
        last_name: payload.last_name ?? undefined,
        role: payload.role ?? undefined
      })
      .eq('email', email);
    if (updErr) throw updErr;
  }
}

async function ensureUserRowByUserId(payload: { user_id: string; email: string; first_name?: string | null; last_name?: string | null; role?: string | null }) {
  const { data: existing, error: selErr } = await supabase
    .from('users')
    .select('user_id')
    .eq('user_id', payload.user_id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!existing) {
    const { error: insErr } = await supabase
      .from('users')
      .insert({
        user_id: payload.user_id,
        email: payload.email,
        first_name: payload.first_name || null,
        last_name: payload.last_name || null,
        role: payload.role || 'individual'
      });
    if (insErr) throw insErr;
  } else {
    const { error: updErr } = await supabase
      .from('users')
      .update({
        email: payload.email,
        first_name: payload.first_name ?? undefined,
        last_name: payload.last_name ?? undefined,
        role: payload.role ?? undefined
      })
      .eq('user_id', payload.user_id);
    if (updErr) throw updErr;
  }
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login/individual` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata, emailRedirectTo: redirectTo }
  });
  if (error) throw error;
  // Kullanıcı tablosuna kayıt (oturum varsa hemen; yoksa ilk girişte yapılacak)
  try {
    if (data.session) {
      const uid = data.user?.id as string;
      const fullName: string = (metadata?.name as string) || '';
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');
      if (uid) {
        try {
          await ensureUserRowByUserId({
            user_id: uid,
            email,
            first_name: firstName || fullName || '',
            last_name: lastName || ''
          });
        } catch (e) {
          await ensureUserRowByEmail({
            email,
            first_name: firstName || fullName || '',
            last_name: lastName || ''
          });
        }
      } else {
        await ensureUserRowByEmail({
          email,
          first_name: firstName || fullName || '',
          last_name: lastName || ''
        });
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('users tablosuna yazılamadı:', e);
  }
  // Otomatik login istemiyorsanız, session varsa kapatın
  if (data.session) {
    await supabase.auth.signOut();
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // İlk girişte users kaydı yoksa oluştur
  try {
    const meta = data.user?.user_metadata || {};
    const uid = data.user?.id as string;
    const fullName: string = (meta.name as string) || '';
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');
    if (uid) {
      try {
        await ensureUserRowByUserId({
          user_id: uid,
          email,
          first_name: firstName || fullName || '',
          last_name: lastName || ''
        });
      } catch (e) {
        await ensureUserRowByEmail({
          email,
          first_name: firstName || fullName || '',
          last_name: lastName || ''
        });
      }
    } else {
      await ensureUserRowByEmail({
        email,
        first_name: firstName || fullName || '',
        last_name: lastName || ''
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('users upsert (login) başarısız:', e);
  }
  return data;
}

// Belirli role ile giriş zorunluluğu: users.role veya user_metadata.userType kontrol edilir
export async function signInWithRole(email: string, password: string, allowedRole: 'individual' | 'corporate' | 'admin') {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Rolü oku
  const authUser = data.user;
  const metaRole = (authUser?.user_metadata as any)?.userType as string | undefined;

  let rowRole: string | null = null;
  try {
    const { data: row } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .maybeSingle();
    rowRole = (row as any)?.role ?? null;
  } catch (_e) {
    // tablo erişiminde sorun olsa da meta ile devam edilecek
  }

  const effectiveRole = (rowRole || metaRole || 'individual') as 'individual' | 'corporate' | 'admin';
  if (effectiveRole !== allowedRole) {
    // Yanlış panel girişini engelle
    await supabase.auth.signOut();
    throw new Error(
      allowedRole === 'individual'
        ? 'Bu panel sadece bireysel hesaplar içindir.'
        : allowedRole === 'corporate'
          ? 'Bu panel sadece kurumsal hesaplar içindir.'
          : 'Yetkisiz giriş.'
    );
  }

  // Users kaydını senkronize et (mevcut signIn ile aynı mantık)
  try {
    const uid = authUser?.id as string;
    const meta = authUser?.user_metadata || {};
    const fullName: string = (meta.name as string) || '';
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');
    if (uid) {
      try {
        await ensureUserRowByUserId({
          user_id: uid,
          email,
          first_name: firstName || fullName || '',
          last_name: lastName || '',
          role: effectiveRole
        });
      } catch (e) {
        await ensureUserRowByEmail({
          email,
          first_name: firstName || fullName || '',
          last_name: lastName || '',
          role: effectiveRole
        });
      }
    } else {
      await ensureUserRowByEmail({
        email,
        first_name: firstName || fullName || '',
        last_name: lastName || '',
        role: effectiveRole
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('users upsert (role login) başarısız:', e);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback: (session: any) => void) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => sub.subscription.unsubscribe();
}



// Admin: Kurumsal hesap oluştur (auth kullanıcı + users tablosu + companies kaydı)
export async function adminCreateCorporateAccount(payload: {
  email: string;
  password: string;
  companyName: string;
  phone?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  size?: string;
  founded_year?: number;
}) {
  const { email, password, companyName, phone, description, industry, location, website, size, founded_year } = payload;

  // 1) Auth kullanıcısı oluştur (rol bilgisini metadata'ya da yaz)
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { userType: 'corporate', name: companyName, phone },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login/corporate` : undefined
    }
  });
  if (signUpErr) throw signUpErr;

  // 2) users tablosunu garantiye al (rol = corporate)
  try {
    const uid = signUpData.user?.id as string | undefined;
    if (uid) {
      await ensureUserRowByUserId({
        user_id: uid,
        email,
        first_name: companyName,
        last_name: 'Şirket', // Boş string yerine 'Şirket' gönderiyoruz
        role: 'corporate'
      });
    } else {
      await ensureUserRowByEmail({ email, first_name: companyName, last_name: 'Şirket', role: 'corporate' });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('users insert (admin corporate) başarısız:', e);
  }

  // 3) companies tablosuna detaylı kayıt
  try {
    // Normalize email to satisfy DB check (trim, lowercase, strip spaces, remove special chars)
    const normalizedEmail = (email || '')
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
      .replace(/[\u0000-\u001F\u007F]/g, '') // control chars
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^\w@.-]/g, ''); // Sadece alfanumerik, @, ., - karakterlerini bırak

    const normalizedWebsite = website
      ? (website.startsWith('http://') || website.startsWith('https://')
          ? website.trim()
          : `https://${website.trim()}`)
      : null;

    const companyPayload = {
      name: companyName,
      email: normalizedEmail,
      phone: phone || null,
      description: description || '',
      industry: industry || '',
      location: location || '',
      website: normalizedWebsite,
      size: size || null,
      founded_year: founded_year || null,
      is_verified: true,
      status: 'pending' // enum değerini pending olarak değiştirdim
    };
    
    console.log('Companies payload:', companyPayload); // Debug için
    console.log('Original email:', email);
    console.log('Normalized email:', normalizedEmail);
    
    // Email formatını kontrol et ve düzelt
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(companyPayload.email)) {
      console.error('Geçersiz email formatı:', companyPayload.email);
      throw new Error('Geçersiz email formatı');
    }
    
    // Önce email ile kontrol et, varsa güncelle yoksa ekle
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', companyPayload.email)
      .single();
    
    let compData, compErr;
    
    if (existingCompany) {
      // Güncelle
      const result = await supabase
        .from('companies')
        .update(companyPayload)
        .eq('id', existingCompany.id)
        .select();
      compData = result.data;
      compErr = result.error;
    } else {
      // Yeni kayıt ekle
      const result = await supabase
        .from('companies')
        .insert(companyPayload)
        .select();
      compData = result.data;
      compErr = result.error;
    }

    if (compErr) {
      console.error('Companies upsert hatası:', compErr);
      console.error('Hata detayları:', {
        code: compErr.code,
        message: compErr.message,
        details: compErr.details,
        hint: compErr.hint
      });
      
      // Email constraint hatası ise farklı bir yaklaşım dene
      if (compErr.code === '23514' && compErr.message.includes('companies_email_chk')) {
        console.log('Email constraint hatası, alternatif yaklaşım deneniyor...');
        console.log('Constraint hatası detayları:', compErr.details);
        
        // Supabase constraint'i kontrol etmek için test sorgusu
        try {
          const testResult = await supabase
            .from('companies')
            .select('email')
            .limit(1);
          console.log('Mevcut companies tablosu örneği:', testResult.data);
        } catch (testErr) {
          console.log('Test sorgusu hatası:', testErr);
        }
        
        // Daha agresif email temizleme
        const ultraCleanEmail = normalizedEmail
          .replace(/[^a-zA-Z0-9@.-]/g, '')
          .replace(/\.{2,}/g, '.')
          .replace(/@{2,}/g, '@');
        
        console.log('Ultra clean email:', ultraCleanEmail);
        
        const ultraCleanPayload = { ...companyPayload, email: ultraCleanEmail };
        
        const retryResult = await supabase
          .from('companies')
          .insert(ultraCleanPayload)
          .select();
          
        if (retryResult.error) {
          console.error('Retry da başarısız:', retryResult.error);
          console.error('Ultra clean payload:', ultraCleanPayload);
          throw retryResult.error;
        } else {
          console.log('Retry başarılı:', retryResult.data);
        }
      } else {
        throw compErr;
      }
    } else {
      console.log('Companies kaydı başarılı:', compData);
    }
  } catch (e) {
    console.error('companies upsert (admin corporate) başarısız:', e);
    // Hata olsa bile devam et, sadece logla
  }

  // 4) Oturum açıldıysa kapat (admin paneli localStorage ile yönetiliyor)
  if (signUpData.session) {
    await supabase.auth.signOut();
  }

  return { ok: true };
}
