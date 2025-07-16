import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SolutionOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin/users', icon: <UserOutlined />, label: 'Bireysel Kullanıcılar' },
  { key: '/admin/corporates', icon: <TeamOutlined />, label: 'Kurumsal Hesaplar' },
  { key: '/admin/jobs', icon: <FileTextOutlined />, label: 'İş İlanları' },
  { key: '/admin/applications', icon: <SolutionOutlined />, label: 'Başvurular' },
  { key: '/admin/stats', icon: <BarChartOutlined />, label: 'İstatistikler' },
  { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: 'Ayarlar' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin-auth');
    navigate('/admin/login', { replace: true });
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
          style={{ height: '100%', borderRight: 0, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
          <div style={{ flex: 1 }} />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ marginTop: 'auto', color: '#ff4d4f', fontWeight: 600 }}>
            Çıkış Yap
          </Menu.Item>
        </Menu>
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