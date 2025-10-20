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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;


