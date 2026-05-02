import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronDown, CheckCircle2, Save } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  Present: { bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', label: 'Present' },
  Absent:  { bg: 'bg-red-500/15 text-red-600 border-red-500/30', label: 'Absent' },
  Late:    { bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30', label: 'Late' },
  Leave:   { bg: 'bg-blue-500/15 text-blue-600 border-blue-500/30', label: 'Leave' },
};

const Toast = ({ message, type }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border animate-in fade-in slide-in-from-bottom-2 ${
    type === 'success'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      : 'bg-red-500/10 text-red-600 border-red-500/20'
  }`}>
    <CheckCircle2 size={16} />
    {message}
  </div>
);

const SUBJECTS = ['Data Structures', 'C', 'Python', 'Java', 'DBMS'];

const Attendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: status }
  const [savingStudents, setSavingStudents] = useState({}); // { studentId: bool }
  const [loading, setLoading] = useState(true);
  const [overallAttendance, setOverallAttendance] = useState({});
  const [toast, setToast] = useState(null);

  const [subject, setSubject] = useState('Data Structures');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch students once
  useEffect(() => {
    api.get('/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error('Error fetching students:', err));
  }, []);

  // Fetch saved attendance when date or subject changes
  useEffect(() => {
    if (!students.length) return;
    setLoading(true);
    api.get(`/attendance/daily?date=${date}&subject=${subject}`)
      .then(res => {
        const map = {};
        res.data.forEach(record => {
          map[record.student] = record.status;
        });
        setAttendanceData(map);
      })
      .catch(err => console.error('Error fetching attendance:', err))
      .finally(() => setLoading(false));
  }, [date, subject, students]);

  // Fetch overall per-student attendance for this subject
  useEffect(() => {
    api.get(`/attendance/overall?subject=${subject}`)
      .then(res => setOverallAttendance(res.data))
      .catch(() => setOverallAttendance({}));
  }, [subject, attendanceData]); // refresh after any save

  // Auto-save immediately when a button is clicked
  const handleStatusClick = useCallback(async (studentId, newStatus) => {
    // Toggle off if same status clicked again
    const finalStatus = attendanceData[studentId] === newStatus ? null : newStatus;

    // Update UI immediately (optimistic)
    setAttendanceData(prev => ({ ...prev, [studentId]: finalStatus }));

    if (!finalStatus) return; // Nothing to save if toggled off

    setSavingStudents(prev => ({ ...prev, [studentId]: true }));
    try {
      await api.post('/attendance/bulk', {
        date,
        subject,
        attendanceData: [{ studentId, status: finalStatus }]
      });
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save attendance', 'error');
      // Revert on error
      setAttendanceData(prev => ({ ...prev, [studentId]: attendanceData[studentId] }));
    } finally {
      setSavingStudents(prev => ({ ...prev, [studentId]: false }));
    }
  }, [date, subject, attendanceData]);

  // Bulk save all (mark all remaining as present)
  const handleMarkAllPresent = async () => {
    const unmarked = students.filter(s => !attendanceData[s._id]);
    if (!unmarked.length) { showToast('All students already marked!'); return; }

    const newData = { ...attendanceData };
    unmarked.forEach(s => { newData[s._id] = 'Present'; });
    setAttendanceData(newData);

    try {
      await api.post('/attendance/bulk', {
        date,
        subject,
        attendanceData: unmarked.map(s => ({ studentId: s._id, status: 'Present' }))
      });
      showToast(`${unmarked.length} students marked Present ✓`);
    } catch (err) {
      showToast('Failed to save bulk attendance', 'error');
    }
  };

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, leave = 0, unmarked = 0;
    students.forEach(s => {
      const st = attendanceData[s._id];
      if (st === 'Present') present++;
      else if (st === 'Absent') absent++;
      else if (st === 'Late') late++;
      else if (st === 'Leave') leave++;
      else unmarked++;
    });
    return { present, absent, late, leave, unmarked };
  }, [attendanceData, students]);

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const markedCount = students.filter(s => attendanceData[s._id]).length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Click a status to instantly save. Auto-saves on every click.
          </p>
        </div>
        <button
          onClick={handleMarkAllPresent}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
        >
          <CheckCircle2 size={16} />
          Mark All Present
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Present', count: stats.present, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Absent', count: stats.absent, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Late', count: stats.late, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'Leave', count: stats.leave, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Unmarked', count: stats.unmarked, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className={`text-3xl font-bold mt-1 ${color}`}>{count}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row gap-4 shadow-sm items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative w-full sm:w-64">
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
            >
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer [color-scheme:dark]"
              style={{
                colorScheme: 'dark',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
            />
            <CalendarIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Save progress indicator */}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Save size={15} />
          <span>
            {markedCount}/{students.length} marked
            {markedCount > 0 && ' · Auto-saved ✓'}
          </span>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            {subject} — {displayDate}
          </h2>
          <span className="text-xs text-muted-foreground">
            Clicks auto-save to database
          </span>
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading attendance data...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No students found. Add students first.</div>
          ) : (
            <div className="divide-y divide-border">
              {students.map(student => {
                const status = attendanceData[student._id];
                const isSaving = savingStudents[student._id];
                const pct = overallAttendance[student._id];

                return (
                  <div
                    key={student._id}
                    className={`p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-colors ${
                      isSaving ? 'bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-[260px]">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                        {student.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {student.user?.name || 'Unknown'}
                          {isSaving && (
                            <span className="text-xs text-primary animate-pulse">saving...</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.enrollmentNumber} · Y{student.year}-{student.section}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between xl:justify-end flex-1">
                      {/* Overall % */}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        pct !== undefined
                          ? pct >= 75
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-red-500/10 text-red-500'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {pct !== undefined ? `${pct}%` : '0%'} overall
                      </span>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {Object.keys(STATUS_CONFIG).map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusClick(student._id, s)}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                              status === s
                                ? STATUS_CONFIG[s].bg
                                : 'bg-transparent border-border text-muted-foreground hover:bg-muted'
                            } disabled:opacity-50`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
