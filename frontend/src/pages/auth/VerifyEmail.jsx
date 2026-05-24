// frontend/src/pages/auth/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to verify email. The link might be expired or invalid.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div className="register-card" style={{ textAlign: 'center', padding: '40px', maxWidth: '400px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 className="text-3xl font-family-bebas mb-4 tracking-tighter uppercase text-black">Email Verification</h2>
        
        {status === 'loading' && (
          <p style={{ color: '#555', fontSize: '16px' }}>{message}</p>
        )}

        {status === 'success' && (
          <div>
            <p style={{ color: 'green', fontSize: '16px', marginBottom: '20px' }}>{message}</p>
            <Link to="/login" className="form-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p style={{ color: 'red', fontSize: '16px', marginBottom: '20px' }}>{message}</p>
            <Link to="/register" className="form-submit" style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: '#333' }}>
              Back to Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
