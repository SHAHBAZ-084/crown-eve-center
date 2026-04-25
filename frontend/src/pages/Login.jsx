// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      const user = res.user;
      
      console.log('Login successful:', user);
      
      const searchParams = new URLSearchParams(location.search);
      const redirectQuery = searchParams.get('redirect');
      const from = location.state?.from || redirectQuery || null;

      // Redirect to the intended page, or fallback based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'COMPANY_OWNER') {
        navigate('/owner/dashboard');
      } else if (user.role === 'BRANCH_OWNER') {
        navigate('/branch/dashboard');
      } else if (user.role === 'CUSTOMER') {
        navigate('/my/dashboard');
      } else if (['EMPLOYEE', 'TECHNICIAN'].includes(user.role)) {
        navigate('/emp/dashboard');
      } else {
        navigate('/');
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
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo" style={{ display: 'inline-flex' }}>
            <div className="logo-icon"><span>CE</span></div>
            <span className="logo-text">Crown <em>Eve</em></span>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--white2)', borderRadius: '8px', padding: '7px 14px',
              fontSize: '12px', cursor: 'pointer', letterSpacing: '0.05em',
              fontWeight: 600, transition: 'all .2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            ← Home
          </button>
        </div>
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
