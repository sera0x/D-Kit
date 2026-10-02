import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, AUTH_CHANGED_EVENT } from '../lib/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'dkit_auth';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored);

  // lib/api.js rotates tokens in the background whenever the access token
  // expires. It raises this event so React state follows what's on disk —
  // otherwise components would keep passing the stale token to api calls.
  useEffect(() => {
    const sync = () => setAuth(loadStored());
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync); // other tabs
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const login = useCallback((user, token, refreshToken) => {
    const next = { user, token, refresh_token: refreshToken || null };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setAuth(next);
  }, []);

  const logout = useCallback(() => {
    // Best-effort revocation of the server-side session; local state is
    // cleared either way so a network failure can't trap the user inside.
    const current = loadStored();
    if (current?.refresh_token) api.logout(current.refresh_token);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user || null,
        token: auth?.token || null,
        refreshToken: auth?.refresh_token || null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
