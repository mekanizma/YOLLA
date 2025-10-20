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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback: (session: any) => void) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => sub.subscription.unsubscribe();
}


