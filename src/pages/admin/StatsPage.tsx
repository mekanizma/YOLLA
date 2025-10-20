import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import supabase from '../../lib/supabaseClient';

type AppRow = { id: number; created_at: string; users: { full_name?: string } | null; jobs: { title?: string; company_name?: string | null } | null };

const columns = [
  { title: 'Kullanıcı', dataIndex: 'user', key: 'user' },
  { title: 'Pozisyon', dataIndex: 'job', key: 'job' },
  { title: 'Şirket', dataIndex: 'company', key: 'company' },
  { title: 'Başvuru Tarihi', dataIndex: 'date', key: 'date' },
];

const StatsPage: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: usersCount }, { count: jobsCount }, { count: appsCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true })
      ]);
      setTotalUsers(usersCount || 0);
      setTotalJobs(jobsCount || 0);
      setTotalApplications(appsCount || 0);

      const { data } = await supabase
        .from('applications')
        .select('id,created_at, users(full_name), jobs(title,company_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentApplications(
        (data as AppRow[] | null || []).map(a => ({
          id: a.id,
          user: a.users?.full_name || 'Kullanıcı',
          job: a.jobs?.title || 'İş İlanı',
          company: a.jobs?.company_name || 'Şirket',
          date: new Date(a.created_at).toLocaleDateString('tr-TR')
        }))
      );
    };
    load();
  }, []);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Toplam Kullanıcı" value={totalUsers} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Toplam İlan" value={totalJobs} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Toplam Başvuru" value={totalApplications} />
          </Card>
        </Col>
      </Row>
      <Card title="Son Başvurular">
        <Table rowKey="id" columns={columns} dataSource={recentApplications} pagination={false} />
      </Card>
    </div>
  );
};

export default StatsPage;