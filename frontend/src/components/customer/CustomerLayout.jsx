// frontend/src/components/customer/CustomerLayout.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PageSuspense from '../PageSuspense';
import '../../styles/customer.css';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/my/dashboard', match: (p) => p === '/my/dashboard' },
  { label: 'Shop', to: '/my/shop', match: (p) => p.startsWith('/my/shop') || p.startsWith('/my/product') },
  { label: 'Orders', to: '/my/orders', match: (p) => p.startsWith('/my/orders') || p.startsWith('/track/') },
  { label: 'Bookings', to: '/my/bookings', match: (p) => p.startsWith('/my/bookings') },
  { label: 'Book Service', to: '/appointments', match: (p) => p.startsWith('/appointments') },
];

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CU';

  const navClass = ({ isActive }) => `cnl${isActive ? ' active' : ''}`;

  return (
    <div id="customer-dashboard-shell">
      <header className="cnav">
        <button
          type="button"
          className="cnav-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <NavLink to="/my/dashboard" className="cnav-logo">
          <div className="logo-hex">CE</div>
          <span className="logo-txt">Crown <em>Eve</em></span>
        </NavLink>

        <nav className={`cnav-links${menuOpen ? ' open' : ''}`} aria-label="Customer navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navClass}
              isActive={() => link.match(location.pathname)}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="cnav-mobile-extra">
            <NavLink to="/my/cart" className={navClass} isActive={() => location.pathname.startsWith('/my/cart')} onClick={() => setMenuOpen(false)}>
              Cart {count > 0 ? `(${count})` : ''}
            </NavLink>
            <NavLink to="/my/profile" className={navClass} isActive={() => location.pathname.startsWith('/my/profile')} onClick={() => setMenuOpen(false)}>
              Profile
            </NavLink>
            <NavLink to="/" className="cnl cnl-home" onClick={() => setMenuOpen(false)}>
              Back to Website
            </NavLink>
            <button type="button" className="cnl cnl-logout-mobile" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="cnav-right">
          <NavLink to="/my/cart" className="cart-btn" title="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Cart</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </NavLink>

          <button type="button" className="cnav-home-btn" onClick={() => navigate('/')} title="Public website">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
            </svg>
          </button>

          <button type="button" className="user-pill" onClick={() => navigate('/my/profile')}>
            <div className="ua">{initials}</div>
            <span className="user-name-pill">{user?.name?.split(' ')[0] || 'Account'}</span>
          </button>

          <button type="button" className="cnl-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {menuOpen && <button type="button" className="cnav-overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="main-wrap">
        <div className="page-wrap">
          <PageSuspense>
            <Outlet />
          </PageSuspense>
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
