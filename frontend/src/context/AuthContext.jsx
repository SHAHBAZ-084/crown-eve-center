// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { normalizeRole } from '../constants/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('user') || 'null');
      return cached ? { ...cached, role: normalizeRole(cached.role) } : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('user'));

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const nextUser = { ...res.data.user, role: normalizeRole(res.data.user.role) };
          setUser(nextUser);
          localStorage.setItem('user', JSON.stringify(nextUser));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const nextUser = { ...res.data.user, role: normalizeRole(res.data.user.role) };
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    return { ...res.data, user: nextUser };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Still clear local session if API is unreachable
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
