import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Tag, Select } from 'antd';
import { SearchOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';

const mockJobs = [
  { id: 1, title: 'Frontend Geliştirici', company: 'ABC Teknoloji', status: 'Aktif', posted: '2023-04-01' },
  { id: 2, title: 'Backend Developer', company: 'XYZ Yazılım', status: 'Pasif', posted: '2023-03-15' },
];

const JobsPage: React.FC = () => {
  const [data, setData] = useState(mockJobs);
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
      setData(data.map(j => j.id === editing.id ? { ...editing, ...values } : j));
      setModalOpen(false);
    });
  };
  const handlePassive = (id: number) => {
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