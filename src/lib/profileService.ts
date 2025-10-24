import supabase from './supabaseClient';

export type Profile = {
  email: string;
  name?: string;
  phone?: string;
  location?: string;
  title?: string;
  avatar?: string;
  userType?: 'individual' | 'corporate' | 'admin';
  about?: string;
  skills?: string[];
  languages?: any[];
  experiences?: any[];
  educations?: any[];
  certificates?: any[];
};

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  // users tablosundan da çek (varsa)
  // Kolonların bazıları şemada olmayabilir; '*' seçimi güvenli
  const { data: row } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  const meta = user.user_metadata || {};
  // Bazı kayıt akışlarında name yerine job yazılmış olabilir; name alanını sadece isim amaçlı kullan
  const metaFullName = (meta.full_name as string)
    || (meta.name as string)
    || `${(meta.first_name as string) || ''} ${(meta.last_name as string) || ''}`.trim();
  return {
    email: user.email || '',
    name: row ? `${row.first_name || ''} ${row.last_name || ''}`.trim() || metaFullName || '' : (metaFullName || ''),
    phone: (row?.phone as any) || meta.phone || '',
    location: (row?.location as any) || meta.location || (meta.city as any) || '',
    title: (row as any)?.title || meta.title || (meta.job as any) || '',
    avatar: (row?.avatar as any) || meta.avatar_url || '',
    userType: (row?.role as any) || meta.userType || 'individual',
    about: (row as any)?.about || meta.about || '',
    skills: (row as any)?.skills || meta.skills || [],
    languages: (row as any)?.languages || meta.languages || [],
    experiences: (row as any)?.experiences || meta.experiences || [],
    educations: (row as any)?.educations || meta.educations || [],
    certificates: (row as any)?.certificates || meta.certificates || [],
  };
}

export async function updateCurrentUserProfile(updates: Partial<Profile>) {
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) throw new Error('Giriş yapılmamış');
  const { error: authErr } = await supabase.auth.updateUser({ data: { ...session.user.user_metadata, ...updates } });
  if (authErr) throw authErr;

  // users tablosunu da güncelle (varsayılan tablo yapısı için)
  const name = updates.name || session.user.user_metadata?.name || '';
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');
  // Geniş alanlarla upsert dene; şemada yoksa temel alanlarla tekrar dene
  const basePayload: any = {
    email: session.user.email,
    first_name: firstName || null,
    last_name: lastName || null,
    phone: updates.phone || null,
    location: updates.location || null,
    avatar: updates.avatar || session.user.user_metadata?.avatar || null,
  };
  const extendedPayload: any = {
    ...basePayload,
    about: updates.about ?? (session.user.user_metadata as any)?.about ?? null,
    skills: updates.skills ?? (session.user.user_metadata as any)?.skills ?? null,
    languages: updates.languages ?? (session.user.user_metadata as any)?.languages ?? null,
    experiences: updates.experiences ?? (session.user.user_metadata as any)?.experiences ?? null,
    educations: updates.educations ?? (session.user.user_metadata as any)?.educations ?? null,
    certificates: updates.certificates ?? (session.user.user_metadata as any)?.certificates ?? null,
  };
  let upsertErr = null as any;
  try {
    const { error } = await supabase
      .from('users')
      .upsert(extendedPayload, { onConflict: 'email' });
    upsertErr = error;
  } catch (e: any) {
    upsertErr = e;
  }
  if (upsertErr) {
    // Kolon uyumsuzluklarında minimum alanları yaz
    const { error: retryErr } = await supabase
      .from('users')
      .upsert(basePayload, { onConflict: 'email' });
    if (retryErr) throw retryErr;

    // Geniş alanları tek tek dene (varsa yazılsın)
    const singleFieldUpdates: Array<[string, any]> = [
      ['about', extendedPayload.about],
      ['skills', extendedPayload.skills],
      ['languages', extendedPayload.languages],
      ['experiences', extendedPayload.experiences],
      ['educations', extendedPayload.educations],
      ['certificates', extendedPayload.certificates],
    ];
    for (const [key, value] of singleFieldUpdates) {
      if (typeof value === 'undefined') continue;
      try {
        const { error } = await supabase
          .from('users')
          .update({ [key]: value })
          .eq('email', session.user.email as string);
        // Hata olursa (kolon yok/tip uyumsuz), atla
        if (error) {
          // eslint-disable-next-line no-console
          console.warn(`users.${key} güncellenemedi:`, error);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`users.${key} güncellenemedi:`, e);
      }
    }
  }
}


