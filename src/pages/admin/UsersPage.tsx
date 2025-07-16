import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const mockUsers = [
  { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@email.com', phone: '555-1234', registered: '2023-01-10' },
  { id: 2, name: 'Zeynep Kaya', email: 'zeynep@email.com', phone: '555-5678', registered: '2023-02-15' },
  { id: 3, name: 'Mehmet Demir', email: 'mehmet@email.com', phone: '555-8765', registered: '2023-03-20' },
];

const UsersPage: React.FC = () => {
  const [data, setData] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const handleDelete = (id: number) => {
    setData(data.filter(u => u.id !== id));
  };

  const columns = [
    { title: 'Ad Soyad', dataIndex: 'name', key: 'name' },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
    { title: 'Kayıt Tarihi', dataIndex: 'registered', key: 'registered' },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setDetail(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const filtered = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Kullanıcı ara"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
      </Space>
      <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} />
      <Modal open={!!detail} onCancel={() => setDetail(null)} footer={null} title="Kullanıcı Detayı">
        {detail && (
          <div>
            <p><b>Ad Soyad:</b> {detail.name}</p>
            <p><b>E-posta:</b> {detail.email}</p>
            <p><b>Telefon:</b> {detail.phone}</p>
            <p><b>Kayıt Tarihi:</b> {detail.registered}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage; 