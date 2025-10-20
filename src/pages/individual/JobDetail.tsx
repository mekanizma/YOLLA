import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { ArrowLeft, MapPin, Clock, Briefcase } from 'lucide-react';
import { pageSEOContent, updateMetaTags } from '../../lib/utils';
import { fetchJobById } from '../../lib/jobsService';

type UiJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  experience?: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: string;
  logo: string;
  category?: string;
};

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const jobId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const [job, setJob] = useState<UiJob | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (jobId == null) return;
      const data = await fetchJobById(jobId);
      if (!isMounted) return;
      if (!data) {
        setJob(null);
        return;
      }
      const mapped: UiJob = {
        id: data.id,
        title: (data as any).title,
        company: (data as any).company_name || 'Şirket',
        location: (data as any).location,
        type: (data as any).type,
        experience: (data as any).experience_level,
        salary: (data as any).salary ? `${(data as any).salary.min} - ${(data as any).salary.max} ${(data as any).salary.currency}` : '',
        description: (data as any).description,
        requirements: (data as any).skills || [],
        postedDate: new Date((data as any).created_at).toLocaleDateString('tr-TR'),
        logo: (data as any).company_logo || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        category: (data as any).department || ''
      };
      setJob(mapped);
    };
    load();
    return () => { isMounted = false; };
  }, [jobId]);

  useEffect(() => {
    const { title, description, keywords } = pageSEOContent.jobs;
    const pageTitle = job ? `${job.title} | İş Detayı` : title;
    updateMetaTags(
      pageTitle,
      description,
      keywords,
      undefined,
      window.location.href
    );
  }, [job]);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header userType="individual" />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-10">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 mb-6">İlan bulunamadı veya kaldırılmış olabilir.</p>
              <Button onClick={() => navigate('/individual/jobs')}>İlanlara Dön</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType="individual" />
      <main className="flex-1 pt-16">
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/individual/jobs')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} className="mr-2" /> Geri
            </button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={job.logo} alt={`${job.company} logo`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                  <span className="inline-flex items-center"><MapPin size={16} className="mr-1" /> {job.location}</span>
                  <span className="inline-flex items-center"><Clock size={16} className="mr-1" /> {job.postedDate}</span>
                  <span className="inline-flex items-center"><Briefcase size={16} className="mr-1" /> {job.type}</span>
                </div>
              </div>
              <div className="text-primary font-semibold text-base">{job.salary}</div>
            </div>

            <div className="prose max-w-none text-gray-800">
              <p className="mb-4">{job.description}</p>
              <h3 className="font-semibold mb-2">Aranan Nitelikler</h3>
              <ul className="list-disc pl-5">
                {job.requirements.map(req => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="primary">Başvur</Button>
              <Button variant="outline" onClick={() => navigate('/individual/jobs')}>Diğer İlanlar</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;



