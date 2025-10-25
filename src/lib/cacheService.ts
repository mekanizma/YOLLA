// Cache ve Preloading optimizasyonları
import supabase from './supabaseClient';

// Cache için basit bir Map
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 dakika (daha kısa süre)
const MAX_CACHE_SIZE = 100; // Maksimum cache boyutu

// Cache temizleme fonksiyonu
function cleanupCache() {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  // Eski cache'leri temizle
  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
  
  // Cache boyutu çok büyükse en eski olanları sil
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, cache.size - MAX_CACHE_SIZE);
    
    for (const [key] of sortedEntries) {
      cache.delete(key);
    }
  }
}

// Periyodik temizlik (her 30 saniyede bir)
setInterval(cleanupCache, 30 * 1000);

// Cache kontrolü
function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  // Eski cache'i sil
  if (cached) {
    cache.delete(key);
  }
  return null;
}

// Cache'e veri kaydetme
function setCachedData(key: string, data: any) {
  // Cache temizliği yap
  cleanupCache();
  
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

// Cache istatistikleri
export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    duration: CACHE_DURATION
  };
}

