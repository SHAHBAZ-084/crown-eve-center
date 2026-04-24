// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      const user = res.user;
      
      console.log('Login successful:', user);
      
      // Redirect based on role
      if (user.role === 'COMPANY_OWNER') {
        navigate('/owner/dashboard');
      } else if (user.role === 'BRANCH_OWNER') {
        navigate('/branch/dashboard');
      } else if (user.role === 'EMPLOYEE' || user.role === 'TECHNICIAN') {
        navigate('/emp/dashboard');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid credentials or server error';
      alert(msg);
    }
  };

  return (
    <div id="page-login" className="page">
      <div className="login-card">
        <Link to="/" className="logo" style={{ marginBottom: '32px', display: 'inline-flex' }}>
          <div className="logo-icon"><span>CE</span></div>
          <span className="logo-text">Crown <em>Eve</em></span>
        </Link>
        <h2 className="text-5xl font-family-bebas mb-2 tracking-tighter uppercase text-white">Welcome Back.</h2>
        <p className="text-sm text-[#BDBDB8] mb-8">Sign in to your Crown Eve portal to manage your hub.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="ali@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-submit">Sign In To Portal →</button>
        </form>
        
        <div className="form-divider">— or —</div>
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--white2)' }}>
          Don't have an account? <Link to="/register" className="form-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
