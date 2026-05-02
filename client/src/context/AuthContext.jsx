import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// ─── DEMO MODE ──────────────────────────────────────────────────────────────
// Skip login/signup UI; dashboard opens immediately. API data requires the server
// to set ALLOW_ANONYMOUS_ACCESS=true (uses first Admin user in DB — run /api/seed).
const DEMO_MODE = true;

const DEMO_USER = {
  name: 'Admin User',
  email: 'admin@studentmanagementsystem.com',
  role: 'Admin',
};
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEMO_MODE ? DEMO_USER : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!DEMO_MODE) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token, refreshToken) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  };

  const logout = () => {
    if (DEMO_MODE) return; // prevent logout in demo mode
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
