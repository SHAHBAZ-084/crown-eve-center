import React, { useEffect, useRef, useState } from 'react';
import { useGoogleClientId } from '../../hooks/useGoogleClientId';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

const loadGsiScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('GSI script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GSI script failed'));
    document.head.appendChild(script);
  });

const waitForGoogleButton = (container, maxMs = 12000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      const hasButton =
        container?.querySelector('[role="button"]') ||
        container?.querySelector('iframe');

      if (hasButton) {
        resolve();
        return;
      }

      if (Date.now() - started > maxMs) {
        reject(new Error('Google button timed out'));
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });

const GoogleAuthSection = ({ onSuccess, onError, disabled = false, mode = 'signin' }) => {
  const { clientId, loading, enabled } = useGoogleClientId();
  const buttonRef = useRef(null);
  const [gsiReady, setGsiReady] = useState(false);
  const [gsiError, setGsiError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const label = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  useEffect(() => {
    setGsiReady(false);
    setGsiError(false);

    if (!enabled || !clientId) return undefined;

    let cancelled = false;

    const boot = async () => {
      try {
        await loadGsiScript();
        const mount = buttonRef.current;
        if (cancelled || !mount) return;

        const { google } = window;
        if (!google?.accounts?.id) {
          throw new Error('Google Identity Services unavailable');
        }

        mount.innerHTML = '';

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Google did not return a sign-in token.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const width = Math.min(Math.max(mount.parentElement?.clientWidth || 400, 280), 400);

        google.accounts.id.renderButton(mount, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          width,
        });

        await waitForGoogleButton(mount);
        if (!cancelled) setGsiReady(true);
      } catch {
        if (!cancelled) setGsiError(true);
      }
    };

    boot();

    return () => {
      cancelled = true;
      if (buttonRef.current) buttonRef.current.innerHTML = '';
    };
  }, [clientId, enabled, mode, onSuccess, onError, retryKey]);

  const handleMissingConfig = () => {
    onError?.(
      'Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID on the API server (Hostinger env).'
    );
  };

  const handleRetry = () => {
    setGsiError(false);
    setGsiReady(false);
    if (buttonRef.current) buttonRef.current.innerHTML = '';
    setRetryKey((key) => key + 1);
  };

  return (
    <>
      {!enabled && !loading && (
        <button
          type="button"
          className="auth-google-custom"
          disabled={disabled}
          onClick={handleMissingConfig}
        >
          <GoogleIcon />
          <span>{label}</span>
        </button>
      )}

      {enabled && !gsiReady && (
        <button type="button" className="auth-google-custom" disabled>
          <GoogleIcon />
          <span>{gsiError ? 'Google sign-in unavailable' : 'Loading Google…'}</span>
        </button>
      )}

      {enabled && gsiError && (
        <button type="button" className="auth-google-retry" onClick={handleRetry}>
          Retry Google sign-in
        </button>
      )}

      {enabled && (
        <div
          ref={buttonRef}
          className={`auth-google-wrap${gsiReady ? '' : ' auth-google-wrap--offscreen'}${disabled ? ' auth-google-wrap--disabled' : ''}`}
          aria-hidden={!gsiReady}
        />
      )}

      <div className="form-divider">or</div>
    </>
  );
};

export default GoogleAuthSection;
