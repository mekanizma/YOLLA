import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.username === 'admin' && values.password === 'admin') {
        localStorage.setItem('admin-auth', 'true');
        navigate('/admin/users');
      } else {
        message.error('Kullanıcı adı veya şifre hatalı');
      }
    }, 700);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <Card title="Admin Girişi" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item name="username" label="Kullanıcı Adı" rules={[{ required: true, message: 'Kullanıcı adı zorunlu' }]}> 
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Şifre" rules={[{ required: true, message: 'Şifre zorunlu' }]}> 
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Giriş Yap</Button>
        </Form>
        <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
          <b>Demo:</b> admin / admin
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin; 