import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GabeUser, authenticate } from '../data/roles';

const STORAGE_KEY = 'gabe-user';

interface AuthContextValue {
  user: GabeUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => false,
  logout: () => {},
});

function loadUser(): GabeUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GabeUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GabeUser | null>(loadUser);

  const login = (username: string, password: string) => {
    const found = authenticate(username, password);
    if (found) {
      setUser(found);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
