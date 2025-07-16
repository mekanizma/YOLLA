import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const mockApplications = [
  { id: 1, user: 'Ahmet Yılmaz', job: 'Frontend Geliştirici', company: 'ABC Teknoloji', date: '2023-04-10' },
  { id: 2, user: 'Zeynep Kaya', job: 'Backend Developer', company: 'XYZ Yazılım', date: '2023-04-12' },
];

const ApplicationsPage: React.FC = () => {
  const [data, setData] = useState(mockApplications);
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