// frontend/src/pages/auth/Forgot.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const isValidOtp = (value) => /^\d{6}$/.test(String(value || '').trim());

const Forgot = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setOtp('');
      setOtpError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const validateOtpField = () => {
    if (!isValidOtp(otp)) {
      setOtpError('OTP is required. Enter the 6-digit code from your email.');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateOtpField()) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword,
      });
      setSuccess('Password updated successfully. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="page-forgot" className="page">
      <div className="login-card">
        <Link
          to="/login"
          className="form-link"
          style={{ display: 'inline-block', marginBottom: '24px' }}
        >
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

        {error && <div className="form-error" role="alert">{error}</div>}
        {success && <div className="auth-success-banner" role="status">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                name="email"
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
          <form onSubmit={handleResetPassword} noValidate>
            <div className="form-group">
              <label htmlFor="forgot-otp">6-digit OTP</label>
              <input
                id="forgot-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (otpError) setOtpError('');
                }}
                onBlur={validateOtpField}
                style={{
                  textAlign: 'center',
                  letterSpacing: '4px',
                  fontWeight: 'bold',
                  borderColor: otpError ? '#ef4444' : undefined,
                }}
                aria-invalid={otpError ? 'true' : 'false'}
                aria-describedby={otpError ? 'forgot-otp-error' : undefined}
              />
              {otpError && (
                <p id="forgot-otp-error" style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                  {otpError}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="forgot-new-password">New Password</label>
              <input
                id="forgot-new-password"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="forgot-confirm-password">Confirm Password</label>
              <input
                id="forgot-confirm-password"
                name="confirmPassword"
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
              disabled={loading}
              onClick={(e) => {
                if (!validateOtpField()) {
                  e.preventDefault();
                }
              }}
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
                setOtpError('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
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
