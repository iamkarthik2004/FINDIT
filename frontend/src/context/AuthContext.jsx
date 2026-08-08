import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('findit_user')) || null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem('findit_token')));

  useEffect(() => {
    let active = true;
    const storedToken = localStorage.getItem('findit_token');
    if (!storedToken) return undefined;

    authService.getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        localStorage.setItem('findit_user', JSON.stringify(currentUser));
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        localStorage.removeItem('findit_user');
        localStorage.removeItem('findit_token');
      })
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user && localStorage.getItem('findit_token')),
      login: (u) => {
        setUser(u);
        localStorage.setItem('findit_user', JSON.stringify(u));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem('findit_user');
        localStorage.removeItem('findit_token');
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
