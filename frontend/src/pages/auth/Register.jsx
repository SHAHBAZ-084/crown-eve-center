// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert('Passwords do not match');
    }
    try {
      await api.post('/auth/register', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        role: 'COMPANY_OWNER' // Temporary: Create as owner to bypass seed issue
      });
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div id="page-register" className="page">
      <div className="register-card">
        <Link to="/" className="logo" style={{ marginBottom: '32px', display: 'inline-flex' }}>
          <div className="logo-icon"><span>CE</span></div>
          <span className="logo-text">Crown <em>Eve</em></span>
        </Link>
        <h2 className="text-5xl font-family-bebas mb-2 tracking-tighter uppercase text-white">Create Account.</h2>
        <p className="text-sm text-[#BDBDB8] mb-8">Join Crown Eve — browse bikes, book services, track your orders.</p>
        
        <form onSubmit={handleSubmit}>
          {/* Stacked Layout for cleaner vertical profile */}
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" 
              placeholder="Ali"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              placeholder="Khan"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="ali@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              placeholder="+92 300 0000000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <select 
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
            >
              <option value="">Select your city</option>
              <option>Lahore</option>
              <option>Karachi</option>
              <option>Islamabad</option>
              <option>Faisalabad</option>
              <option>Rawalpindi</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px' }}>
            <input type="checkbox" id="terms" style={{ marginTop: '3px', accentColor: 'var(--orange)' }} required />
            <label htmlFor="terms" style={{ fontSize: '12px', color: 'var(--white2)', lineHeight: '1.6', cursor: 'none' }}>
              I agree to the <Link to="/terms" className="form-link">Terms of Service</Link> and <Link to="/privacy" className="form-link">Privacy Policy</Link>
            </label>
          </div>
          <button type="submit" className="form-submit">Create My Account →</button>
        </form>
        
        <div className="form-divider">— or —</div>
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--white2)' }}>
          Already have an account? <Link to="/login" className="form-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
