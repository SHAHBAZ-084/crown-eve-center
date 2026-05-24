// frontend/src/pages/auth/Forgot.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const Forgot = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      alert('Password updated successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="page-forgot" className="page">
      <div className="login-card">
        <Link to="/login" className="form-link" style={{ display: 'inline-block', marginBottom: '24px' }}>
          ← Back to Login
        </Link>

        <h2 className="text-5xl font-family-bebas mb-2 tracking-tighter uppercase text-orange-600">
          Reset Password
        </h2>
        <p className="text-sm text-[#BDBDB8] mb-8">
          {step === 1
            ? 'Enter your email — we will send a 6-digit OTP.'
            : `Enter the OTP sent to ${email} and your new password.`}
        </p>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>6-digit OTP</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="form-submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
            <button
              type="button"
              className="form-link"
              style={{ marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setStep(1);
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Forgot;
