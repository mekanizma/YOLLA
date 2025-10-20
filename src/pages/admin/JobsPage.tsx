import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Tag, Select } from 'antd';
import { SearchOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import supabase from '../../lib/supabaseClient';

type Row = { id: number; title: string; company_name: string | null; status: 'published' | 'draft' | 'closed'; created_at: string };

const JobsPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };
  const handleOk = () => {
    form.validateFields().then(values => {
      // Basit UI güncellemesi; backend'e update yok (isteğe göre eklenir)
      setData(data.map(j => j.id === editing.id ? { ...editing, ...values } : j));
      setModalOpen(false);
    });
  };
  const handlePassive = (id: number) => {
    // UI üzerinde pasifleştir; backend update'i eklenebilir
    setData(data.map(j => j.id === id ? { ...j, status: 'Pasif' } : j));
  };

  const columns = [
    { title: 'Pozisyon', dataIndex: 'title', key: 'title' },
    { title: 'Şirket', dataIndex: 'company', key: 'company' },
    { title: 'Yayın Tarihi', dataIndex: 'posted', key: 'posted' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'Aktif' ? 'green' : 'red'}>{status}</Tag>,
    },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.status === 'Aktif' && <Button icon={<StopOutlined />} danger onClick={() => handlePassive(record.id)}>Pasifleştir</Button>}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id,title,company_name,status,created_at')
        .order('created_at', { ascending: false });
      if (!error) {
        setData(
          (data as Row[]).map(j => ({
            id: j.id,
            title: j.title,
            company: j.company_name || 'Şirket',
            status: j.status === 'published' ? 'Aktif' : 'Pasif',
            posted: new Date(j.created_at).toLocaleDateString('tr-TR')
          }))
        );
      }
    };
    load();
  }, []);

  const filtered = data.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

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
      <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} />
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleOk} title="İlan Düzenle">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Pozisyon" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Şirket" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Durum" rules={[{ required: true }]}> 
            <Select>
              <Select.Option value="Aktif">Aktif</Select.Option>
              <Select.Option value="Pasif">Pasif</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobsPage; 