import { useEffect, useState } from 'react';
import api from '../services/api';

const VITE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const useGoogleClientId = () => {
  const [clientId, setClientId] = useState(VITE_CLIENT_ID);
  const [loading, setLoading] = useState(!VITE_CLIENT_ID);

  useEffect(() => {
    if (VITE_CLIENT_ID) return;

    let cancelled = false;
    api
      .get('/auth/google-config')
      .then((res) => {
        if (!cancelled && res.data?.clientId) {
          setClientId(res.data.clientId);
        }
      })
      .catch(() => {
        // Backend unreachable or route missing — button stays in setup state
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    clientId,
    loading,
    enabled: Boolean(clientId),
  };
};
