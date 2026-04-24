// frontend/src/components/layout/SmartRoute.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const SmartRoute = ({ customerElement, publicElement }) => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';

  return isCustomer ? customerElement : publicElement;
};

export default SmartRoute;
