import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form } from 'antd';
import { adminCreateCorporateAccount } from '../../lib/authService';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import supabase from '../../lib/supabaseClient';

type CorporateRow = { 
  id: number; 
  name: string; 
  email: string; 
  phone?: string | null; 
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  size?: string | null;
  founded_year?: number | null;
  created_at: string 
};

const CorporatesPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const handleDelete = (id: number) => {
    setData(data.filter(c => c.id !== id));
  };
  const handleEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };
  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };
  const handleOk = () => {
    form.validateFields().then(async (values: any) => {
      if (editing) {
        setData(data.map(c => c.id === editing.id ? { ...editing, ...values } : c));
        setModalOpen(false);
        return;
      }
      try {
        console.log('Admin corporate account oluşturuluyor:', values);
        await adminCreateCorporateAccount({
          email: values.email,
          password: values.password,
          companyName: values.name,
          phone: values.phone,
          description: values.description,
          industry: values.industry,
          location: values.location,
          website: values.website,
          size: values.size,
          founded_year: values.founded_year ? parseInt(values.founded_year) : undefined,
        });
        console.log('Admin corporate account başarıyla oluşturuldu');
        setData([
          ...data,
          { 
            id: Date.now(), 
            name: values.name, 
            email: values.email, 
            phone: values.phone, 
            created: new Date().toLocaleDateString('tr-TR') 
          }
        ]);
        setModalOpen(false);
        form.resetFields();
      } catch (e: any) {
        console.error('Admin corporate account oluşturma hatası:', e);
        Modal.error({ 
          title: 'Oluşturma başarısız', 
          content: e?.message || 'Bilinmeyen hata. Console\'u kontrol edin.' 
        });
      }
    });
  };

  const columns = [
    { 
      title: 'Şirket Adı', 
      dataIndex: 'name', 
      key: 'name',
      width: 150,
      render: (text: string) => (
        <div className="font-semibold">{text}</div>
      )
    },
    { 
      title: 'E-posta', 
      dataIndex: 'email', 
      key: 'email',
      width: 180
    },
    { 
      title: 'Telefon', 
      dataIndex: 'phone', 
      key: 'phone',
      width: 120
    },
    { 
      title: 'Sektör', 
      dataIndex: 'industry', 
      key: 'industry',
      width: 120,
      render: (text: string) => text === '-' ? <span className="text-gray-400">-</span> : text
    },
    { 
      title: 'Konum', 
      dataIndex: 'location', 
      key: 'location',
      width: 120,
      render: (text: string) => text === '-' ? <span className="text-gray-400">-</span> : text
    },
    { 
      title: 'Açıklama', 
      dataIndex: 'description', 
      key: 'description',
      width: 200,
      render: (text: string) => (
        <div className="max-w-[200px] truncate" title={text}>
          {text === '-' ? <span className="text-gray-400">-</span> : text}
        </div>
      )
    },
    { 
      title: 'Website', 
      dataIndex: 'website', 
      key: 'website',
      width: 150,
      render: (text: string) => {
        if (!text || text === '-') return <span className="text-gray-400">-</span>;
        const value = String(text).trim();
        const href = value.startsWith('http') ? value : `https://${value}`;
        return (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            {value.length > 20 ? `${value.substring(0, 20)}...` : value}
          </a>
        );
      }
    },
    { 
      title: 'Büyüklük', 
      dataIndex: 'size', 
      key: 'size',
      width: 100,
      render: (text: string) => text === '-' ? <span className="text-gray-400">-</span> : text
    },
    { 
      title: 'Kuruluş', 
      dataIndex: 'founded_year', 
      key: 'founded_year',
      width: 80,
      render: (text: string | number) => text === '-' ? <span className="text-gray-400">-</span> : text
    },
    { 
      title: 'Oluşturulma', 
      dataIndex: 'created', 
      key: 'created',
      width: 100
    },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const filtered = data.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id,name,email,phone,description,industry,location,website,size,founded_year,created_at')
        .order('created_at', { ascending: false });
      if (!error) {
        setData(
          (data as CorporateRow[]).map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '-',
            description: c.description || '-',
            industry: c.industry || '-',
            location: c.location || '-',
            website: c.website || '-',
            size: c.size || '-',
            founded_year: c.founded_year || '-',
            created: new Date(c.created_at).toLocaleDateString('tr-TR')
          }))
        );
      }
    };
    load();
  }, []);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PlusOutlined />} type="primary" onClick={handleCreate}>Hesap Oluştur</Button>
        <Input
          placeholder="Şirket ara"
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
        pagination={{ pageSize: 8 }} 
        scroll={{ x: 1200 }}
        size="small"
      />
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleOk} title={editing ? 'Hesap Düzenle' : 'Hesap Oluştur'}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Şirket Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-posta" rules={[
            { required: true, message: 'Zorunlu alan' },
            { pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: 'Geçerli e-posta girin' }
          ]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Geçici Şifre" rules={[{ required: true, min: 6, message: 'En az 6 karakter' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Şirket Açıklaması" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input.TextArea rows={3} placeholder="Şirketinizi kısaca tanıtın..." />
          </Form.Item>
          <Form.Item name="industry" label="Sektör" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: Teknoloji, Finans, Sağlık..." />
          </Form.Item>
          <Form.Item name="location" label="Konum" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: İstanbul, Ankara..." />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://www.example.com" />
          </Form.Item>
          <Form.Item name="size" label="Şirket Büyüklüğü">
            <Input placeholder="Örn: 1-10, 11-50, 51-200..." />
          </Form.Item>
          <Form.Item name="founded_year" label="Kuruluş Yılı">
            <Input type="number" placeholder="2020" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CorporatesPage; 