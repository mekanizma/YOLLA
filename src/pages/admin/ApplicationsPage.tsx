import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import supabase from '../../lib/supabaseClient';

type Row = { id: number; created_at: string; users: { full_name?: string } | null; jobs: { title?: string; company_name?: string | null } | null };

const ApplicationsPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const handleDelete = (id: number) => {
    setData(data.filter(a => a.id !== id));
  };

  const columns = [
    { title: 'Kullanıcı', dataIndex: 'user', key: 'user' },
    { title: 'Pozisyon', dataIndex: 'job', key: 'job' },
    { title: 'Şirket', dataIndex: 'company', key: 'company' },
    { title: 'Başvuru Tarihi', dataIndex: 'date', key: 'date' },
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

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id,created_at, users(full_name), jobs(title,company_name)')
        .order('created_at', { ascending: false });
      if (!error) {
        setData(
          (data as Row[]).map(r => ({
            id: r.id,
            user: r.users?.full_name || 'Kullanıcı',
            job: r.jobs?.title || 'İş İlanı',
            company: r.jobs?.company_name || 'Şirket',
            date: new Date(r.created_at).toLocaleDateString('tr-TR')
          }))
        );
      }
    };
    load();
  }, []);

  const filtered = data.filter(a => a.user.toLowerCase().includes(search.toLowerCase()) || a.job.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase()));

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
      <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} />
      <Modal open={!!detail} onCancel={() => setDetail(null)} footer={null} title="Başvuru Detayı">
        {detail && (
          <div>
            <p><b>Kullanıcı:</b> {detail.user}</p>
            <p><b>Pozisyon:</b> {detail.job}</p>
            <p><b>Şirket:</b> {detail.company}</p>
            <p><b>Başvuru Tarihi:</b> {detail.date}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsPage; 