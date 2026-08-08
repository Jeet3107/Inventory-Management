import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <span className="mobile-logo">📦 InvMS</span>
      </div>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">📦 InvMS</span>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end onClick={closeSidebarOnMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="icon">🏠</span><span className="label">Dashboard</span>
          </NavLink>
          <NavLink to="/products" onClick={closeSidebarOnMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="icon">📋</span><span className="label">Products</span>
          </NavLink>
          <NavLink to="/categories" onClick={closeSidebarOnMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="icon">🏷️</span><span className="label">Categories</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="icon">👤</span>
            <div className="label">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;