import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Moon, Sun, Monitor, Lock, Bell,
  CheckCircle, Eye, EyeOff, AlertCircle, KeyRound,
  ShieldCheck, Smartphone, Activity, GraduationCap,
  CalendarCheck, BookOpen, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${
      activeTab === id
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
    }`}
  >
    <Icon size={18} className={activeTab === id ? 'text-primary' : ''} />
    {label}
  </button>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
    <div>
      <p className="font-medium text-foreground">{label}</p>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null); // { type: 'success'|'error', text: string }

  // Notifications state (persisted to localStorage)
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notifSettings')) || {
        attendanceAlerts: true,
        gradeUpdates: true,
        systemAnnouncements: true,
        emailNotifications: false,
        smsNotifications: false,
        newStudentAdded: true,
        lowAttendanceWarning: true,
      };
    } catch { return { attendanceAlerts: true, gradeUpdates: true, systemAnnouncements: true, emailNotifications: false, smsNotifications: false, newStudentAdded: true, lowAttendanceWarning: true }; }
  });

  const handleNotifChange = (key, val) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    localStorage.setItem('notifSettings', JSON.stringify(updated));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and system settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-4">
          {/* Profile Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl mb-3 border-4 border-background shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-lg font-bold text-foreground">{user?.name || 'User'}</h2>
            <p className="text-muted-foreground text-sm mb-3">{user?.email}</p>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
              {user?.role}
            </span>
          </motion.div>

          {/* Nav */}
          <div className="bg-card border border-border rounded-xl p-2 shadow-sm space-y-1">
            <TabButton id="profile" label="Profile" icon={User} activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="security" label="Security" icon={Shield} activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="notifications" label="Notifications" icon={Bell} activeTab={activeTab} onClick={setActiveTab} />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* Appearance */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Monitor size={20} className="text-primary" />
                      Appearance
                    </h3>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Theme Preference</p>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
                    </div>
                    <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
                      <button
                        onClick={() => theme !== 'light' && toggleTheme()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Sun size={16} /> Light
                      </button>
                      <button
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Moon size={16} /> Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <User size={20} className="text-primary" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Full Name</label>
                        <input type="text" value={user?.name || ''} readOnly className="w-full px-4 py-2.5 bg-muted border border-border text-foreground rounded-lg cursor-not-allowed opacity-70" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-2.5 bg-muted border border-border text-foreground rounded-lg cursor-not-allowed opacity-70" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Role</label>
                      <input type="text" value={user?.role || ''} readOnly className="w-full px-4 py-2.5 bg-muted border border-border text-foreground rounded-lg cursor-not-allowed opacity-70" />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-500" />
                      Profile information is managed by the system administrator.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <motion.div key="security" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* Change Password */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Lock size={20} className="text-primary" />
                      Change Password
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Update your login password. Minimum 6 characters.</p>
                  </div>
                  <div className="p-6">
                    {passwordMsg && (
                      <div className={`mb-5 p-4 rounded-lg flex items-start gap-3 text-sm ${passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {passwordMsg.type === 'success' ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />}
                        {passwordMsg.text}
                      </div>
                    )}
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            required
                            className="w-full px-4 pr-12 py-2.5 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                          <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="Min. 6 characters"
                              required
                              className="w-full px-4 pr-12 py-2.5 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="Must match new password"
                              required
                              className="w-full px-4 pr-12 py-2.5 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button type="submit" disabled={passwordLoading} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-semibold shadow-sm shadow-primary/20 disabled:opacity-50">
                          <KeyRound size={16} />
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Session Info */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Activity size={20} className="text-primary" />
                      Active Session
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Smartphone size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Current Browser Session</p>
                          <p className="text-xs text-muted-foreground">Logged in as {user?.role} · Active now</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">Active</span>
                    </div>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <ShieldCheck size={20} className="text-primary" />
                      Security Tips
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      'Use a strong password with letters, numbers, and symbols.',
                      'Never share your login credentials with anyone.',
                      'Log out when using shared or public computers.',
                      'Change your password regularly for better security.',
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* In-App Alerts */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Bell size={20} className="text-primary" />
                      In-App Notifications
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Control which events trigger alerts inside the portal.</p>
                  </div>
                  <div className="px-6">
                    <Toggle checked={notifications.attendanceAlerts} onChange={v => handleNotifChange('attendanceAlerts', v)}
                      label="Attendance Alerts" description="Notify when attendance is marked for your classes." />
                    <Toggle checked={notifications.gradeUpdates} onChange={v => handleNotifChange('gradeUpdates', v)}
                      label="Grade Updates" description="Get notified when student grades are recorded or updated." />
                    <Toggle checked={notifications.newStudentAdded} onChange={v => handleNotifChange('newStudentAdded', v)}
                      label="New Student Added" description="Alert when the admin registers a new student." />
                    <Toggle checked={notifications.lowAttendanceWarning} onChange={v => handleNotifChange('lowAttendanceWarning', v)}
                      label="Low Attendance Warning" description="Warn when a student's attendance drops below 75%." />
                    <Toggle checked={notifications.systemAnnouncements} onChange={v => handleNotifChange('systemAnnouncements', v)}
                      label="System Announcements" description="Important system updates and maintenance notices." />
                  </div>
                </div>

                {/* External Channels */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare size={20} className="text-primary" />
                      External Channels
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Choose how you want to be notified outside the portal.</p>
                  </div>
                  <div className="px-6">
                    <Toggle checked={notifications.emailNotifications} onChange={v => handleNotifChange('emailNotifications', v)}
                      label="Email Notifications" description="Receive important alerts at your registered email address." />
                    <Toggle checked={notifications.smsNotifications} onChange={v => handleNotifChange('smsNotifications', v)}
                      label="SMS Notifications" description="Get critical alerts via text message on your phone." />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Preferences auto-saved</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your notification preferences are saved immediately and persist across sessions.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
