// frontend/src/pages/checkout/Checkout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      navigate('/my/dashboard');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
      Redirecting to secure checkout...
    </div>
  );
};

export default Checkout;
