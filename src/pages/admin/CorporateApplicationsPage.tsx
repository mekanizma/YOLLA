import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, message, Tag, Select } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { 
  fetchCorporateApplications, 
  updateCorporateApplicationStatus, 
  deleteCorporateApplication,
  CorporateApplicationRecord 
} from '../../lib/corporateApplicationService';

const CorporateApplicationsPage: React.FC = () => {
  const [data, setData] = useState<CorporateApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<CorporateApplicationRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Kurumsal başvurular sayfası veri yükleniyor...');
      const applications = await fetchCorporateApplications();
      console.log('Kurumsal başvurular verisi yüklendi:', applications);
      setData(applications);
    } catch (error) {
      console.error('Kurumsal başvurular sayfası veri yükleme hatası:', error);
      message.error(`Veriler yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCorporateApplication(id);
      message.success('Başvuru başarıyla silindi');
      loadData();
    } catch (error) {
      message.error('Silme işlemi sırasında hata oluştu');
    }
  };

  const handleStatusChange = async (id: number, status: 'pending' | 'in_review' | 'approved' | 'rejected') => {
    try {
      await updateCorporateApplicationStatus(id, status);
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
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'in_review': return 'İnceleniyor';
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const columns = [
    { 
      title: 'Şirket Adı', 
      dataIndex: 'company_name', 
      key: 'company_name'
    },
    { 
      title: 'Ad Soyad', 
      dataIndex: 'full_name', 
      key: 'full_name'
    },
    { 
      title: 'E-posta', 
      dataIndex: 'email', 
      key: 'email'
    },
    { 
      title: 'Telefon', 
      dataIndex: 'phone', 
      key: 'phone'
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
      render: (_: any, record: CorporateApplicationRecord) => (
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
            <Select.Option value="approved">Onaylandı</Select.Option>
            <Select.Option value="rejected">Reddedildi</Select.Option>
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
    (a.company_name && a.company_name.toLowerCase().includes(search.toLowerCase())) ||
    (a.full_name && a.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (a.email && a.email.toLowerCase().includes(search.toLowerCase())) ||
    (a.phone && a.phone.includes(search))
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Kurumsal başvuru ara"
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
        title="Kurumsal Başvuru Detayı"
        width={600}
      >
        {detail && (
          <div>
            <p><b>Şirket Adı:</b> {detail.company_name}</p>
            <p><b>Ad Soyad:</b> {detail.full_name}</p>
            <p><b>E-posta:</b> {detail.email}</p>
            <p><b>Telefon:</b> {detail.phone}</p>
            <p><b>Başvuru Tarihi:</b> {new Date(detail.created_at).toLocaleDateString('tr-TR')}</p>
            <p><b>Durum:</b> <Tag color={getStatusColor(detail.status)}>{getStatusText(detail.status)}</Tag></p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CorporateApplicationsPage;
