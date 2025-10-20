import supabase from './supabaseClient';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: 'application_count' | 'profile_completion' | 'custom';
  condition_value: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: string;
  badge_id: number;
  earned_at: string;
  badge?: Badge;
}

// Rozetleri getir
export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('id');

  if (error) throw error;
  return data || [];
}

// Kullanıcının rozetlerini getir
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Kullanıcıya rozet ver
export async function awardBadge(userId: string, badgeId: number): Promise<void> {
  // Önce bu rozeti daha önce almış mı kontrol et
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) return; // Zaten almış

  const { error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString()
    });

  if (error) throw error;
}

// Başvuru sayısına göre rozet kontrolü
export async function checkApplicationBadges(userId: string): Promise<void> {
  // Kullanıcının toplam başvuru sayısını al
  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!count) return;

  // Başvuru sayısına göre rozetleri kontrol et
  const badges = await getAllBadges();
  const applicationBadges = badges.filter(b => b.condition_type === 'application_count');

  for (const badge of applicationBadges) {
    if (count >= badge.condition_value) {
      await awardBadge(userId, badge.id);
    }
  }
}

// Profil tamamlanma oranına göre rozet kontrolü
export async function checkProfileCompletionBadges(userId: string, completionPercent: number): Promise<void> {
  const badges = await getAllBadges();
  const profileBadges = badges.filter(b => b.condition_type === 'profile_completion');

  for (const badge of profileBadges) {
    if (completionPercent >= badge.condition_value) {
      await awardBadge(userId, badge.id);
    }
  }
}

// Varsayılan rozetleri oluştur (ilk kurulum için)
export async function createDefaultBadges(): Promise<void> {
  const defaultBadges = [
    {
      name: 'İlk Başvuru',
      description: 'İlk iş başvurunu tamamladın!',
      icon: '🎯',
      condition_type: 'application_count',
      condition_value: 1,
      is_active: true
    },
    {
      name: '5 İlana Başvurdu',
      description: 'İlk 5 iş başvurunu tamamladın!',
      icon: '🏆',
      condition_type: 'application_count',
      condition_value: 5,
      is_active: true
    },
    {
      name: '10 İlana Başvurdu',
      description: '10 iş başvurunu tamamladın!',
      icon: '🚀',
      condition_type: 'application_count',
      condition_value: 10,
      is_active: true
    },
    {
      name: 'Profilini %50 Doldurdu',
      description: 'Profilini yarıya kadar doldurdun!',
      icon: '📝',
      condition_type: 'profile_completion',
      condition_value: 50,
      is_active: true
    },
    {
      name: 'Profilini %100 Doldurdu',
      description: 'Profilini eksiksiz doldurdun!',
      icon: '💯',
      condition_type: 'profile_completion',
      condition_value: 100,
      is_active: true
    }
  ];

  for (const badge of defaultBadges) {
    const { error } = await supabase
      .from('badges')
      .upsert(badge, { onConflict: 'name' });
    
    if (error) {
      console.warn('Badge oluşturma hatası:', error);
    }
  }
}
