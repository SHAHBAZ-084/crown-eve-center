// frontend/src/components/customer/CustomerLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/customer.css';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { label: 'Overview', path: '/my/dashboard' },
    { label: 'Shop', path: '/shop' },
    { label: 'My Orders', path: '/my/orders' },
    { label: 'My Bookings', path: '/my/bookings' },
    { label: 'Profile', path: '/my/profile' },
  ];

  return (
    <div id="customer-dashboard-shell">
      <nav className="cnav">
        <div className="cnav-logo" onClick={() => navigate("/my/dashboard")}>
          <div className="logo-hex">CE</div>
          <span className="logo-txt">Crown <em>Eve</em></span>
        </div>

        <div className="cnav-links">
          {links.map((link) => (
            <button
              key={link.path}
              className={`cnl ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="cnav-right">
          <button className="cart-btn" onClick={() => navigate("/cart")}>
            🛒 Cart
            <span className="cart-count">2</span>
          </button>
          
          <div className="user-pill" onClick={() => navigate("/my/profile")}>
            <div className="ua">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CU'}
            </div>
            <span className="user-name-pill">{user?.name || 'Customer'}</span>
          </div>

          <button 
            className="cnl" 
            onClick={logout}
            style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 10 }}
          >
            LOGOUT
          </button>
        </div>
      </nav>

      <main className="main-wrap">
        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
