import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar = () => {
  const navigate = useNavigate();

  const userName  = localStorage.getItem('name')  || 'Admin User';
  const userEmail = localStorage.getItem('email') || 'admin@example.com';
  const avatarInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    { path: '/admin/overview', icon: 'bi-grid-1x2', label: 'Overview' },
    { path: '/admin/plans-pricing', icon: 'bi-credit-card', label: 'Plans & Pricing' },
    { path: '/admin/roles-policies', icon: 'bi-shield-check', label: 'Roles & Policies' },
    { path: '/admin/audience', icon: 'bi-people', label: 'Audience & Engagement' },
    { path: '/admin/revenue', icon: 'bi-currency-dollar', label: 'Revenue' },
    { path: '/admin/renewals', icon: 'bi-arrow-repeat', label: 'Renewals' },
    { path: '/admin/notifications', icon: 'bi-bell', label: 'Notifications' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="sidebar-header-text" style={{ marginTop: '0.75rem' }}>
          <h6 className="text-light mb-0 fw-bold">Admin Dashboard</h6>
          <small className="text-secondary">Executive Overview</small>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="profile-popover">
          <button className="popover-item">
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </button>
          <button className="popover-item logout-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
        <div className="admin-avatar">
          {avatarInitial}
        </div>
        <div className="admin-user-info">
          <span className="admin-name">{userName}</span>
          <span className="admin-email">{userEmail}</span>
        </div>
      </div>
    </aside>
  );
};

