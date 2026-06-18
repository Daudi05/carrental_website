import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cr_user') || 'null'); } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, refresh_token, user } = res.data.data;
    localStorage.setItem('cr_token', access_token);
    localStorage.setItem('cr_refresh', refresh_token);
    localStorage.setItem('cr_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const { access_token, refresh_token, user } = res.data.data;
    localStorage.setItem('cr_token', access_token);
    localStorage.setItem('cr_refresh', refresh_token);
    localStorage.setItem('cr_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_refresh');
    localStorage.removeItem('cr_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      const updated = res.data.data;
      localStorage.setItem('cr_user', JSON.stringify(updated));
      setUser(updated);
    } catch {}
  }, []);

  const isAdmin    = () => ['super_admin','branch_manager'].includes(user?.role?.name);
  const isStaff    = () => ['super_admin','branch_manager','staff'].includes(user?.role?.name);
  const isSuperAdmin = () => user?.role?.name === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isAdmin, isStaff, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
