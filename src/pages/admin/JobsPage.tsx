import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Tag, Select, message } from 'antd';
import { SearchOutlined, EditOutlined, StopOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { fetchAdminJobs, updateJobStatus, updateJobDetails, AdminJobRecord, testSupabaseConnection, checkTableStructure } from '../../lib/adminService';

const JobsPage: React.FC = () => {
  const [data, setData] = useState<AdminJobRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminJobRecord | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: AdminJobRecord) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      company_name: record.company_name,
      status: record.status
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateJobDetails(editing.id, values);
        message.success('İş ilanı başarıyla güncellendi');
        loadData();
        setModalOpen(false);
      }
    } catch (error) {
      message.error('Güncelleme sırasında hata oluştu');
    }
  };

  const handleStatusChange = async (id: string, status: 'published' | 'draft' | 'closed') => {
    try {
      await updateJobStatus(id, status);
      message.success('İş ilanı durumu başarıyla güncellendi');
      loadData();
    } catch (error) {
      message.error('Durum güncelleme sırasında hata oluştu');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Jobs sayfası veri yükleniyor...');
      
      // Önce bağlantıyı test et
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        message.error(`Supabase bağlantı hatası: ${connectionTest.error}`);
        return;
      }
      
      // Tablo yapısını kontrol et
      await checkTableStructure();
      
      const jobs = await fetchAdminJobs();
      console.log('Jobs verisi yüklendi:', jobs);
      setData(jobs);
    } catch (error) {
      console.error('Jobs sayfası veri yükleme hatası:', error);
      message.error(`Veriler yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'orange';
      case 'closed': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Yayında';
      case 'draft': return 'Taslak';
      case 'closed': return 'Kapalı';
      default: return status;
    }
  };

  const columns = [
    { title: 'Pozisyon', dataIndex: 'title', key: 'title' },
    { title: 'Şirket', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Lokasyon', dataIndex: 'location', key: 'location' },
    { title: 'Tip', dataIndex: 'type', key: 'type' },
    { title: 'Deneyim', dataIndex: 'experience_level', key: 'experience_level' },
    { title: 'Başvuru', dataIndex: 'applications', key: 'applications' },
    { title: 'Görüntülenme', dataIndex: 'views', key: 'views' },
    { title: 'Yayın Tarihi', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString('tr-TR') },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      render: (_: any, record: AdminJobRecord) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.status === 'published' && (
            <Button 
              icon={<StopOutlined />} 
              danger 
              onClick={() => handleStatusChange(record.id, 'closed')}
            >
              Kapat
            </Button>
          )}
          {record.status === 'draft' && (
            <Button 
              icon={<PlayCircleOutlined />} 
              type="primary"
              onClick={() => handleStatusChange(record.id, 'published')}
            >
              Yayınla
            </Button>
          )}
          {record.status === 'closed' && (
            <Button 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleStatusChange(record.id, 'published')}
            >
              Yeniden Aç
            </Button>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    (j.company_name && j.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="İş ara"
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
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        onOk={handleOk} 
        title="İlan Düzenle"
        okText="Güncelle"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Pozisyon" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company_name" label="Şirket" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Durum" rules={[{ required: true }]}> 
            <Select>
              <Select.Option value="published">Yayında</Select.Option>
              <Select.Option value="draft">Taslak</Select.Option>
              <Select.Option value="closed">Kapalı</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobsPage; 