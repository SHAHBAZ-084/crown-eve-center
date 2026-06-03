// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LOGO_URL } from '../../constants/mediaAssets';
import { PAKISTAN_CITIES } from '../../constants/pakistanCities';
import api from '../../services/api';
import './Auth.css';

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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        role: 'CUSTOMER'
      });
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Server is slow or unreachable. Try again in a moment.'
          : err.response?.data?.message || 'Registration failed';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="page-register" className="page">
      <div className="register-card">
        <Link to="/" className="logo" style={{ marginBottom: '32px', display: 'inline-flex', alignItems: 'center' }}>
          <img src={LOGO_URL} alt="Crown Hadi EV Center" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
        </Link>
        <h2 className="text-5xl font-family-bebas mb-2 tracking-tighter uppercase text-black">Create Account.</h2>
        <p className="text-sm text-muted mb-8">Join Crown Eve — browse bikes, book services, track your orders.</p>
        
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

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
              placeholder="Min 8 chars, upper, lower, number"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              minLength={8}
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
            <label htmlFor="register-city">City</label>
            <input
              id="register-city"
              type="text"
              list="pakistan-cities"
              placeholder="Type or select your city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              autoComplete="address-level2"
              required
            />
            <datalist id="pakistan-cities">
              {PAKISTAN_CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px' }}>
            <input type="checkbox" id="terms" style={{ marginTop: '3px', accentColor: 'var(--orange)' }} required />
            <label htmlFor="terms" style={{ fontSize: '12px', color: 'var(--white2)', lineHeight: '1.6', cursor: 'pointer' }}>
              I agree to the <Link to="/terms" className="form-link">Terms of Service</Link> and <Link to="/privacy" className="form-link">Privacy Policy</Link>
            </label>
          </div>
          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create My Account →'}
          </button>
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
