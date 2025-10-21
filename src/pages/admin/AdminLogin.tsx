import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { signInWithRole } from '../../lib/authService';


const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const email: string = values.email;
      const password: string = values.password;
      await signInWithRole(email, password, 'admin');
      localStorage.setItem('admin-auth', 'true');
      message.success('Giriş başarılı');
      navigate('/admin/users');
    } catch (err: any) {
      message.error(err?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <Card title="Admin Girişi" style={{ width: 380 }}>
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item name="email" label="E-posta" rules={[{ required: true, message: 'E-posta zorunlu' }, { type: 'email', message: 'Geçerli bir e-posta girin' }]}> 
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Şifre" rules={[{ required: true, message: 'Şifre zorunlu' }]}> 
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Giriş Yap</Button>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin; 