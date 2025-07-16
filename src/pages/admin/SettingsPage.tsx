import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();

  const handleCompanySave = (values: any) => {
    message.success('Şirket bilgileri kaydedildi (mock)');
  };
  const handlePasswordSave = (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Şifreler eşleşmiyor');
      return;
    }
    message.success('Şifre değiştirildi (mock)');
  };

  return (
    <div>
      <Card title="Şirket Bilgisi" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleCompanySave} initialValues={{ name: 'Admin Şirketi', email: 'admin@company.com' }}>
          <Form.Item name="name" label="Şirket Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="E-posta" rules={[{ required: true, type: 'email', message: 'Geçerli e-posta girin' }]}> <Input /> </Form.Item>
          <Button type="primary" htmlType="submit">Kaydet</Button>
        </Form>
      </Card>
      <Card title="Admin Şifresi Değiştir">
        <Form form={passForm} layout="vertical" onFinish={handlePasswordSave}>
          <Form.Item name="currentPassword" label="Mevcut Şifre" rules={[{ required: true, message: 'Zorunlu alan' }]}> <Input.Password /> </Form.Item>
          <Form.Item name="newPassword" label="Yeni Şifre" rules={[{ required: true, message: 'Zorunlu alan' }]}> <Input.Password /> </Form.Item>
          <Form.Item name="confirmPassword" label="Yeni Şifre (Tekrar)" rules={[{ required: true, message: 'Zorunlu alan' }]}> <Input.Password /> </Form.Item>
          <Button type="primary" htmlType="submit">Şifreyi Değiştir</Button>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage; 