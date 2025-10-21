import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, X, Check, Award } from 'lucide-react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import supabase from '../../lib/supabaseClient';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Başvuru bilgilerini al
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', id)
          .single();
        
        if (appError) throw appError;
        
        // Job bilgilerini al
        const { data: jobData } = await supabase
          .from('jobs')
          .select('title,description,requirements,location')
          .eq('id', appData.job_id)
          .single();
        
        // Başvuru yapan kişinin bilgilerini al (auth_user_id ile)
        const { data: applicantUser } = await supabase
          .from('users')
          .select('first_name,last_name,email,phone,location,about,skills,languages,experiences,educations')
          .eq('auth_user_id', appData.user_id)
          .single();
        
        console.log('Başvuru user_id:', appData.user_id);
        console.log('Kullanıcı verisi:', applicantUser);
        
        // Eğer auth_user_id ile bulunamazsa, user_id ile dene
        let finalApplicantUser = applicantUser;
        if (!applicantUser) {
          console.log('auth_user_id ile bulunamadı, user_id ile deneniyor...');
          const { data: applicantUser2 } = await supabase
            .from('users')
            .select('first_name,last_name,email,phone,location,about,skills,languages,experiences,educations')
            .eq('user_id', appData.user_id)
            .single();
          
          console.log('user_id ile kullanıcı verisi:', applicantUser2);
          
          if (applicantUser2) {
            finalApplicantUser = applicantUser2;
          }
        }
        
        // Eğer auth_user_id ile "Bilinmeyen Kullanıcı" bulunduysa, user_id ile dene
        if (applicantUser && applicantUser.first_name === 'Bilinmeyen') {
          console.log('auth_user_id ile "Bilinmeyen Kullanıcı" bulundu, user_id ile deneniyor...');
          const { data: applicantUser2 } = await supabase
            .from('users')
            .select('first_name,last_name,email,phone,location,about,skills,languages,experiences,educations')
            .eq('user_id', appData.user_id)
            .single();
          
          console.log('user_id ile kullanıcı verisi:', applicantUser2);
          
          if (applicantUser2 && applicantUser2.first_name !== 'Bilinmeyen') {
            finalApplicantUser = applicantUser2;
            console.log('user_id ile doğru kullanıcı bulundu, auth_user_id kaydını güncelliyor...');
            
            // auth_user_id kaydını da güncelle
            try {
              await supabase
                .from('users')
                .update({
                  first_name: applicantUser2.first_name,
                  last_name: applicantUser2.last_name,
                  email: applicantUser2.email,
                  phone: applicantUser2.phone,
                  location: applicantUser2.location,
                  about: applicantUser2.about,
                  skills: applicantUser2.skills,
                  languages: applicantUser2.languages,
                  experiences: applicantUser2.experiences,
                  educations: applicantUser2.educations
                })
                .eq('auth_user_id', appData.user_id);
              console.log('auth_user_id kaydı başarıyla güncellendi');
            } catch (updateError) {
              console.error('auth_user_id kaydı güncellenemedi:', updateError);
            }
          }
        }
        
        // Eğer hiçbir alanda bulunamazsa, auth.users tablosundan bilgileri almaya çalış
        if (!finalApplicantUser) {
          console.log('users tablosunda bulunamadı, auth.users tablosundan bilgi alınmaya çalışılıyor...');
          
          try {
            // Auth.users tablosundan kullanıcı bilgilerini al
            const { data: authUser } = await supabase.auth.admin.getUserById(appData.user_id);
            
            if (authUser?.user) {
              const userMetadata = authUser.user.user_metadata || {};
              const email = authUser.user.email || 'user@example.com';
              const fullName = userMetadata.name || userMetadata.full_name || '';
              const [firstName, ...rest] = fullName.split(' ');
              const lastName = rest.join(' ');
              
              // Kullanıcıyı users tablosuna ekle
              const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                  auth_user_id: appData.user_id,
                  user_id: appData.user_id,
                  first_name: firstName || email.split('@')[0] || 'Kullanıcı',
                  last_name: lastName || '',
                  email: email,
                  phone: userMetadata.phone || null,
                  location: userMetadata.city || null,
                  role: 'individual'
                })
                .select()
                .single();
              
              if (insertError) {
                console.error('Kullanıcı eklenemedi:', insertError);
                // Hata durumunda auth bilgilerini kullan
                finalApplicantUser = {
                  first_name: firstName || email.split('@')[0] || 'Kullanıcı',
                  last_name: lastName || '',
                  email: email,
                  phone: userMetadata.phone || null,
                  location: userMetadata.city || null,
                  about: null,
                  skills: null,
                  languages: null,
                  experiences: null,
                  educations: null
                };
              } else {
                console.log('Kullanıcı başarıyla eklendi:', newUser);
                finalApplicantUser = newUser;
              }
            } else {
              // Auth.users'da da bulunamazsa varsayılan bilgiler
              finalApplicantUser = {
                first_name: 'Kullanıcı',
                last_name: '',
                email: 'user@example.com',
                phone: null,
                location: null,
                about: null,
                skills: null,
                languages: null,
                experiences: null,
                educations: null
              };
            }
          } catch (authError) {
            console.error('Auth.users sorgusu başarısız:', authError);
            // Hata durumunda varsayılan bilgiler
            finalApplicantUser = {
              first_name: 'Kullanıcı',
              last_name: '',
              email: 'user@example.com',
              phone: null,
              location: null,
              about: null,
              skills: null,
              languages: null,
              experiences: null,
              educations: null
            };
          }
        }
        
        const applicantName = finalApplicantUser 
          ? `${finalApplicantUser.first_name || ''} ${finalApplicantUser.last_name || ''}`.trim() || finalApplicantUser.email?.split('@')[0] || 'Kullanıcı'
          : 'Bilinmeyen Kullanıcı';
        
        // JSON verilerini parse et
        const experiences = typeof finalApplicantUser?.experiences === 'string' 
          ? JSON.parse(finalApplicantUser.experiences || '[]') 
          : finalApplicantUser?.experiences || [];
        
        const educations = typeof finalApplicantUser?.educations === 'string' 
          ? JSON.parse(finalApplicantUser.educations || '[]') 
          : finalApplicantUser?.educations || [];
        
        const skills = typeof finalApplicantUser?.skills === 'string' 
          ? JSON.parse(finalApplicantUser.skills || '[]') 
          : finalApplicantUser?.skills || [];
        
        const languages = typeof finalApplicantUser?.languages === 'string' 
          ? JSON.parse(finalApplicantUser.languages || '[]') 
          : finalApplicantUser?.languages || [];
        
        setApplication({
          id: appData.id,
          jobTitle: jobData?.title || 'İş İlanı',
          applicantName: applicantName,
          email: finalApplicantUser?.email || 'Email bulunamadı',
          phone: finalApplicantUser?.phone || '-',
          location: finalApplicantUser?.location || jobData?.location || '-',
          appliedDate: new Date(appData.created_at).toLocaleDateString('tr-TR'),
          status: appData.status === 'pending' ? 'Beklemede' : 
                 appData.status === 'in_review' ? 'Değerlendiriliyor' :
                 appData.status === 'accepted' ? 'Kabul Edildi' :
                 appData.status === 'approved' ? 'Onaylandı' :
                 appData.status === 'rejected' ? 'Reddedildi' : 'Beklemede',
          coverLetter: appData.cover_letter || 'Ön yazı bulunmuyor.',
          experience: experiences,
          education: educations,
          skills: skills,
          languages: languages,
          certificates: [],
          about: finalApplicantUser?.about || ''
        });
        
      } catch (error) {
        console.error('Başvuru yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Başvuru yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Başvuru bulunamadı.</p>
          <Button onClick={() => navigate('/corporate/applications')} className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    alert('Başvuru kabul edildi!');
  };

  const handleReject = () => {
    alert('Başvuru reddedildi!');
  };

  return (
    <>
      <Header userType="corporate" />
      <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {application.applicantName} - {application.jobTitle}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Başvuru Tarihi: {application.appliedDate}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm md:text-base bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} /> Reddet
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm md:text-base bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} /> Kabul Et
            </button>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon: Başvuru Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Kişisel Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">{application.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">{application.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">{application.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm md:text-base">Başvuru: {application.appliedDate}</span>
                </div>
              </div>
            </div>

            {/* Deneyim */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Deneyim</h2>
              <div className="space-y-4">
                {application.experience && application.experience.length > 0 ? (
                  application.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">{exp.title || exp.position || 'Pozisyon'}</h3>
                      <p className="text-sm md:text-base text-gray-600 mt-1">{exp.company || exp.employer || 'Şirket'}</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">{exp.period || exp.duration || exp.start_date || 'Tarih'}</p>
                      <p className="text-sm md:text-base text-gray-700 mt-2">{exp.description || exp.desc || ''}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Deneyim bilgisi bulunmuyor.</p>
                )}
              </div>
            </div>

            {/* Eğitim */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Eğitim</h2>
              <div className="space-y-4">
                {application.education && application.education.length > 0 ? (
                  application.education.map((edu: any, index: number) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">{edu.school || edu.institution || 'Okul'}</h3>
                      <p className="text-sm md:text-base text-gray-600 mt-1">{edu.degree || edu.field || 'Bölüm'}</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">{edu.period || edu.duration || edu.graduation_year || 'Tarih'}</p>
                      <p className="text-sm md:text-base text-gray-700 mt-2">{edu.description || edu.desc || ''}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Eğitim bilgisi bulunmuyor.</p>
                )}
              </div>
            </div>

            {/* Hakkında */}
            {application.about && (
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-4">Hakkında</h2>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {application.about}
                </p>
              </div>
            )}
          </div>

          {/* Sağ Kolon: Özet Bilgiler */}
          <div className="space-y-6">
            {/* Yetenekler */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Yetenekler</h2>
              <div className="flex flex-wrap gap-2">
                {application.skills && application.skills.length > 0 ? (
                  application.skills.map((skill: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm"
                    >
                      {typeof skill === 'string' ? skill : skill.name || skill.skill || 'Yetenek'}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Yetenek bilgisi bulunmuyor.</p>
                )}
              </div>
            </div>

            {/* Diller */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Diller</h2>
              <div className="space-y-3">
                {application.languages && application.languages.length > 0 ? (
                  application.languages.map((lang: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm md:text-base text-gray-700">{lang.name || lang.language || 'Dil'}</span>
                        <span className="text-xs md:text-sm text-gray-500">{lang.level || lang.proficiency || 'Seviye'}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${lang.proficiency || 50}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Dil bilgisi bulunmuyor.</p>
                )}
              </div>
            </div>

            {/* Sertifikalar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Sertifikalar</h2>
              <div className="space-y-3">
                {application.certificates && application.certificates.length > 0 ? (
                  application.certificates.map((cert: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-1" />
                      <div>
                        <h3 className="text-sm md:text-base font-medium text-gray-900">{cert.name || cert.title || 'Sertifika'}</h3>
                        <p className="text-xs md:text-sm text-gray-500">{cert.issuer || cert.institution || 'Kurum'} - {cert.date || cert.issued_date || 'Tarih'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Sertifika bilgisi bulunmuyor.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetail;
