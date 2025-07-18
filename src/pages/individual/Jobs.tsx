import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ChevronDown, Star, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { jobCategories, cities, experienceLevels, workTypes, updateMetaTags, pageSEOContent } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minSalary, setMinSalary] = useState('');
  const [workType, setWorkType] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || '';
  const initialCity = queryParams.get('city') || '';

  useEffect(() => {
    // Sayfa SEO meta etiketlerini güncelle
    const { title, description, keywords } = pageSEOContent.jobs;
    updateMetaTags(
      title,
      description,
      keywords,
      undefined,
      `https://www.isbul.com.tr${location.pathname}${location.search}`
    );
  }, [location]);
  
  // Mock job listings data
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Geliştirici',
      company: 'TechSoft A.Ş.',
      location: 'İstanbul',
      type: 'Tam Zamanlı',
      experience: '5+ yıl',
      salary: '25.000₺ - 45.000₺',
      description: 'Modern web teknolojileri ile çalışacak deneyimli frontend geliştirici arıyoruz.',
      requirements: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      postedDate: '2 gün önce',
      logo: 'https://images.pexels.com/photos/15144262/pexels-photo-15144262.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      category: 'Bilgi Teknolojileri',
    },
    {
      id: 2,
      title: 'Backend Geliştirici',
      company: 'Dijital Vizyon',
      location: 'İstanbul (Uzaktan)',
      type: 'Tam Zamanlı',
      experience: '3-5 yıl',
      salary: '20.000₺ - 35.000₺',
      description: 'Node.js ve PostgreSQL deneyimi olan backend geliştirici arayışımız bulunmaktadır.',
      requirements: ['Node.js', 'PostgreSQL', 'Express', 'Docker'],
      postedDate: '1 gün önce',
      logo: 'https://images.pexels.com/photos/11288118/pexels-photo-11288118.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      category: 'Bilgi Teknolojileri',
    },
    {
      id: 3,
      title: 'UI/UX Tasarımcı',
      company: 'Kreatif Ajans',
      location: 'Ankara',
      type: 'Tam Zamanlı',
      experience: '2-3 yıl',
      salary: '15.000₺ - 25.000₺',
      description: 'Kullanıcı deneyimi odaklı web ve mobil uygulama tasarımları yapacak tasarımcı arıyoruz.',
      requirements: ['Figma', 'Adobe XD', 'Sketch', 'UI/UX Principles'],
      postedDate: '3 gün önce',
      logo: 'https://images.pexels.com/photos/3585088/pexels-photo-3585088.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      category: 'Tasarım',
    },
  ];

  // Filtrelenmiş iş ilanları
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || (job.category && job.category === selectedCategory);
    const matchesWorkType = workType === '' || job.type === workType;
    return matchesSearch && matchesCategory && matchesWorkType;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
  };

  const handleApply = (jobId: number) => {
    // İleride Supabase ile başvuru yapılacak
    alert('Başvurunuz alındı! (Mock)');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      
      <main className="flex-1 pt-16">
        {/* Search & Filters Section */}
        <section className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Pozisyon, şirket veya anahtar kelime"
                    className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50"
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
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                >
                  <option value="">Çalışma şekli</option>
                  {workTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1 flex items-center md:justify-end w-full">
                <Button type="submit" className="px-6 py-2 text-base font-semibold w-full md:w-auto">
                  <Search size={18} className="mr-2" /> Ara
                </Button>
              </div>
            </form>
          </div>
        </section>
        
        {/* Job Listings */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-4 text-gray-600 text-sm">{filteredJobs.length} iş ilanı bulundu</div>
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{job.title}</h3>
                        <div className="text-gray-600 mb-1">{job.company}</div>
                        <div className="flex flex-wrap gap-3 text-gray-500 text-sm mb-1">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {job.postedDate}</span>
                          <span className="flex items-center gap-1">{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{job.type}</span>
                        {job.location.includes('Uzaktan') && (
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Uzaktan</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-gray-700 text-sm line-clamp-2">{job.description}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.requirements.map((req) => (
                        <span key={req} className="inline-block bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">{req}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Uyumluluk:</span>
                      <span className="flex items-center">
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <Star className="text-gray-300" size={16} />
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/individual/jobs/${job.id}`)}
                        className="flex items-center gap-1"
                      >
                        <span>Görüntüle</span>
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleApply(job.id)}
                        className="flex items-center gap-1"
                      >
                        <span>Başvur</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;