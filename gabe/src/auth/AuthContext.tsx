import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GabeUser } from '../data/roles';
import { loginRequest, setToken, clearToken, getToken } from '../data/api';
import { refreshProjects } from '../data/projectStore';

const USER_KEY = 'propdev-user';

interface AuthContextValue {
  user: GabeUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => false,
  logout: () => {},
});

function loadUser(): GabeUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && getToken() ? (JSON.parse(raw) as GabeUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GabeUser | null>(loadUser);

  // On load with an existing token, pull projects from the server.
  useEffect(() => {
    if (user && getToken()) refreshProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    if (!result) return false;
    setToken(result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user as GabeUser);
    refreshProjects();
    return true;
  };

  const logout = () => {
    setUser(null);
    clearToken();
    localStorage.removeItem(USER_KEY);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
