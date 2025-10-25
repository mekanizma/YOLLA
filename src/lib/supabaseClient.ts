import { createClient } from '@supabase/supabase-js';

// VITE_* yoksa .env'deki SUPABASE_* değerlerini kullan
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL) as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY) as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Bu dosya build-time'da değerlendirildiği için, eksik env olduğunda sadece console uyarısı veriyoruz
  // Runtime hatalarını önlemek için fonksiyonlar ayrıca hata döndürecek
  // eslint-disable-next-line no-console
  console.warn('Supabase env değişkenleri eksik: VITE_SUPABASE_URL ve/veya VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'yollabi-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Connection health check
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

export default supabase;


