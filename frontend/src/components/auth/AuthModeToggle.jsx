import React, { useId } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthModeToggle = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const inputId = useId();
  const isRegister = mode === 'register';

  return (
    <div className="auth-mode-toggle fx-block">
      <div className="auth-toggle">
        <div>
          <input
            type="checkbox"
            id={inputId}
            checked={isRegister}
            onChange={(e) => navigate(e.target.checked ? '/register' : '/login')}
            aria-label={isRegister ? 'Switch to login' : 'Switch to register'}
          />
          <div data-unchecked="Login" data-checked="Register" />
        </div>
      </div>
    </div>
  );
};

export default AuthModeToggle;
