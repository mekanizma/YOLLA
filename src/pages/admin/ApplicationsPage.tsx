import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, message, Tag, Select } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { fetchAdminApplications, deleteApplication, updateApplicationStatus, AdminApplicationRecord } from '../../lib/adminService';

const ApplicationsPage: React.FC = () => {
  const [data, setData] = useState<AdminApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<AdminApplicationRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Applications sayfası veri yükleniyor...');
      const applications = await fetchAdminApplications();
      console.log('Applications verisi yüklendi:', applications);
      setData(applications);
    } catch (error) {
      console.error('Applications sayfası veri yükleme hatası:', error);
      message.error(`Veriler yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteApplication(id);
      message.success('Başvuru başarıyla silindi');
      loadData();
    } catch (error) {
      message.error('Silme işlemi sırasında hata oluştu');
    }
  };

  const handleStatusChange = async (id: number, status: 'pending' | 'in_review' | 'accepted' | 'rejected' | 'approved') => {
    try {
      await updateApplicationStatus(id, status);
      message.success('Başvuru durumu başarıyla güncellendi');
      loadData();
    } catch (error) {
      message.error('Durum güncelleme sırasında hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'in_review': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'approved': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'in_review': return 'İnceleniyor';
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': return 'Reddedildi';
      case 'approved': return 'Onaylandı';
      default: return status;
    }
  };

  const columns = [
    { 
      title: 'Kullanıcı', 
      dataIndex: 'users', 
      key: 'user',
      render: (users: any) => users?.full_name || 'Bilinmeyen Kullanıcı'
    },
    { 
      title: 'E-posta', 
      dataIndex: 'users', 
      key: 'email',
      render: (users: any) => users?.email || '-'
    },
    { 
      title: 'Pozisyon', 
      dataIndex: 'jobs', 
      key: 'job',
      render: (jobs: any) => jobs?.title || 'Bilinmeyen İş'
    },
    { 
      title: 'Şirket', 
      dataIndex: 'jobs', 
      key: 'company',
      render: (jobs: any) => jobs?.company_name || 'Bilinmeyen Şirket'
    },
    { 
      title: 'Başvuru Tarihi', 
      dataIndex: 'created_at', 
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      render: (_: any, record: AdminApplicationRecord) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setDetail(record)} />
          <Select
            value={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 120 }}
            size="small"
          >
            <Select.Option value="pending">Beklemede</Select.Option>
            <Select.Option value="in_review">İnceleniyor</Select.Option>
            <Select.Option value="accepted">Kabul Edildi</Select.Option>
            <Select.Option value="rejected">Reddedildi</Select.Option>
            <Select.Option value="approved">Onaylandı</Select.Option>
          </Select>
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter(a => 
    (a.users?.full_name && a.users.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (a.users?.email && a.users.email.toLowerCase().includes(search.toLowerCase())) ||
    (a.jobs?.title && a.jobs.title.toLowerCase().includes(search.toLowerCase())) ||
    (a.jobs?.company_name && a.jobs.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Başvuru ara"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
      </Space>
      <Table 
        rowKey="id" 
        columns={columns} 
        dataSource={filtered} 
        loading={loading}
        pagination={{ pageSize: 10 }} 
      />
      <Modal 
        open={!!detail} 
        onCancel={() => setDetail(null)} 
        footer={null} 
        title="Başvuru Detayı"
        width={600}
      >
        {detail && (
          <div>
            <p><b>Kullanıcı:</b> {detail.users?.full_name || 'Bilinmeyen Kullanıcı'}</p>
            <p><b>E-posta:</b> {detail.users?.email || '-'}</p>
            <p><b>Telefon:</b> {detail.users?.phone || '-'}</p>
            <p><b>Lokasyon:</b> {detail.users?.location || '-'}</p>
            <p><b>Pozisyon:</b> {detail.jobs?.title || 'Bilinmeyen İş'}</p>
            <p><b>Şirket:</b> {detail.jobs?.company_name || 'Bilinmeyen Şirket'}</p>
            <p><b>Başvuru Tarihi:</b> {new Date(detail.created_at).toLocaleDateString('tr-TR')}</p>
            <p><b>Durum:</b> <Tag color={getStatusColor(detail.status)}>{getStatusText(detail.status)}</Tag></p>
            {detail.cover_letter && (
              <div>
                <p><b>Ön Yazı:</b></p>
                <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {detail.cover_letter}
                </p>
              </div>
            )}
            {detail.resume_url && (
              <p><b>CV:</b> <a href={detail.resume_url} target="_blank" rel="noopener noreferrer">CV'yi Görüntüle</a></p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsPage; 