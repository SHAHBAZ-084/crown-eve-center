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

const linkClass = (match, isActive) => `cnl${match || isActive ? ' active' : ''}`;

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="customer-dashboard-shell">
      <header className="cnav">
        <button
          type="button"
          className={`cnav-menu-btn${menuOpen ? ' open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <NavLink to="/my/dashboard" className="cnav-logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Crown Eve Center" className="cnav-logo-img" />
        </NavLink>

        <nav className="cnav-links cnav-links--desktop" aria-label="Customer navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => linkClass(link.match(location.pathname), isActive)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="cnav-right">
          <NavLink to="/my/cart" className="cart-btn" title="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Cart</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </NavLink>

          <button type="button" className="cnav-home-btn" onClick={() => navigate('/')} title="Public website">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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

      <aside
        className={`cnav-drawer${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        <div className="cnav-drawer-head">
          <img src="/logo.png" alt="Crown Eve Center" className="cnav-drawer-logo" />
          <button type="button" className="cnav-drawer-close" aria-label="Close menu" onClick={closeMenu}>
            ✕
          </button>
        </div>

        <nav className="cnav-drawer-nav" aria-label="Mobile menu links">
          <p className="cnav-drawer-label">Navigation</p>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={`drawer-${link.to}`}
              to={link.to}
              className={({ isActive }) => linkClass(link.match(location.pathname), isActive)}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          <p className="cnav-drawer-label">Account</p>
          <NavLink
            to="/my/cart"
            className={({ isActive }) => linkClass(location.pathname.startsWith('/my/cart'), isActive)}
            onClick={closeMenu}
          >
            Cart {count > 0 ? `(${count})` : ''}
          </NavLink>
          <NavLink
            to="/my/profile"
            className={({ isActive }) => linkClass(location.pathname.startsWith('/my/profile'), isActive)}
            onClick={closeMenu}
          >
            Profile
          </NavLink>
          <button type="button" className="cnl cnl-logout-mobile" onClick={() => { closeMenu(); logout(); }}>
            Logout
          </button>
        </nav>
      </aside>

      {menuOpen && (
        <button type="button" className="cnav-overlay" aria-label="Close menu" onClick={closeMenu} />
      )}

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
