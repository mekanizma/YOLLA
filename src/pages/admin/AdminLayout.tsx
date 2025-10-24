import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SolutionOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BankOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/authService';
import { message } from 'antd';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { 
    key: '/admin/users', 
    icon: <UserOutlined />, 
    label: <Link to="/admin/users">Bireysel Kullanıcılar</Link> 
  },
  { 
    key: '/admin/corporates', 
    icon: <TeamOutlined />, 
    label: <Link to="/admin/corporates">Kurumsal Hesaplar</Link> 
  },
  { 
    key: '/admin/jobs', 
    icon: <FileTextOutlined />, 
    label: <Link to="/admin/jobs">İş İlanları</Link> 
  },
  { 
    key: '/admin/applications', 
    icon: <SolutionOutlined />, 
    label: <Link to="/admin/applications">Başvurular</Link> 
  },
  { 
    key: '/admin/corporate-applications', 
    icon: <BankOutlined />, 
    label: <Link to="/admin/corporate-applications">Kurumsal Başvurular</Link> 
  },
  { 
    key: '/admin/stats', 
    icon: <BarChartOutlined />, 
    label: <Link to="/admin/stats">İstatistikler</Link> 
  },
  { 
    key: '/admin/reports', 
    icon: <BarChartOutlined />, 
    label: <Link to="/admin/reports">Raporlar</Link> 
  },
  { 
    key: '/admin/settings', 
    icon: <SettingOutlined />, 
    label: <Link to="/admin/settings">Ayarlar</Link> 
  },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (_e) {
      // sessiyon yoksa da sorun değil
    } finally {
      localStorage.removeItem('admin-auth');
      message.success('Çıkış yapıldı');
      navigate('/admin/login', { replace: true });
    }
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="60" style={{ background: '#fff' }}>
        <div style={{ height: 64, margin: 16, fontWeight: 700, fontSize: 22, textAlign: 'center', color: '#1677ff' }}>
          AdminPanel
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            ...menuItems,
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Çıkış Yap',
              onClick: handleLogout,
              style: { marginTop: 'auto', color: '#ff4d4f', fontWeight: 600 }
            }
          ]}
          style={{ height: '100%', borderRight: 0, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', fontWeight: 600, fontSize: 18, borderBottom: '1px solid #f0f0f0' }}>
          Yönetim Paneli
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 360, boxShadow: '0 2px 8px #f0f1f2' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 