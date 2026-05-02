import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axios';
import { GraduationCap, Shield, BookOpen, User, Sparkles, ArrowRight, Eye, EyeOff, Zap } from 'lucide-react';

const ROLE_TABS = [
  {
    id: 'Admin',
    icon: Shield,
    label: 'Admin',
    desc: 'Full access',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'hsl(330 90% 60%)',
    activeText: 'text-rose-300',
    activeBg: 'hsl(330 90% 60% / 0.12)',
    activeBorder: 'hsl(330 90% 60% / 0.3)',
  },
  {
    id: 'Teacher',
    icon: BookOpen,
    label: 'Teacher',
    desc: 'Faculty',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'hsl(38 92% 50%)',
    activeText: 'text-amber-300',
    activeBg: 'hsl(38 92% 50% / 0.12)',
    activeBorder: 'hsl(38 92% 50% / 0.3)',
  },
  {
    id: 'Student',
    icon: GraduationCap,
    label: 'Student',
    desc: 'Learner',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'hsl(186 100% 50%)',
    activeText: 'text-cyan-300',
    activeBg: 'hsl(186 100% 50% / 0.12)',
    activeBorder: 'hsl(186 100% 50% / 0.3)',
  },
];

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Faculty' },
  { value: '98%', label: 'Satisfaction' },
];

const Login = () => {
  const [role, setRole] = useState('Admin');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" />;

  const activeTab = ROLE_TABS.find(t => t.id === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password, role });
        login(res.data, res.data.token, res.data.refreshToken);
        navigate('/');
      } else {
        const res = await api.post('/auth/register', { name, email, password, role });
        login(res.data, res.data.token, res.data.refreshToken);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex font-sans overflow-hidden"
      style={{
        background: 'hsl(230 35% 5%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Left Panel — Hero ── */}
      <div
        className="hidden md:flex md:w-[52%] flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(258 60% 12%) 0%, hsl(230 50% 8%) 40%, hsl(200 50% 8%) 100%)',
        }}
      >
        {/* Animated orbs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(258 90% 66% / 0.18), transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float-orb 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(186 100% 50% / 0.12), transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float-orb 13s ease-in-out infinite reverse',
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(258 90% 66% / 0.1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(258 90% 66% / 0.5), transparent)' }}
        />

        {/* Content */}
        <div className="relative z-10 p-10 lg:p-14 flex flex-col h-full justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(186 100% 50%))',
                boxShadow: '0 0 24px hsl(258 90% 66% / 0.5)',
              }}
            >
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-lg tracking-tight leading-none">StudentManagementSystem</p>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5"
                style={{ color: 'hsl(258 60% 70%)' }}
              >
                Smart Portal
              </p>
            </div>
          </div>

          {/* Hero text */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'hsl(258 90% 66% / 0.12)',
                border: '1px solid hsl(258 90% 66% / 0.25)',
              }}
            >
              <Zap size={12} style={{ color: 'hsl(258 80% 75%)' }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'hsl(258 70% 78%)' }}>
                Next-Gen Education Platform
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
              Streamline your{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, hsl(258 90% 78%), hsl(186 100% 60%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                academic operations
              </span>
            </h1>

            <p className="text-[15px] leading-relaxed mb-10" style={{ color: 'hsl(228 20% 60%)' }}>
              Manage students, attendance, grades, and analytics — all in one beautifully crafted platform designed for modern institutions.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'hsl(228 32% 10% / 0.6)',
                    border: '1px solid hsl(228 28% 18%)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <p
                    className="text-2xl font-black leading-none mb-1"
                    style={{
                      background: `linear-gradient(135deg, ${
                        i === 0 ? 'hsl(258 90% 78%), hsl(186 100% 60%)' :
                        i === 1 ? 'hsl(160 84% 60%), hsl(186 100% 55%)' :
                                  'hsl(330 90% 70%), hsl(258 80% 75%)'
                      })`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'hsl(228 20% 45%)' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[12px]" style={{ color: 'hsl(228 20% 35%)' }}>
            © 2026 StudentManagementSystem. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel — Auth ── */}
      <div
        className="w-full md:w-[48%] flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto"
        style={{
          background: 'hsl(228 30% 7%)',
          borderLeft: '1px solid hsl(228 28% 13%)',
        }}
      >
        {/* Ambient glow behind form */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(258 90% 66% / 0.06), transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(186 100% 50%))',
                boxShadow: '0 0 20px hsl(258 90% 66% / 0.4)',
              }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base tracking-tight leading-none">StudentManagementSystem</p>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5" style={{ color: 'hsl(258 60% 70%)' }}>Smart Portal</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-black text-white leading-tight tracking-tight mb-1.5">
              {isLogin ? 'Welcome back 👋' : 'Create account ✨'}
            </h2>
            <p className="text-[14px]" style={{ color: 'hsl(228 20% 50%)' }}>
              {isLogin ? 'Sign in to access your personalized dashboard' : 'Join StudentManagementSystem and get started today'}
            </p>
          </div>

          {/* Role selector */}
          <div
            className="flex p-1 rounded-2xl mb-7 gap-1"
            style={{ background: 'hsl(228 30% 10%)', border: '1px solid hsl(228 28% 16%)' }}
          >
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRole(tab.id);
                  if (tab.id === 'Admin') setIsLogin(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[12px] font-bold transition-all duration-200"
                style={{
                  background: role === tab.id ? tab.activeBg : 'transparent',
                  border: `1px solid ${role === tab.id ? tab.activeBorder : 'transparent'}`,
                  color: role === tab.id ? 'white' : 'hsl(228 20% 45%)',
                  boxShadow: role === tab.id ? `0 0 16px ${tab.glow} / 0.15` : 'none',
                }}
              >
                <tab.icon size={14} className={role === tab.id ? tab.activeText : ''} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 px-4 py-3.5 rounded-xl text-[13px] font-medium"
              style={{
                background: 'hsl(0 84% 60% / 0.1)',
                border: '1px solid hsl(0 84% 60% / 0.25)',
                color: 'hsl(0 80% 70%)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {!isLogin && (
              <div>
                <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'hsl(228 20% 50%)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={!isLogin}
                  autoComplete="off"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl text-[14px] transition-all duration-200 outline-none"
                  style={{
                    background: 'hsl(228 30% 10%)',
                    border: '1px solid hsl(228 28% 18%)',
                    color: 'white',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid hsl(258 90% 66% / 0.5)'; e.target.style.boxShadow = '0 0 0 3px hsl(258 90% 66% / 0.1)'; }}
                  onBlur={e => { e.target.style.border = '1px solid hsl(228 28% 18%)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div>
              <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'hsl(228 20% 50%)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="off"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-[14px] transition-all duration-200 outline-none"
                style={{
                  background: 'hsl(228 30% 10%)',
                  border: '1px solid hsl(228 28% 18%)',
                  color: 'white',
                }}
                onFocus={e => { e.target.style.border = '1px solid hsl(258 90% 66% / 0.5)'; e.target.style.boxShadow = '0 0 0 3px hsl(258 90% 66% / 0.1)'; }}
                onBlur={e => { e.target.style.border = '1px solid hsl(228 28% 18%)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'hsl(228 20% 50%)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-[14px] transition-all duration-200 outline-none"
                  style={{
                    background: 'hsl(228 30% 10%)',
                    border: '1px solid hsl(228 28% 18%)',
                    color: 'white',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid hsl(258 90% 66% / 0.5)'; e.target.style.boxShadow = '0 0 0 3px hsl(258 90% 66% / 0.1)'; }}
                  onBlur={e => { e.target.style.border = '1px solid hsl(228 28% 18%)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'hsl(228 20% 45%)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl text-[14px] font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{
                background: loading
                  ? 'hsl(228 28% 18%)'
                  : 'linear-gradient(135deg, hsl(258 90% 66%), hsl(258 75% 55%))',
                boxShadow: loading ? 'none' : '0 4px 20px hsl(258 90% 66% / 0.4)',
                transform: loading ? 'none' : undefined,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 30px hsl(258 90% 66% / 0.6)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 20px hsl(258 90% 66% / 0.4)'; }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? `Sign in as ${role}` : `Create ${role} account`}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          {role !== 'Admin' && (
            <div className="mt-6 text-center">
              <p className="text-[13px]" style={{ color: 'hsl(228 20% 45%)' }}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold transition-colors"
                  style={{ color: 'hsl(258 80% 75%)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'hsl(258 90% 85%)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'hsl(258 80% 75%)'}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}

          {role === 'Admin' && isLogin && (
            <div className="mt-6 text-center">
              <p
                className="text-[11.5px] px-4 py-2 rounded-xl inline-block"
                style={{
                  color: 'hsl(228 20% 40%)',
                  background: 'hsl(228 28% 10%)',
                  border: '1px solid hsl(228 28% 15%)',
                }}
              >
                🔐 Use admin credentials from your .env file
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
