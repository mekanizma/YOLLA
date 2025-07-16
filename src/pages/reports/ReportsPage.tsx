import React, { useMemo, useState } from 'react';
import { Card, Table, Row, Col, Select, DatePicker, Space, Tag, Button } from 'antd';
import { Pie, Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';

// MOCK DATA
const jobPosts = [
  { id: 1, title: 'Frontend Developer', companyName: 'ABC Teknoloji' },
  { id: 2, title: 'Backend Developer', companyName: 'XYZ Yazılım' },
  { id: 3, title: 'UI/UX Designer', companyName: 'ABC Teknoloji' },
];
const applications = [
  { jobPostId: 1, userId: 101, status: 'approved', createdAt: '2024-06-01' },
  { jobPostId: 1, userId: 102, status: 'pending', createdAt: '2024-06-02' },
  { jobPostId: 1, userId: 103, status: 'rejected', createdAt: '2024-06-03' },
  { jobPostId: 2, userId: 104, status: 'approved', createdAt: '2024-06-01' },
  { jobPostId: 2, userId: 105, status: 'approved', createdAt: '2024-06-02' },
  { jobPostId: 2, userId: 106, status: 'pending', createdAt: '2024-06-03' },
  { jobPostId: 3, userId: 107, status: 'rejected', createdAt: '2024-06-01' },
  { jobPostId: 3, userId: 108, status: 'approved', createdAt: '2024-06-02' },
];

const statusColors: Record<string, string> = {
  approved: 'green',
  pending: 'blue',
  rejected: 'red',
};

const statusLabels: Record<string, string> = {
  approved: 'Onaylandı',
  pending: 'Beklemede',
  rejected: 'Reddedildi',
};

const ReportsPage: React.FC = () => {
  // Filtreler
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [company, setCompany] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Filtrelenmiş başvurular
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const job = jobPosts.find(j => j.id === app.jobPostId);
      if (company && job?.companyName !== company) return false;
      if (status && app.status !== status) return false;
      if (dateRange) {
        const appDate = dayjs(app.createdAt);
        if (appDate.isBefore(dateRange[0], 'day') || appDate.isAfter(dateRange[1], 'day')) return false;
      }
      return true;
    });
  }, [company, status, dateRange]);

  // 1. Her iş ilanı için toplam başvuru sayısı
  const jobApplicationCounts = useMemo(() => {
    return jobPosts.map(job => ({
      ...job,
      total: filteredApplications.filter(a => a.jobPostId === job.id).length,
    }));
  }, [filteredApplications]);

  // 2. Her iş ilanı için onaylanan başvuru sayısı
  const jobApprovedCounts = useMemo(() => {
    return jobPosts.map(job => ({
      ...job,
      approved: filteredApplications.filter(a => a.jobPostId === job.id && a.status === 'approved').length,
    }));
  }, [filteredApplications]);

  // 3. Tarihe göre başvuruların zaman çizelgesi
  const timelineData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredApplications.forEach(a => {
      grouped[a.createdAt] = (grouped[a.createdAt] || 0) + 1;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }, [filteredApplications]);

  // 4. İşveren bazlı başvuru raporu
  const companyApplicationCounts = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredApplications.forEach(a => {
      const job = jobPosts.find(j => j.id === a.jobPostId);
      if (job) grouped[job.companyName] = (grouped[job.companyName] || 0) + 1;
    });
    return Object.entries(grouped).map(([company, count]) => ({ company, count }));
  }, [filteredApplications]);

  // 5. Onaylanmış - Reddedilmiş başvuru oranı
  const statusPieData = useMemo(() => {
    const grouped: Record<string, number> = { approved: 0, rejected: 0 };
    filteredApplications.forEach(a => {
      if (a.status === 'approved') grouped.approved++;
      if (a.status === 'rejected') grouped.rejected++;
    });
    return [
      { type: 'Onaylandı', value: grouped.approved },
      { type: 'Reddedildi', value: grouped.rejected },
    ];
  }, [filteredApplications]);

  // Şirketler listesi
  const companyOptions = Array.from(new Set(jobPosts.map(j => j.companyName)));

  // Excel'e Aktar fonksiyonu
  const handleExportExcel = () => {
    if (!company) return;
    // Şirket bazlı başvuru verisi
    const rows = filteredApplications
      .filter(a => {
        const job = jobPosts.find(j => j.id === a.jobPostId);
        return job && job.companyName === company;
      })
      .map(a => {
        const job = jobPosts.find(j => j.id === a.jobPostId);
        return {
          'İlan': job?.title,
          'Şirket': job?.companyName,
          'Kullanıcı ID': a.userId,
          'Durum': statusLabels[a.status],
          'Başvuru Tarihi': a.createdAt,
        };
      });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Başvurular');
    XLSX.writeFile(wb, `BasvuruRaporu_${company}.xlsx`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <DatePicker.RangePicker
            onChange={v => setDateRange(v as [Dayjs, Dayjs] | null)}
            allowClear
            style={{ minWidth: 220 }}
          />
          <Select
            allowClear
            placeholder="Şirket seç"
            style={{ minWidth: 160 }}
            options={companyOptions.map(c => ({ value: c, label: c }))}
            onChange={setCompany}
            value={company}
          />
          <Select
            allowClear
            placeholder="Başvuru durumu"
            style={{ minWidth: 160 }}
            options={[
              { value: 'approved', label: 'Onaylandı' },
              { value: 'pending', label: 'Beklemede' },
              { value: 'rejected', label: 'Reddedildi' },
            ]}
            onChange={setStatus}
            value={status}
          />
        </Space>
      </Card>
      <Row gutter={24}>
        <Col xs={24} md={12} lg={8}>
          <Card title="İlan Bazlı Başvuru Sayısı" size="small" style={{ marginBottom: 24 }}>
            <Table
              size="small"
              dataSource={jobApplicationCounts}
              columns={[
                { title: 'İlan', dataIndex: 'title', key: 'title' },
                { title: 'Şirket', dataIndex: 'companyName', key: 'companyName' },
                { title: 'Toplam Başvuru', dataIndex: 'total', key: 'total' },
              ]}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Onaylanan Başvuru Sayısı" size="small" style={{ marginBottom: 24 }}>
            <Table
              size="small"
              dataSource={jobApprovedCounts}
              columns={[
                { title: 'İlan', dataIndex: 'title', key: 'title' },
                { title: 'Şirket', dataIndex: 'companyName', key: 'companyName' },
                { title: 'Onaylanan', dataIndex: 'approved', key: 'approved' },
              ]}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={24} lg={8}>
          <Card title="Onaylanmış/Reddedilmiş Oran" size="small" style={{ marginBottom: 24 }}>
            <Pie
              data={statusPieData}
              angleField="value"
              colorField="type"
              radius={0.9}
              legend={{ position: 'bottom' }}
              label={{ type: 'spider', style: { fontSize: 14 } }}
              height={220}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card title="Başvuru Zaman Çizelgesi" size="small" style={{ marginBottom: 24 }}>
            <Line
              data={timelineData}
              xField="date"
              yField="count"
              point={{ size: 4 }}
              smooth
              height={220}
              xAxis={{ title: { text: 'Tarih' } }}
              yAxis={{ title: { text: 'Başvuru' } }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<span>Şirket Bazlı Başvuru {company && <Button size="small" type="primary" style={{ float: 'right' }} onClick={handleExportExcel} disabled={!company}>Excel'e Aktar</Button>}</span>} size="small" style={{ marginBottom: 24 }}>
            <Table
              size="small"
              dataSource={companyApplicationCounts}
              columns={[
                { title: 'Şirket', dataIndex: 'company', key: 'company' },
                { title: 'Başvuru', dataIndex: 'count', key: 'count' },
              ]}
              rowKey="company"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage; 