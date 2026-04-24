// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import Cursor from './layout/Cursor';

const Layout = ({ isPublic = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Determine layout mode
  const isCustomer = user?.role === 'CUSTOMER';
  const isMinimal = user?.role === 'EMPLOYEE' || user?.role === 'TECHNICIAN';
  const showNavbar = isPublic || isCustomer;

  if (showNavbar) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <Cursor />
        <Navbar user={user} logout={logout} />
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      <Cursor />
      {!isMinimal && <Sidebar user={user} logout={logout} />}

      <div className={`flex-1 flex flex-col ${!isMinimal ? 'lg:ml-72' : ''}`}>
        <TopBar user={user} logout={logout} isMinimal={isMinimal} />
        
        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
