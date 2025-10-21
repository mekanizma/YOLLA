import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Row, Col, Select, DatePicker, Space, Tag, Button, Statistic, message } from 'antd';
import { Pie, Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';
import { fetchAdminStats, fetchFilteredApplications, AdminStatsData } from '../../lib/adminService';

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(false);

  const statusColors: Record<string, string> = {
    approved: 'green',
    pending: 'blue',
    rejected: 'red',
    in_review: 'orange',
    accepted: 'green',
  };

  const statusLabels: Record<string, string> = {
    approved: 'Onaylandı',
    pending: 'Beklemede',
    rejected: 'Reddedildi',
    in_review: 'İnceleniyor',
    accepted: 'Kabul Edildi',
  };

  // Filtreler
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [company, setCompany] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const loadStats = async () => {
    setLoading(true);
    try {
      console.log('Reports sayfası veri yükleniyor...');
      const statsData = await fetchAdminStats();
      console.log('Reports verisi yüklendi:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Reports sayfası veri yükleme hatası:', error);
      message.error(`İstatistikler yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);
  // Filtrelenmiş başvurular
  const filteredApplications = useMemo(async () => {
    if (!stats) return [];
    
    const filters: any = {};
    if (dateRange) {
      filters.dateRange = {
        start: dateRange[0].startOf('day').toISOString(),
        end: dateRange[1].endOf('day').toISOString()
      };
    }
    if (company) filters.company = company;
    if (status) filters.status = status;
    
    try {
      return await fetchFilteredApplications(filters);
    } catch (error) {
      message.error('Filtrelenmiş veriler yüklenirken hata oluştu');
      return [];
    }
  }, [company, status, dateRange, stats]);

  // Şirketler listesi
  const companyOptions = stats ? Array.from(new Set(stats.topCompanies.map(c => c.company_name))) : [];

  // Excel'e Aktar fonksiyonu
  const handleExportExcel = async () => {
    if (!company || !stats) return;
    
    try {
      const filters: any = { company };
      if (dateRange) {
        filters.dateRange = {
          start: dateRange[0].startOf('day').toISOString(),
          end: dateRange[1].endOf('day').toISOString()
        };
      }
      if (status) filters.status = status;
      
      const filteredData = await fetchFilteredApplications(filters);
      
      const rows = filteredData.map(a => ({
        'İlan': a.jobs?.title || 'Bilinmeyen İş',
        'Şirket': a.jobs?.company_name || 'Bilinmeyen Şirket',
        'Kullanıcı': a.users?.full_name || 'Bilinmeyen Kullanıcı',
        'E-posta': a.users?.email || '-',
        'Durum': statusLabels[a.status],
        'Başvuru Tarihi': new Date(a.created_at).toLocaleDateString('tr-TR'),
      }));
      
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Başvurular');
      XLSX.writeFile(wb, `BasvuruRaporu_${company}.xlsx`);
      message.success('Excel dosyası başarıyla oluşturuldu');
    } catch (error) {
      message.error('Excel dosyası oluşturulurken hata oluştu');
    }
  };

  if (!stats) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Genel İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Toplam İş İlanı" value={stats.totalJobs} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Toplam Başvuru" value={stats.totalApplications} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Toplam Kullanıcı" value={stats.totalUsers} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Toplam Şirket" value={stats.totalCompanies} />
          </Card>
        </Col>
      </Row>

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
              { value: 'in_review', label: 'İnceleniyor' },
              { value: 'accepted', label: 'Kabul Edildi' },
            ]}
            onChange={setStatus}
            value={status}
          />
        </Space>
      </Card>
      <Row gutter={24}>
        <Col xs={24} md={12} lg={8}>
          <Card title="İş İlanı Durumları" size="small" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{stats.publishedJobs}</div>
                <div>Yayında</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>{stats.draftJobs}</div>
                <div>Taslak</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>{stats.closedJobs}</div>
                <div>Kapalı</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Başvuru Durumları" size="small" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>{stats.pendingApplications}</div>
                <div>Beklemede</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{stats.approvedApplications}</div>
                <div>Onaylandı</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>{stats.rejectedApplications}</div>
                <div>Reddedildi</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={24} lg={8}>
          <Card title="Başvuru Durumu Dağılımı" size="small" style={{ marginBottom: 24 }}>
            <Pie
              data={[
                { type: 'Onaylandı', value: stats.approvedApplications },
                { type: 'Reddedildi', value: stats.rejectedApplications },
                { type: 'Beklemede', value: stats.pendingApplications },
              ].filter(item => item.value > 0)}
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
          <Card title="Aylık İstatistikler" size="small" style={{ marginBottom: 24 }}>
            <Line
              data={stats.monthlyStats}
              xField="month"
              yField="applications"
              point={{ size: 4 }}
              smooth
              height={220}
              xAxis={{ title: { text: 'Ay' } }}
              yAxis={{ title: { text: 'Başvuru' } }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<span>Şirket Bazlı Başvuru {company && <Button size="small" type="primary" style={{ float: 'right' }} onClick={handleExportExcel} disabled={!company}>Excel'e Aktar</Button>}</span>} size="small" style={{ marginBottom: 24 }}>
            <Table
              size="small"
              dataSource={stats.topCompanies}
              columns={[
                { title: 'Şirket', dataIndex: 'company_name', key: 'company_name' },
                { title: 'İlan Sayısı', dataIndex: 'job_count', key: 'job_count' },
                { title: 'Başvuru Sayısı', dataIndex: 'application_count', key: 'application_count' },
              ]}
              rowKey="company_name"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col xs={24}>
          <Card title="Son Başvurular" size="small">
            <Table
              size="small"
              dataSource={stats.recentApplications}
              columns={[
                { title: 'Kullanıcı', dataIndex: 'users', key: 'user', render: (users: any) => users?.full_name || 'Bilinmeyen' },
                { title: 'E-posta', dataIndex: 'users', key: 'email', render: (users: any) => users?.email || '-' },
                { title: 'İş İlanı', dataIndex: 'jobs', key: 'job', render: (jobs: any) => jobs?.title || 'Bilinmeyen' },
                { title: 'Şirket', dataIndex: 'jobs', key: 'company', render: (jobs: any) => jobs?.company_name || 'Bilinmeyen' },
                { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag> },
                { title: 'Tarih', dataIndex: 'created_at', key: 'date', render: (date: string) => new Date(date).toLocaleDateString('tr-TR') },
              ]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage; 