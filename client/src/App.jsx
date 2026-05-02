import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Teachers from './pages/Teachers';
import Grades from './pages/Grades';
import Settings from './pages/Settings';
import Scholarship from './pages/Scholarship';

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect /login to home — no login needed */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/students" element={<Layout><Students /></Layout>} />
      <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
      <Route path="/teachers" element={<Layout><Teachers /></Layout>} />
      <Route path="/grades" element={<Layout><Grades /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/scholarship" element={<Layout><Scholarship /></Layout>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
