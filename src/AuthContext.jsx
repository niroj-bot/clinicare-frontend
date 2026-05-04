import { createContext, useContext, useState } from 'react';
import { authApi } from './api';

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch { return true; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token  = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (!token || !stored || isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
      return JSON.parse(stored);
    } catch { return null; }
  });

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
    setUser({ name: data.name, email: data.email, role: data.role });
    return data;
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
    setUser({ name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Get redirect path after login based on role
  const getHomePath = (role) => {
    if (role === 'ADMIN')  return '/admin';
    if (role === 'CLINIC') return '/clinic';
    return '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getHomePath }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
