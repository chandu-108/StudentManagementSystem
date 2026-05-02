import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, GraduationCap,
  Settings, BookOpen, LogOut, ChevronLeft, ChevronRight, X,
  Sparkles, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { name: 'Dashboard',  path: '/',           icon: LayoutDashboard, tag: null,   color: 'from-violet-500 to-purple-600' },
  { name: 'Students',   path: '/students',   icon: Users,           tag: null,   color: 'from-cyan-500 to-blue-600' },
  { name: 'Teachers',   path: '/teachers',   icon: BookOpen,        tag: null,   color: 'from-emerald-500 to-teal-600' },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck,   tag: 'Live', color: 'from-amber-500 to-orange-600' },
  { name: 'Grades',     path: '/grades',     icon: GraduationCap,   tag: null,   color: 'from-rose-500 to-pink-600' },
  { name: 'Scholarship',path: '/scholarship',icon: Award,           tag: null,   color: 'from-yellow-500 to-amber-600' },
  { name: 'Settings',   path: '/settings',   icon: Settings,        tag: null,   color: 'from-slate-400 to-slate-600' },
];

const ROLE_CONFIG = {
  Admin:   { gradient: 'from-rose-500 to-pink-600',    text: 'text-rose-400',   ring: 'ring-rose-500/30',   label: 'Administrator' },
  Teacher: { gradient: 'from-amber-500 to-orange-600', text: 'text-amber-400',  ring: 'ring-amber-500/30',  label: 'Faculty' },
  Student: { gradient: 'from-cyan-500 to-blue-600',    text: 'text-cyan-400',   ring: 'ring-cyan-500/30',   label: 'Student' },
};

const Sidebar = ({ mobile = false, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isCollapsed = mobile ? false : collapsed;
  const isDark = theme === 'dark';

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.Student;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── theme-aware colours ───────────────────────────────────────────────────
  const bg           = isDark ? 'linear-gradient(180deg, hsl(228 35% 7%) 0%, hsl(230 32% 6%) 100%)'
                               : 'linear-gradient(180deg, hsl(222 47% 98%) 0%, hsl(222 30% 95%) 100%)';
  const border       = isDark ? 'hsl(228 28% 15%)'   : 'hsl(222 25% 86%)';
  const divider      = isDark ? 'hsl(228 28% 14%)'   : 'hsl(222 25% 88%)';
  const labelColor   = isDark ? 'hsl(228 20% 40%)'   : 'hsl(222 20% 55%)';
  const inactiveNav  = isDark ? '#94a3b8'             : '#64748b';
  const hoverNavBg   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const glowTop      = isDark ? 'hsl(258 90% 66% / 0.5)' : 'hsl(258 90% 66% / 0.3)';
  const userHoverBg  = isDark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.04)';
  const logoutHoverBg = isDark ? 'hsl(0 84% 60% / 0.1)'  : 'hsl(0 84% 60% / 0.08)';
  const brandName    = isDark ? 'white' : 'hsl(222 47% 10%)';
  const brandSub     = isDark ? 'hsl(258 60% 70%)'   : 'hsl(258 60% 55%)';
  const toggleColor  = isDark ? '#64748b'             : '#94a3b8';
  const userNameCol  = isDark ? 'white'               : 'hsl(222 47% 10%)';

  return (
    <aside
      className={`flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0 relative ${
        isCollapsed ? 'w-[72px]' : mobile ? 'w-[260px]' : 'w-[240px]'
      }`}
      style={{ background: bg, borderRight: `1px solid ${border}` }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${glowTop}, transparent)` }} />
      {isDark && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(258 90% 66% / 0.07), transparent 70%)', filter: 'blur(20px)' }} />
      )}

      {/* ── Logo (fixed height, never scrolls) ── */}
      <div
        className={`relative flex items-center h-[60px] px-4 gap-3 flex-shrink-0 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(186 100% 50%))',
            boxShadow: '0 4px 14px hsl(258 90% 66% / 0.4)',
          }}>
          <Sparkles size={16} className="text-white" />
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <span className="font-extrabold text-[13.5px] tracking-tight leading-tight block" style={{ color: brandName }}>
              StudentManagementSystem
            </span>
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase block" style={{ color: brandSub }}>
              Smart Portal
            </span>
          </div>
        )}

        {mobile ? (
          <button onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
            style={{ color: toggleColor }}>
            <X size={16} />
          </button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            style={{ color: toggleColor }}>
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* ── Nav (scrollable middle) ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 min-h-0">
        {!isCollapsed && (
          <p className="text-[9.5px] font-black uppercase tracking-[0.18em] px-3 mb-3"
            style={{ color: labelColor }}>
            Main Menu
          </p>
        )}

        <ul className="space-y-0.5">
          {navItems.map(item => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-white' : ''
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: 'linear-gradient(135deg, hsl(258 90% 66% / 0.18), hsl(258 90% 66% / 0.06))',
                  border: '1px solid hsl(258 90% 66% / 0.25)',
                  boxShadow: '0 0 16px hsl(258 90% 66% / 0.12)',
                  color: 'white',
                } : {
                  border: '1px solid transparent',
                  color: inactiveNav,
                }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: 'linear-gradient(180deg, hsl(258 90% 70%), hsl(186 100% 55%))' }} />
                    )}

                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isActive ? `bg-gradient-to-br ${item.color}` : ''
                      }`}
                      style={{
                        ...(isActive ? { boxShadow: '0 2px 8px hsl(258 90% 66% / 0.3)' } : {}),
                        ...(!isActive ? { background: 'transparent' } : {}),
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverNavBg; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <item.icon size={15} style={{ color: isActive ? 'white' : inactiveNav }} />
                    </div>

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 font-semibold text-[13px]">{item.name}</span>
                        {item.tag && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={{
                              background: 'hsl(160 84% 39% / 0.15)',
                              color: 'hsl(160 84% 55%)',
                              border: '1px solid hsl(160 84% 39% / 0.3)',
                            }}>
                            {item.tag}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── User Footer (always pinned to bottom, NEVER scrolls away) ── */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: `1px solid ${divider}` }}
      >
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors cursor-default ${
            isCollapsed ? 'justify-center flex-col' : ''
          }`}
          style={{ background: userHoverBg }}
        >
          {/* Avatar with online dot */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white ring-2 ${roleConfig.ring} bg-gradient-to-br ${roleConfig.gradient}`}
              style={{ boxShadow: '0 0 12px hsl(258 90% 66% / 0.2)' }}
            >
              {initials}
            </div>
            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: 'hsl(160 84% 45%)',
                border: `2px solid ${isDark ? 'hsl(228 35% 7%)' : 'hsl(222 47% 98%)'}`,
              }}
            />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold truncate leading-tight" style={{ color: userNameCol }}>
                {user?.name || 'Admin User'}
              </p>
              <p className={`text-[10px] font-semibold ${roleConfig.text} leading-none mt-0.5`}>
                {roleConfig.label}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Logout"
            className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-150"
            style={{ color: toggleColor }}
            onMouseEnter={e => {
              e.currentTarget.style.background = logoutHoverBg;
              e.currentTarget.style.color = 'hsl(0 84% 65%)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = toggleColor;
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
