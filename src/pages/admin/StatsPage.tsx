import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';

const stats = [
  { title: 'Toplam Kullanıcı', value: 1240 },
  { title: 'Toplam İlan', value: 320 },
  { title: 'Toplam Başvuru', value: 980 },
];

const recentApplications = [
  { id: 1, user: 'Ahmet Yılmaz', job: 'Frontend Geliştirici', company: 'ABC Teknoloji', date: '2023-04-10' },
  { id: 2, user: 'Zeynep Kaya', job: 'Backend Developer', company: 'XYZ Yazılım', date: '2023-04-12' },
];

const columns = [
  { title: 'Kullanıcı', dataIndex: 'user', key: 'user' },
  { title: 'Pozisyon', dataIndex: 'job', key: 'job' },
  { title: 'Şirket', dataIndex: 'company', key: 'company' },
  { title: 'Başvuru Tarihi', dataIndex: 'date', key: 'date' },
];

const StatsPage: React.FC = () => (
  <div>
    <Row gutter={16} style={{ marginBottom: 24 }}>
      {stats.map(stat => (
        <Col xs={24} sm={12} md={8} key={stat.title}>
          <Card>
            <Statistic title={stat.title} value={stat.value} />
          </Card>
        </Col>
      ))}
    </Row>
    <Card title="Son Başvurular">
      <Table rowKey="id" columns={columns} dataSource={recentApplications} pagination={false} />
    </Card>
  </div>
);

export default StatsPage; 