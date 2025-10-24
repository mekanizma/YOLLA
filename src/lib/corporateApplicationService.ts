import supabase from './supabaseClient';

export interface CorporateApplicationData {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface CorporateApplicationRecord {
  id: number;
  company_name: string;
  full_name: string;
  phone: string;
  email: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export async function submitCorporateApplication(data: CorporateApplicationData): Promise<void> {
  try {
    console.log('Kurumsal başvuru gönderiliyor:', data);
    
    const { error } = await supabase
      .from('corporate_applications')
      .insert([
        {
          company_name: data.companyName,
          full_name: data.fullName,
          phone: data.phone,
          email: data.email,
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Kurumsal başvuru hatası:', error);
      throw new Error(error.message || 'Başvuru gönderilirken bir hata oluştu');
    }

    console.log('Kurumsal başvuru başarıyla gönderildi');
  } catch (error) {
    console.error('Kurumsal başvuru genel hatası:', error);
    throw error;
  }
}

export async function fetchCorporateApplications(): Promise<CorporateApplicationRecord[]> {
  try {
    console.log('Kurumsal başvurular getiriliyor...');
    
    const { data, error } = await supabase
      .from('corporate_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Kurumsal başvurular getirme hatası:', error);
      throw error;
    }

    console.log('Kurumsal başvurular başarıyla getirildi:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Kurumsal başvurular genel hatası:', error);
    throw error;
  }
}

export async function updateCorporateApplicationStatus(
  id: number, 
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('corporate_applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Kurumsal başvuru durumu güncelleme hatası:', error);
      throw error;
    }

    console.log('Kurumsal başvuru durumu başarıyla güncellendi');
  } catch (error) {
    console.error('Kurumsal başvuru durumu güncelleme genel hatası:', error);
    throw error;
  }
}

export async function deleteCorporateApplication(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('corporate_applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Kurumsal başvuru silme hatası:', error);
      throw error;
    }

    console.log('Kurumsal başvuru başarıyla silindi');
  } catch (error) {
    console.error('Kurumsal başvuru silme genel hatası:', error);
    throw error;
  }
}
