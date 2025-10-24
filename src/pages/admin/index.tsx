import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import UsersPage from './UsersPage';
import CorporatesPage from './CorporatesPage';
import JobsPage from './JobsPage';
import ApplicationsPage from './ApplicationsPage';
import CorporateApplicationsPage from './CorporateApplicationsPage';
import StatsPage from './StatsPage';
import SettingsPage from './SettingsPage';
import AdminLogin from './AdminLogin';
import ReportsPage from '../reports/ReportsPage';

function isAuthenticated() {
  return localStorage.getItem('admin-auth') === 'true';
}

const AdminRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // /admin adresine gelindiğinde login veya users'a yönlendir
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      if (isAuthenticated()) {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  if (!isAuthenticated() && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }
  if (isAuthenticated() && location.pathname === '/admin/login') {
    return <Navigate to="/admin/users" replace />;
  }
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="" element={<AdminLayout />}>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="corporates" element={<CorporatesPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="corporate-applications" element={<CorporateApplicationsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 