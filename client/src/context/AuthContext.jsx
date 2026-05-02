import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// All users get full Admin access — no login required
const ADMIN_USER = {
  name: 'Admin User',
  email: 'admin@studentmanagementsystem.com',
  role: 'Admin',
};

export const AuthProvider = ({ children }) => {
  const [user] = useState(ADMIN_USER);

  // No-op stubs kept for compatibility
  const login = () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
