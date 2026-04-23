// frontend/src/components/layout/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <Link to="/" className="logo">
        <div className="logo-icon"><span>CE</span></div>
      </Link>
      
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/shop">Shop</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/appointments">Book Service</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      <div className="nav-actions">
        {user ? (
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">{user.name}</div>
              <div className="text-[8px] text-muted uppercase tracking-widest">{user.role.replace('_', ' ')}</div>
            </div>
            <button 
              onClick={logout}
              className="btn-nav-login"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
