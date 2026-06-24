'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function normalizeUser(raw: any): User {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.fullName || `${raw.firstName || ''} ${raw.lastName || ''}`.trim(),
    role: raw.role || (raw.userRoles?.[0]?.role?.slug) || 'member',
    isActive: raw.isActive,
    roles: raw.roles || raw.userRoles?.map((ur: any) => ur.role?.slug) || [],
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/auth/me');
      setUser(normalizeUser(res.data.data));
    } catch {
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    setUser(normalizeUser(data.data.user));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
