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
      const user = await login(email, password);
      // Role-based redirection logic preserved
      if (user.role === 'COMPANY_OWNER') navigate('/owner/dashboard');
      else if (user.role === 'BRANCH_OWNER') navigate('/branch/dashboard');
      else if (user.role === 'SERVICE_EMPLOYEE') navigate('/branch/appointments');
      else navigate('/');
    } catch (err) {
      alert('Invalid credentials');
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
