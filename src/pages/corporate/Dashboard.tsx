import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusCircle, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  Building
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import supabase from '../../lib/supabaseClient';
import { fetchCompanyByEmail, fetchCorporateJobs } from '../../lib/jobsService';
import { getCorporateApplications } from '../../lib/applicationsService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        // Şirketi mail ile çek
        const company = await fetchCompanyByEmail(user.email || '');
        if (!company) return;
        setCompanyInfo(company);

        // İlanlar ve başvurular
        const [jobs, applications] = await Promise.all([
          fetchCorporateJobs(company.id),
          getCorporateApplications(company.id as number),
        ]);

        const activeCount = jobs.filter((j: any) => j.status === 'published').length;
        const totalApplications = applications.length;
        const pendingApplications = applications.filter((a: any) => a.status === 'pending').length;
        const acceptedApplications = applications.filter((a: any) => a.status === 'accepted').length;

        setStats([
          {
            title: t('dashboard:activeJobs'),
            value: String(activeCount),
            icon: <FileText className="text-primary" />,
            bgColor: 'bg-primary/10',
            change: `${jobs.length} ${t('dashboard:totalJobs')}`,
            changeUp: true,
            onClick: () => navigate('/corporate/jobs'),
          },
          {
            title: t('dashboard:totalApplications'),
            value: String(totalApplications),
            icon: <Users className="text-secondary" />,
            bgColor: 'bg-secondary/10',
            change: `${pendingApplications} ${t('dashboard:pendingApplications')}`,
            changeUp: true,
            onClick: () => navigate('/corporate/applications'),
          },
          {
            title: t('dashboard:pendingApplications'),
            value: String(pendingApplications),
            icon: <Clock className="text-accent" />,
            bgColor: 'bg-accent/10',
            change: t('dashboard:waitingForReview'),
            changeUp: true,
            onClick: () => navigate('/corporate/applications'),
          },
          {
            title: t('dashboard:approvedApplications'),
            value: String(acceptedApplications),
            icon: <TrendingUp className="text-success" />,
            bgColor: 'bg-success/10',
            change: t('dashboard:hiringProcess'),
            changeUp: false,
            onClick: () => navigate('/corporate/applications'),
          },
        ]);

        const recentApps = applications.slice(0, 5).map((app: any) => ({
          id: app.id,
          name: app.users?.full_name || t('dashboard:candidate'),
          position: app.jobs?.title || t('dashboard:position'),
          location: app.users?.location || '-',
          date: new Date(app.created_at).toLocaleDateString('tr-TR'),
        }));
        setRecentApplications(recentApps);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userType="corporate" />
        <Loading text={t('common:dashboardLoading')} />
      </div>
    );
  }

  return (
    <>
      <Header userType="corporate" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('dashboard:welcome')}, {companyInfo?.name || t('dashboard:company')}!</h1>
              <p className="text-sm md:text-base text-white/90">{t('dashboard:corporateDescription')}</p>
            </div>
          </div>
        </section>
          
        <div className="container mx-auto px-4 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow p-4 md:p-6 animate-fadeIn cursor-pointer hover:shadow-lg transition"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={stat.onClick}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2">{stat.value}</h3>
                    <p className={`text-xs flex items-center mt-1 ${stat.changeUp ? 'text-success' : 'text-gray-500'}`}>
                      {stat.changeUp && '↑'} {stat.change}
                    </p>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
            
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg md:text-xl font-semibold">{t('dashboard:recentApplications')}</h2>
                  <Link to="/corporate/applications" className="text-secondary hover:underline text-xs md:text-sm font-medium flex items-center">
                    {t('dashboard:viewAll')}
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div 
                      key={application.id} 
                      className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-sm md:text-base font-semibold">{application.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase size={14} />
                                {application.position}
                              </span>
                              <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                                <MapPin size={14} />
                                {application.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm text-gray-500">
                            {application.date}
                          </span>
                          <Link
                            to={`/corporate/applications/${application.id}`}
                            className="text-xs md:text-sm text-primary hover:text-primary/80 font-medium"
                          >
{t('dashboard:viewDetails')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Profile */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">{t('dashboard:companyProfile')}</h2>
                {companyInfo?.logo && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={companyInfo.logo} 
                      alt={t('dashboard:companyLogo')} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{t('dashboard:companyName')}</p>
                      <p className="text-sm md:text-base font-medium">{companyInfo?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{t('dashboard:email')}</p>
                      <p className="text-sm md:text-base font-medium">{companyInfo?.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{t('dashboard:phone')}</p>
                      <p className="text-sm md:text-base font-medium">{companyInfo?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{t('dashboard:address')}</p>
                      <p className="text-sm md:text-base font-medium">{companyInfo?.address || companyInfo?.location || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{t('dashboard:website')}</p>
                      <p className="text-sm md:text-base font-medium">
                        {companyInfo?.website ? (
                          <a 
                            href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {companyInfo.website}
                          </a>
                        ) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{t('dashboard:industry')}</p>
                      <p className="text-sm md:text-base font-medium">{companyInfo?.industry || '-'}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/corporate/settings')}
                  className="w-full mt-4 text-xs md:text-sm text-primary hover:text-primary/80 font-medium"
                >
{t('dashboard:editProfile')}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">{t('dashboard:quickActions')}</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/corporate/job-post')}
                    className="w-full flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <PlusCircle size={16} /> {t('dashboard:createNewJob')}
                  </button>
                  <button
                    onClick={() => navigate('/corporate/applications')}
                    className="w-full flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <Users size={16} /> {t('dashboard:manageApplications')}
                  </button>
                  <button
                    onClick={() => navigate('/corporate/jobs')}
                    className="w-full flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <FileText size={16} /> {t('dashboard:viewJobs')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;