import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Building2, CalendarCheck, TrendingUp,
  ArrowUpRight, Clock, BarChart2, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Sector
} from 'recharts';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const GRADE_COLORS = {
  'Grade A': '#10b981', 'Grade B': '#6366f1',
  'Grade C': '#f59e0b', 'Grade F': '#ef4444',
};
const GRADE_LABELS = {
  'Grade A': '90–100', 'Grade B': '75–89',
  'Grade C': '60–74', 'Grade F': '<60',
};
const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

function getGreeting(name) {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const first = name?.split(' ')[0] || 'there';
  return `${part}, ${first} 👋`;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

const ActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill={fill} fontSize={20} fontWeight={700}>{value}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill={fill} fontSize={12} fontWeight={600}>{payload.name}</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={11}>{(percent * 100).toFixed(1)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 5} outerRadius={innerRadius - 2} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
};

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-primary font-bold">{payload[0].value} students</p>
    </div>
  );
};

const STAT_STYLES = [
  { grad: 'linear-gradient(135deg, hsl(258 90% 66%), hsl(258 75% 55%))', glow: 'hsl(258 90% 66% / 0.35)', border: 'hsl(258 90% 66% / 0.25)' },
  { grad: 'linear-gradient(135deg, hsl(280 80% 60%), hsl(258 80% 55%))', glow: 'hsl(280 80% 60% / 0.35)', border: 'hsl(280 80% 60% / 0.25)' },
  { grad: 'linear-gradient(135deg, hsl(160 84% 45%), hsl(160 70% 38%))', glow: 'hsl(160 84% 45% / 0.35)', border: 'hsl(160 84% 45% / 0.25)' },
  { grad: 'linear-gradient(135deg, hsl(186 100% 45%), hsl(200 90% 40%))', glow: 'hsl(186 100% 45% / 0.35)', border: 'hsl(186 100% 45% / 0.25)' },
];

const StatCard = ({ title, value, sub, icon: Icon, delay, styleIdx = 0 }) => {
  const s = STAT_STYLES[styleIdx % STAT_STYLES.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden flex flex-col gap-4 p-5 rounded-[18px] card-glass"
      style={{ borderColor: s.border }}
    >
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full -translate-y-6 translate-x-6 pointer-events-none"
        style={{ background: s.glow, filter: 'blur(24px)', opacity: 0.55 }}
      />
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: s.grad, boxShadow: `0 4px 14px ${s.glow}` }}
        >
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] mt-1 text-muted-foreground">
          {title}
        </span>
      </div>
      <div>
        <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
        {sub && <p className="text-xs mt-0.5 text-muted-foreground">{sub}</p>}
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePieIdx, setActivePieIdx] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/charts')])
      .then(([s, c]) => { setStats(s.data); setCharts(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const barData = charts?.barChartData?.length > 0 ? charts.barChartData
    : [{ name: 'CS', value: 0 }, { name: 'IT', value: 0 }];

  const pieData = (charts?.pieChartData || []).filter(d => d.value > 0);
  const totalGraded = pieData.reduce((s, d) => s + d.value, 0);

  const attPct = stats?.attendancePercentage || 0;

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-muted rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-muted rounded-2xl" />
        <div className="h-72 bg-muted rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 overflow-hidden hero-gradient border border-primary/25 shadow-lg dark:shadow-[0_0_40px_hsl(258_90%_66%/0.12),0_8px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">{getGreeting(user?.name)}</h1>
            <p className="text-sm mt-1.5 flex items-center gap-1.5 text-muted-foreground">
              <Clock size={13} />{todayLabel()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center rounded-xl px-4 py-2.5 bg-card/85 backdrop-blur-md border border-border">
              <p className="text-2xl font-black text-foreground">{stats?.totalStudents || 0}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Students</p>
            </div>
            <div
              className="text-center rounded-xl px-4 py-2.5 backdrop-blur-md border"
              style={{
                background: attPct >= 75 ? 'hsl(160 84% 39% / 0.12)' : 'hsl(0 84% 60% / 0.1)',
                borderColor: attPct >= 75 ? 'hsl(160 84% 39% / 0.35)' : 'hsl(0 84% 60% / 0.35)',
              }}
            >
              <p className="text-2xl font-black text-foreground">{attPct}%</p>
              <p
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: attPct >= 75 ? 'hsl(160 84% 42%)' : 'hsl(0 72% 52%)' }}
              >
                Attendance
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} sub="enrolled this semester" icon={Users} delay={0.05} styleIdx={0} />
        <StatCard title="Faculty" value={stats?.totalTeachers || 0} sub="active instructors" icon={BookOpen} delay={0.1} styleIdx={1} />
        <StatCard title="Departments" value={stats?.totalDepartments || 0} sub="academic divisions" icon={Building2} delay={0.15} styleIdx={2} />
        <StatCard title="Attendance" value={`${attPct}%`} sub={attPct >= 75 ? '✓ On track' : '⚠ Needs attention'} icon={CalendarCheck} delay={0.2} styleIdx={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-3 p-6 rounded-[18px] card-glass"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-foreground">Enrollment by Department</h3>
              <p className="text-xs mt-0.5 text-muted-foreground">Students registered per department</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-lg">
              <BarChart2 size={13} /> Live
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barCategoryGap="38%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip content={<BarTip />} cursor={{ fill: 'hsl(var(--muted))', radius: 6 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-[18px] card-glass"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-foreground">Grade Split</h3>
              <p className="text-xs mt-0.5 text-muted-foreground">
                {totalGraded > 0 ? `${totalGraded} records` : 'No grades yet'}
              </p>
            </div>
            <Activity size={16} className="text-muted-foreground" />
          </div>

          {totalGraded === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <BarChart2 size={22} className="opacity-30" />
              </div>
              <p className="text-sm font-medium">No grades recorded yet</p>
            </div>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie activeIndex={activePieIdx} activeShape={ActiveShape}
                      data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                      paddingAngle={3} dataKey="value"
                      onMouseEnter={(_, i) => setActivePieIdx(i)}
                    >
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={GRADE_COLORS[e.name] || BAR_COLORS[i]} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5">
                {pieData.map((d, i) => {
                  const pct = totalGraded > 0 ? ((d.value / totalGraded) * 100).toFixed(1) : 0;
                  return (
                    <div key={d.name}
                      className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-muted/50 transition-colors"
                      onMouseEnter={() => setActivePieIdx(i)}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: GRADE_COLORS[d.name] }} />
                      <span className="text-xs font-medium text-foreground flex-1">{d.name}</span>
                      <span className="text-[10px] text-muted-foreground">{GRADE_LABELS[d.name]}</span>
                      <span className="text-xs font-bold text-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-5 rounded-[18px] card-glass"
        >
          <h3 className="font-bold mb-4 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Add Student',     href: '/students',   color: 'text-primary',  bg: 'bg-primary/10' },
              { label: 'Mark Attendance', href: '/attendance', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Record Grades',   href: '/grades',     color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10' },
              { label: 'Manage Teachers', href: '/teachers',   color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-500/10' },
            ].map(a => (
              <a key={a.label} href={a.href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/80 group transition-colors"
              >
                <span className={`w-8 h-8 rounded-lg ${a.bg} ${a.color} flex items-center justify-center flex-shrink-0`}>
                  <ArrowUpRight size={14} />
                </span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {a.label}
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-[18px] card-glass"
        >
          <h3 className="font-bold mb-4 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Department Breakdown</h3>
          {barData.every(d => d.value === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {barData.map((d, i) => {
                const max = Math.max(...barData.map(x => x.value));
                const w = max > 0 ? Math.round((d.value / max) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-foreground">{d.name}</span>
                      <span className="text-muted-foreground">{d.value}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-5 rounded-[18px] card-glass"
        >
          <h3 className="font-bold mb-4 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">System Metrics</h3>
          <div className="space-y-3">
            {[
              {
                label: 'Student : Teacher',
                value: stats?.totalTeachers > 0 ? `${Math.round(stats.totalStudents / stats.totalTeachers)}:1` : '—',
                color: 'text-primary'
              },
              {
                label: 'Total Staff',
                value: (stats?.totalTeachers || 0) + 1,
                color: 'text-violet-600 dark:text-violet-400'
              },
              {
                label: "Today's Attendance",
                value: `${attPct}%`,
                color: attPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              },
              {
                label: 'Active Departments',
                value: stats?.totalDepartments || 0,
                color: 'text-emerald-600 dark:text-emerald-400'
              },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <span className={`text-base font-black ${m.color}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
