import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/api/auth/me')
      .then((data) => { if (mounted) setUser(data.user ?? null); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const data = await api.post('/api/auth/login', { email, password });
      setUser(data.user);
      return data;
    },
    async logout() {
      await api.post('/api/auth/logout', {});
      setUser(null);
    },
    has(permission) {
      return user?.permissions?.includes(permission) || user?.role_name === 'admin';
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
