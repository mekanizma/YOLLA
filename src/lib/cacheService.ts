// Cache ve Preloading optimizasyonları
import supabase from './supabaseClient';

// Cache için basit bir Map
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Cache kontrolü
function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Cache'e veri kaydetme
function setCachedData(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Optimized fetchPublishedJobs with cache
export async function fetchPublishedJobsOptimized(params?: { 
  search?: string; 
  city?: string; 
  category?: string; 
  workType?: string; 
}) {
  const cacheKey = `jobs_${params?.search || ''}_${params?.city || ''}_${params?.category || ''}_${params?.workType || ''}`;
  
  // Cache'den kontrol et
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

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
    query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }
  if (params?.category) query.eq('department', params.category);
  if (params?.workType) query.eq('type', params.workType);

  const { data, error } = await query;
  if (error) throw error;
  
  const result = data as unknown as (any & { 
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
  
  // Cache'e kaydet
  setCachedData(cacheKey, result);
  
  return result;
}

// Preload critical data
export async function preloadCriticalData() {
  try {
    // Kritik verileri paralel olarak önceden yükle
    await Promise.all([
      fetchPublishedJobsOptimized(),
      supabase.auth.getUser()
    ]);
  } catch (error) {
    console.warn('Preload failed:', error);
  }
}

// Cache temizleme
export function clearCache() {
  cache.clear();
}

