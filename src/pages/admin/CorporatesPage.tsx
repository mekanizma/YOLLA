import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form } from 'antd';
import { adminCreateCorporateAccount } from '../../lib/authService';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import supabase from '../../lib/supabaseClient';

type CorporateRow = { id: number; name: string; email: string; phone?: string | null; created_at: string };

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
        await adminCreateCorporateAccount({
          email: values.email,
          password: values.password,
          companyName: values.name,
          phone: values.phone,
        });
        setData([
          ...data,
          { id: Date.now(), name: values.name, email: values.email, phone: values.phone, created: new Date().toLocaleDateString('tr-TR') }
        ]);
        setModalOpen(false);
        form.resetFields();
      } catch (e: any) {
        Modal.error({ title: 'Oluşturma başarısız', content: e?.message || 'Bilinmeyen hata' });
      }
    });
  };

  const columns = [
    { title: 'Şirket Adı', dataIndex: 'name', key: 'name' },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
    { title: 'Oluşturulma', dataIndex: 'created', key: 'created' },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const filtered = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id,name,email,phone,created_at')
        .order('created_at', { ascending: false });
      if (!error) {
        setData(
          (data as CorporateRow[]).map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '-',
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
      <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} />
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleOk} title={editing ? 'Hesap Düzenle' : 'Hesap Oluştur'}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Şirket Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-posta" rules={[{ required: true, type: 'email', message: 'Geçerli e-posta girin' }]}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default CorporatesPage; 