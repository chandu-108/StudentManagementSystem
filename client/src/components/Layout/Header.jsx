import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, Bell, CheckCheck, X, AlertTriangle, UserPlus, BookOpen, CalendarCheck, Info, Menu, Zap } from 'lucide-react';

const PAGE_TITLES = {
  '/':           { title: 'Dashboard',  sub: 'System overview & real-time analytics' },
  '/students':   { title: 'Students',   sub: 'Manage & track student records' },
  '/teachers':   { title: 'Teachers',   sub: 'Faculty management & assignments' },
  '/attendance': { title: 'Attendance', sub: 'Track & monitor daily attendance' },
  '/grades':     { title: 'Grades',     sub: 'Academic performance & reports' },
  '/settings':   { title: 'Settings',   sub: 'Preferences & system configuration' },
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'warning',
    icon: AlertTriangle,
    title: 'Low Attendance Alert',
    message: '6 students have attendance below 75% this week.',
    time: '2 min ago',
    read: false,
    color: 'text-amber-400 bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    id: 2,
    type: 'success',
    icon: CalendarCheck,
    title: 'Attendance Marked',
    message: 'Attendance for Data Structures has been saved successfully.',
    time: '18 min ago',
    read: false,
    color: 'text-emerald-400 bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    id: 3,
    type: 'info',
    icon: UserPlus,
    title: 'New Student Enrolled',
    message: 'Sneha Choudhary (CS2024029) has been successfully enrolled.',
    time: '1 hr ago',
    read: false,
    color: 'text-violet-400 bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    id: 4,
    type: 'info',
    icon: BookOpen,
    title: 'Grades Updated',
    message: 'Mid-term results for Python subject have been recorded.',
    time: '3 hrs ago',
    read: true,
    color: 'text-cyan-400 bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    id: 5,
    type: 'info',
    icon: Info,
    title: 'System Notice',
    message: 'Semester exam schedule will be published next Monday.',
    time: 'Yesterday',
    read: true,
    color: 'text-sky-400 bg-sky-500/10',
    border: 'border-sky-500/20',
  },
];

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div
      className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] sm:w-[380px] z-50 overflow-hidden rounded-2xl"
      style={{
        background: 'hsl(228 32% 9% / 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid hsl(228 28% 18%)',
        boxShadow: '0 0 0 1px hsl(258 90% 66% / 0.08), 0 24px 64px rgba(0,0,0,0.5)',
        maxWidth: '380px',
      }}
    >
      {/* Top glow */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(258 90% 66% / 0.6), transparent)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid hsl(228 28% 16%)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'hsl(258 90% 66% / 0.15)', border: '1px solid hsl(258 90% 66% / 0.25)' }}
          >
            <Bell size={12} style={{ color: 'hsl(258 90% 75%)' }} />
          </div>
          <h3 className="text-[13px] font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(258 80% 58%))' }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors px-2 py-1 rounded-lg"
            style={{ color: 'hsl(258 80% 72%)' }}
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[360px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'hsl(228 28% 14%)', border: '1px solid hsl(228 28% 18%)' }}
            >
              <Bell size={22} className="text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400">All caught up!</p>
            <p className="text-xs text-slate-600">No new notifications</p>
          </div>
        ) : (
          <div style={{ borderBottom: '1px solid transparent' }}>
            {notifications.map((notif, i) => (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className="group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                style={{
                  background: !notif.read ? 'hsl(258 90% 66% / 0.04)' : 'transparent',
                  borderBottom: i < notifications.length - 1 ? '1px solid hsl(228 28% 14%)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'hsl(258 90% 66% / 0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = !notif.read ? 'hsl(258 90% 66% / 0.04)' : 'transparent'}
              >
                {!notif.read && (
                  <span
                    className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'hsl(258 90% 70%)' }}
                  />
                )}
                <div className={`mt-0.5 w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${notif.color}`}
                  style={{ border: `1px solid ${notif.border || 'transparent'}` }}
                >
                  <notif.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12.5px] leading-tight mb-0.5 ${!notif.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                    {notif.title}
                  </p>
                  <p className="text-[11.5px] text-slate-500 leading-snug">{notif.message}</p>
                  <p className="text-[10.5px] text-slate-600 mt-1">{notif.time}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                  className="flex-shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-300 hover:bg-white/8 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid hsl(228 28% 16%)' }}>
          <button
            onClick={() => setNotifications([])}
            className="w-full text-[11.5px] font-semibold py-2 rounded-xl transition-colors text-slate-500 hover:text-slate-300 hover:bg-white/5"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'Portal', sub: '', icon: '🔮' };

  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(3);
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        bellRef.current && !bellRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setShowNotifs(prev => !prev);
    if (!showNotifs) setUnread(0);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header
      className="h-[60px] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20"
      style={{
        background: theme === 'dark' ? 'hsl(228 32% 8% / 0.9)' : 'hsl(0 0% 100% / 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: theme === 'dark' ? '1px solid hsl(228 28% 14%)' : '1px solid hsl(222 25% 88%)',
        boxShadow: theme === 'dark' ? '0 1px 0 0 hsl(228 30% 16% / 0.5)' : '0 1px 0 0 hsl(222 25% 90%)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-slate-400 hover:text-white"
          style={{ background: 'hsl(228 28% 14%)', border: '1px solid hsl(228 28% 18%)' }}
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>

        {/* Page title */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h2
              className="text-[15px] font-extrabold leading-tight tracking-tight"
              style={{ color: theme === 'dark' ? 'white' : 'hsl(222 47% 8%)' }}
            >
              {page.title}
            </h2>
            <div
              className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: 'hsl(258 90% 66% / 0.1)',
                border: '1px solid hsl(258 90% 66% / 0.2)',
              }}
            >
              <Zap size={9} style={{ color: 'hsl(258 90% 75%)' }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'hsl(258 80% 75%)' }}>
                Live
              </span>
            </div>
          </div>
          <p
            className="text-[11px] leading-none mt-0.5"
            style={{ color: theme === 'dark' ? 'hsl(218 16% 50%)' : 'hsl(222 20% 55%)' }}
          >
            {page.sub}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: theme === 'dark' ? 'hsl(228 28% 12%)' : 'hsl(222 20% 93%)',
            border: theme === 'dark' ? '1px solid hsl(228 28% 17%)' : '1px solid hsl(222 25% 86%)',
            color: theme === 'dark' ? '#94a3b8' : '#64748b',
          }}
        >
          {theme === 'dark'
            ? <Sun size={15} strokeWidth={2.5} className="text-amber-400" />
            : <Moon size={15} strokeWidth={2.5} className="text-violet-400" />
          }
        </button>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={handleBellClick}
            title="Notifications"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: showNotifs
                ? 'hsl(258 90% 66% / 0.15)'
                : theme === 'dark' ? 'hsl(228 28% 12%)' : 'hsl(222 20% 93%)',
              border: showNotifs
                ? '1px solid hsl(258 90% 66% / 0.3)'
                : theme === 'dark' ? '1px solid hsl(228 28% 17%)' : '1px solid hsl(222 25% 86%)',
              color: showNotifs ? 'hsl(258 80% 72%)' : theme === 'dark' ? '#94a3b8' : '#64748b',
            }}
          >
            <Bell size={15} strokeWidth={2.5} className={showNotifs ? 'text-violet-400' : ''} />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(330 90% 60%), hsl(330 80% 52%))',
                  boxShadow: '0 0 8px hsl(330 90% 60% / 0.5)',
                }}
              >
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div ref={panelRef}>
              <NotificationPanel onClose={() => setShowNotifs(false)} />
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="flex items-center gap-2.5 pl-3 ml-1"
          style={{ borderLeft: theme === 'dark' ? '1px solid hsl(228 28% 16%)' : '1px solid hsl(222 25% 88%)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(186 100% 45%))',
              boxShadow: '0 0 12px hsl(258 90% 66% / 0.35)',
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p
              className="text-[12.5px] font-bold leading-tight"
              style={{ color: theme === 'dark' ? 'white' : 'hsl(222 47% 10%)' }}
            >
              {user?.name?.split(' ')[0]}
            </p>
            <p className="text-[10px] font-medium leading-none mt-0.5" style={{ color: 'hsl(258 70% 60%)' }}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
