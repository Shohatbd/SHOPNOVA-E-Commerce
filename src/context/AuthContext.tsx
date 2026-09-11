import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import { api, getAuthToken, setAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message: string; requiresPasswordChange?: boolean }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      }
    } catch {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login({ identifier, password: pass });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    const res = await api.register({ name, email, password: pass, phone });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role_id === 'admin' || user?.role_id === 'super_admin';
  const isSuperAdmin = user?.role_id === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
