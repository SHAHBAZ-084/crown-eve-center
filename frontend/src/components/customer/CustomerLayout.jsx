// frontend/src/components/customer/CustomerLayout.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PageSuspense from '../PageSuspense';
import { LOGO_URL } from '../../constants/mediaAssets';
import '../../styles/customer.css';
import '../../styles/customer-ui.css';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/my/dashboard', match: (p) => p === '/my/dashboard' },
  { label: 'Shop', to: '/my/shop', match: (p) => p.startsWith('/my/shop') || p.startsWith('/my/product') },
  { label: 'Orders', to: '/my/orders', match: (p) => p.startsWith('/my/orders') || p.startsWith('/my/track/') || p.startsWith('/track/') },
  { label: 'Bookings', to: '/my/bookings', match: (p) => p.startsWith('/my/bookings') },
  { label: 'Book Service', to: '/my/book-service', match: (p) => p.startsWith('/my/book-service') || p.startsWith('/appointments') },
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

  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="customer-dashboard-shell">
      <header className="cnav scrolled">
        <NavLink to="/my/dashboard" className="cnav-logo logo" onClick={closeMenu}>
          <img
            src={LOGO_URL}
            alt="Crown Eve Center"
            className="cnav-logo-img"
            style={{ height: 'var(--cnav-logo-size, 65px)', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </NavLink>

        <nav className="cnav-links--desktop" aria-label="Customer navigation">
          <ul className="cnav-nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => linkClass(link.match(location.pathname), isActive)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cnav-actions">
          <NavLink to="/my/cart" className="cnav-cart-link" aria-label="Cart" title="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && <span className="cnav-cart-badge">{count}</span>}
          </NavLink>

          <button type="button" className="cnav-profile-btn" onClick={() => navigate('/my/profile')}>
            <span className="cnav-user-name">{user?.name?.split(' ')[0] || 'Account'}</span>
            <span className="cnav-user-role">Customer</span>
          </button>

          <button type="button" className="btn-nav-login" onClick={logout}>
            Logout
          </button>

          <button
            type="button"
            className={`cnav-hamburger${menuOpen ? ' open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className={`bar ${menuOpen ? 'open' : ''}`} />
            <div className={`bar ${menuOpen ? 'open' : ''}`} />
            <div className={`bar ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </header>

      <aside
        className={`cnav-drawer${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        <div className="cnav-drawer-head">
          <img src={LOGO_URL} alt="Crown Eve Center" className="cnav-drawer-logo" />
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
