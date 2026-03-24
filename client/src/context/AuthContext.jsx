import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employeeProfileId, setEmployeeProfileId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setEmployeeProfileId(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
      setEmployeeProfileId(data.employeeProfileId);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setEmployeeProfileId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setEmployeeProfileId(data.employeeProfileId ?? null);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/api/auth/signup', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setEmployeeProfileId(data.employeeProfileId ?? null);
    return data;
  };

  const signupWithInvite = async (payload) => {
    const { data } = await api.post('/api/auth/signup-with-invite', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setEmployeeProfileId(data.employeeProfileId ?? null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setEmployeeProfileId(null);
  };

  const value = useMemo(
    () => ({
      user,
      employeeProfileId,
      loading,
      login,
      signup,
      signupWithInvite,
      logout,
      refresh: loadMe,
    }),
    [user, employeeProfileId, loading, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
