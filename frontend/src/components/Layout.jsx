// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';

// CSS-only page transition — no framer-motion, no eval, no CSP issues
const pageStyle = {
  animation: 'fadeSlideIn 0.18s ease forwards',
};

const Layout = ({ isPublic = false }) => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  // While checking auth, show nothing — prevents flash of wrong UI state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';
  const isMinimal = user?.role === 'EMPLOYEE' || user?.role === 'TECHNICIAN';
  const showNavbar = isPublic || isCustomer;

  if (showNavbar) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <Navbar user={user} logout={logout} />
        <main>
          <div key={location.pathname} style={pageStyle}>
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      {!isMinimal && <Sidebar user={user} logout={logout} />}

      <div className={`flex-1 flex flex-col ${!isMinimal ? 'lg:ml-72' : ''}`}>
        <TopBar user={user} logout={logout} isMinimal={isMinimal} />

        <main className="p-8">
          <div key={location.pathname} style={pageStyle}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
