import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import supabase from '../../lib/supabaseClient';

type UserProfile = { id: number; email: string; first_name?: string; last_name?: string; phone?: string; created_at?: string };

const UsersPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      // auth.users (admin api olmadığı için, users tablosunu baz alıyoruz)
      const { data, error } = await supabase
        .from('users')
        .select('id,email,first_name,last_name,phone,created_at')
        .order('created_at', { ascending: false });
      if (!error) {
        setData(
          (data as UserProfile[]).map(u => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            email: u.email,
            phone: u.phone || '-',
            registered: u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-',
          }))
        );
      }
    };
    load();
  }, []);

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