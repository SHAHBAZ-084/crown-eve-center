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
        } catch (err) {
          const status = err.response?.status;
          if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
          // 429/503: keep cached session; avoid logout loop during API pressure
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const persistSession = (data) => {
    const nextUser = { ...data.user, role: normalizeRole(data.user.role) };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    return { ...data, user: nextUser };
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return persistSession(res.data);
  };

  const loginWithGoogle = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    return persistSession(res.data);
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
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
