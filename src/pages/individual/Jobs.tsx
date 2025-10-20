import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ChevronDown, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { jobCategories, cities, experienceLevels, workTypes, updateMetaTags, pageSEOContent } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPublishedJobs } from '../../lib/jobsService';
import { applyToJob } from '../../lib/applicationsService';
import { createNotification } from '../../lib/notificationsService';
import supabase from '../../lib/supabaseClient';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minSalary, setMinSalary] = useState('');
  const [workType, setWorkType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [expandedBenefits, setExpandedBenefits] = useState<number | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || '';
  const initialCity = queryParams.get('city') || '';
  const initialPage = parseInt(queryParams.get('page') || '1');
  const initialJobId = queryParams.get('jobId') || '';

  useEffect(() => {
    // URL'den sayfa numarasını al
    setCurrentPage(initialPage);
    
    // Sayfa SEO meta etiketlerini güncelle
    const { title, description, keywords } = pageSEOContent.jobs;
    updateMetaTags(
      title,
      description,
      keywords,
      undefined,
      `https://www.isbul.com.tr${location.pathname}${location.search}`
    );
  }, [location, initialPage]);

  // Belirli bir ilan ID'si varsa ve işler yüklendiyse, o ilanın bulunduğu sayfaya git
  useEffect(() => {
    if (initialJobId && jobs.length > 0) {
      const jobIndex = jobs.findIndex(job => job.id.toString() === initialJobId);
      if (jobIndex !== -1) {
        const targetPage = Math.floor(jobIndex / jobsPerPage) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
          // URL'yi güncelle
          const newParams = new URLSearchParams(location.search);
          newParams.set('page', targetPage.toString());
          navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
        }
      }
    }
  }, [initialJobId, jobs, currentPage, jobsPerPage, location, navigate]);

  // Kullanıcının mevcut başvurularını yükle
  useEffect(() => {
    const loadUserApplications = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user?.id) {
          const { data: applications } = await supabase
            .from('applications')
            .select('job_id')
            .eq('user_id', auth.user.id);
          
          if (applications) {
            const appliedJobIds = new Set(applications.map(app => app.job_id));
            setAppliedJobs(appliedJobIds);
          }
        }
      } catch (error) {
        console.warn('Başvuru durumu yüklenemedi:', error);
      }
    };
    
    loadUserApplications();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublishedJobs({ search: initialSearchTerm, city: initialCity });
        // UI’nin ihtiyacı olan alanlara dönüştürme (örnek)
        const mapped = data.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.companies?.name || 'Şirket',
          location: j.location,
          type: j.type,
          experience: j.experience_level,
          salary: j.salary ? `${j.salary.min} - ${j.salary.max} ${j.salary.currency}` : '',
          description: j.description,
          requirements: j.skills || [],
          postedDate: new Date(j.created_at).toLocaleDateString('tr-TR'),
          logo: j.companies?.logo || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          category: j.department || '',
          // Ek bilgiler
          companyIndustry: j.companies?.industry || '',
          companyLocation: j.companies?.location || '',
          companyWebsite: j.companies?.website || '',
          companyPhone: j.companies?.phone || '',
          companyEmail: j.companies?.email || '',
          benefits: j.benefits || [],
          applicationDeadline: j.application_deadline,
          isRemote: j.is_remote,
          educationLevel: j.education_level,
          responsibilities: j.responsibilities || '',
        }));
        setJobs(mapped);
      } catch (e: any) {
        setError(e.message || 'Veri alınamadı');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm, initialCity]);

  // Filtrelenmiş iş ilanları
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || (job.category && job.category === selectedCategory);
    const matchesWorkType = workType === '' || job.type === workType;
    return matchesSearch && matchesCategory && matchesWorkType;
  });

  // Belirli bir ilan ID'si varsa o ilanı öne çıkar
  const sortedJobs = initialJobId 
    ? [...filteredJobs].sort((a, b) => {
        if (a.id.toString() === initialJobId) return -1;
        if (b.id.toString() === initialJobId) return 1;
        return 0;
      })
    : filteredJobs;

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, endIndex);

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // URL'yi güncelle
      const newParams = new URLSearchParams(location.search);
      newParams.set('page', page.toString());
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
      
      // Sayfanın üstüne kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama yapıldığında ilk sayfaya dön
    setCurrentPage(1);
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', '1');
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleApply = async (jobId: string) => {
    try {
      // Kullanıcı giriş kontrolü
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.id) {
        alert('Başvuru yapmak için giriş yapmalısınız.');
        navigate('/login/individual');
        return;
      }

      // Zaten başvuru yapılmış mı kontrol et
      if (appliedJobs.has(jobId)) {
        alert('Bu ilana zaten başvuru yaptınız.');
        return;
      }

      // Başvuru işlemi başlatıldığını göster
      setApplyingJobs(prev => new Set(prev).add(jobId));

      // İş bilgilerini al
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        alert('İş ilanı bulunamadı.');
        return;
      }

      // Başvuru yap
      await applyToJob(jobId, auth.user.id, {
        cover_letter: '', // İleride özelleştirilebilir
        resume_url: null,
        answers: null
      });

      // Başvuru yapıldığını işaretle
      setAppliedJobs(prev => new Set(prev).add(jobId));

      // Şirkete bildirim gönder
      try {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('company_id, companies(name)')
          .eq('id', jobId)
          .single();

        if (jobData?.company_id) {
          await createNotification({
            company_id: jobData.company_id,
            title: 'Yeni Başvuru',
            message: `${job.title} pozisyonuna yeni bir başvuru geldi.`,
            type: 'info'
          });
        }
      } catch (notificationError) {
        console.warn('Bildirim gönderilemedi:', notificationError);
      }

      alert('Başvurunuz başarıyla gönderildi!');
      
    } catch (error: any) {
      console.error('Başvuru hatası:', error);
      alert(error.message || 'Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      // Başvuru işlemi tamamlandığını göster
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      
      <main className="flex-1 pt-16">
        {/* Search & Filters Section */}
        <section className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <form onSubmit={handleSearch} className="space-y-4 mb-4">
              {/* Arama çubuğu ve butonu */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Pozisyon, şirket veya anahtar kelime"
                    className="pl-10 pr-3 py-3 w-full rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Search size={20} /> Ara
                </Button>
              </div>
              
              {/* Filtreler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">İş kategorisi</option>
                    {jobCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  >
                    <option value="">Çalışma şekli</option>
                    {workTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>
        </section>
        
        {/* Job Listings */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-gray-600 text-sm">
              {loading ? 'Yükleniyor...' : `${filteredJobs.length} iş ilanı bulundu`}
              {totalPages > 1 && (
                <span className="ml-2 text-gray-500">
                  (Sayfa {currentPage} / {totalPages})
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} arası gösteriliyor
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {error && (
              <div className="text-red-600">{error}</div>
            )}
            {currentJobs.map((job, index) => (
              <div 
                key={job.id} 
                className={`bg-white rounded-xl shadow-sm border p-4 md:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group ${
                  initialJobId && job.id.toString() === initialJobId 
                    ? 'border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4 relative">
                  {initialJobId && job.id.toString() === initialJobId && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg z-10">
                      ⭐ Önerilen İlan
                    </div>
                  )}
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <div>
                        <h3 className="text-lg font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{job.title}</h3>
                        <div className="text-gray-600 mb-2 font-medium">{job.company}</div>
                        
                        {/* Detaylı Bilgiler */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-500 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-blue-500" /> 
                            <span className="font-medium">Konum:</span>
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-green-500" /> 
                            <span className="font-medium">Yayın:</span>
                            <span>{job.postedDate}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 font-semibold">💰 Maaş:</span>
                              <span className="text-green-600 font-semibold">{job.salary}</span>
                            </div>
                          )}
                          {job.category && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Sektör:</span>
                              <span>{job.category}</span>
                            </div>
                          )}
                          {job.companyIndustry && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Şirket Sektörü:</span>
                              <span>{job.companyIndustry}</span>
                            </div>
                          )}
                          {job.applicationDeadline && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-red-600">⏰ Son Başvuru:</span>
                              <span className="text-red-600">{new Date(job.applicationDeadline).toLocaleDateString('tr-TR')}</span>
                            </div>
                          )}
                          {job.educationLevel && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">🎓 Eğitim:</span>
                              <span>{job.educationLevel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* İş Türü ve Deneyim Etiketleri */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors duration-200">
                          📋 {job.type}
                        </span>
                        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors duration-200">
                          👤 {job.experience}
                        </span>
                        {job.location.includes('Uzaktan') && (
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-colors duration-200">
                            🏠 Uzaktan
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* İş Açıklaması */}
                    <div className="mt-3 text-gray-700 text-sm line-clamp-3 mb-3">
                      <span className="font-medium text-gray-600">📝 Açıklama:</span>
                      <div className="mt-1">{job.description}</div>
                    </div>
                    
                    {/* Gereksinimler */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-3 mb-4">
                        <div className="text-gray-600 text-sm font-medium mb-2">🔧 Gereksinimler:</div>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 4).map((req, index) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors duration-200">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 4 && (
                            <span className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                              +{job.requirements.length - 4} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Yan Haklar */}
                    {job.benefits && job.benefits.length > 0 && (
                      <div className="mt-3 mb-4">
                        <div className="text-gray-600 text-sm font-medium mb-2">🎁 Yan Haklar:</div>
                        <div className="flex flex-wrap gap-2">
                          {expandedBenefits === job.id 
                            ? job.benefits.map((benefit, index) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition-colors duration-200">
                                  {benefit}
                                </span>
                              ))
                            : (
                              <>
                                {job.benefits.slice(0, 3).map((benefit, index) => (
                                  <span key={index} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition-colors duration-200">
                                    {benefit}
                                  </span>
                                ))}
                                {job.benefits.length > 3 && (
                                  <span 
                                    className="inline-block bg-green-200 text-green-600 px-2 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-green-300 transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedBenefits(expandedBenefits === job.id ? null : job.id);
                                    }}
                                  >
                                    +{job.benefits.length - 3} daha
                                  </span>
                                )}
                              </>
                            )
                          }
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-sm mb-4">
                      <span className="text-gray-500">Uyumluluk:</span>
                      <span className="flex items-center">
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-gray-300" size={16} />
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      {appliedJobs.has(job.id) ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled
                          className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                        >
                          <span>✓ Başvuru Yapıldı</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(job.id);
                          }}
                          disabled={applyingJobs.has(job.id)}
                          className="flex items-center gap-1 hover:bg-blue-600 transition-colors duration-200"
                        >
                          {applyingJobs.has(job.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Başvuru Yapılıyor...</span>
                            </>
                          ) : (
                            <span>Başvur</span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2">
                {/* Önceki Sayfa */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2"
                >
                  <ChevronLeft size={16} />
                  Önceki
                </Button>
                
                {/* Sayfa Numaraları */}
                <div className="flex items-center gap-1">
                  {/* İlk sayfa */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 min-w-[40px]"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </>
                  )}
                  
                  {/* Mevcut sayfa etrafındaki sayfalar */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const pageNum = startPage + i;
                    
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 min-w-[40px] ${
                          pageNum === currentPage 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {/* Son sayfa */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2 min-w-[40px]"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Sonraki Sayfa */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2"
                >
                  Sonraki
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;