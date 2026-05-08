// frontend/src/components/layout/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ user: propsUser, logout: propsLogout }) => {
  const { user: authUser, logout: authLogout } = useAuth();

  // Use props if available, otherwise fallback to context
  const user = propsUser !== undefined ? propsUser : authUser;
  const logout = propsLogout || authLogout;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav className={`${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <Link to="/" className="logo">
        <div className="logo-icon"><span>CE</span></div>
        <span className="logo-text">Crown <em>Eve</em></span>
      </Link>

      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li className="dropdown-parent">
          <Link to="/shop">Products <span className="dropdown-arrow">▾</span></Link>
          <ul className="dropdown-menu-ultra">
            <li><Link to="/shop?type=bike">Bikes</Link></li>
            <li><Link to="/shop?type=part">Spare Parts</Link></li>
          </ul>
        </li>
        <li><Link to="/#services">Services</Link></li>
        <li><Link to="/about">About</Link></li>
        {user && <li><Link to="/appointments">Book Service</Link></li>}
        <li><Link to="/contact">Contact</Link></li>
        {/* On mobile, show auth links inside menu if not in header */}
        <li className="mobile-auth-links">
          {!user && (
            <div className="flex flex-col gap-4 mt-8">
              <Link to="/login" className="btn-nav-login w-full text-center">Login</Link>
              <Link to="/register" className="btn-nav-register w-full text-center">Register</Link>
            </div>
          )}
        </li>
      </ul>

      <div className="nav-actions">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500">{user.name || 'User'}</div>
              <div className="text-[8px] text-gray-400 uppercase tracking-widest">{user.role?.replace('_', ' ') || 'No Role'}</div>
            </div>
            {user.role === 'COMPANY_OWNER' && (
              <Link to="/owner/dashboard" className="btn-nav-register px-4 py-2">Dashboard</Link>
            )}
            {user.role === 'BRANCH_OWNER' && (
              <Link to="/branch/dashboard" className="btn-nav-register px-4 py-2">Dashboard</Link>
            )}
            {user.role === 'CUSTOMER' && (
              <Link to="/my/dashboard" className="btn-nav-register px-4 py-2">My Dashboard</Link>
            )}
            {['EMPLOYEE', 'TECHNICIAN'].includes(user.role) && (
              <Link to="/emp/dashboard" className="btn-nav-register px-4 py-2">Terminal</Link>
            )}
            <button
              onClick={logout}
              className="btn-nav-login"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="header-auth-desktop">
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-register">Register</Link>
          </div>
        )}

        {/* HAMBURGER */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
