import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check, AlertCircle, ChevronDown, Search, Zap,
  TrendingUp, Award, DollarSign, Clock
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ━━━ Toast Component ━━━
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
      type === 'success'
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        : 'bg-red-500/10 text-red-600 border-red-500/20'
    }`}
  >
    {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
    {message}
  </motion.div>
);

// ━━━ KPI Card Component ━━━
const KPICard = ({ icon: Icon, title, value, color, animationDelay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: animationDelay, duration: 0.4 }}
    className={`${color} border border-opacity-50 rounded-lg p-6 shadow-sm`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-75">{title}</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.2, duration: 0.5 }}
          className="text-3xl font-bold mt-2"
        >
          <CountUpAnimation from={0} to={value} duration={1} />
        </motion.p>
      </div>
      <Icon size={32} className="opacity-40" />
    </div>
  </motion.div>
);

// ━━━ Count Up Animation ━━━
const CountUpAnimation = ({ from, to, duration }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = 0;
    const increment = to / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [to, duration]);

  return count;
};

// ━━━ Assign Scholarship Modal ━━━
const AssignScholarshipModal = ({ isOpen, onClose, students, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    scholarshipName: '',
    amount: '',
    status: 'Selected',
    remarks: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredStudents = students.filter(s =>
    s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.scholarshipName || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit(formData);
    setFormData({ studentId: '', scholarshipName: '', amount: '', status: 'Selected', remarks: '' });
    setSearchTerm('');
    setDropdownOpen(false);
  };

  const selectedStudent = students.find(s => s._id === formData.studentId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Assign Scholarship</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Student *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg text-left flex items-center justify-between hover:bg-muted transition-colors"
                >
                  <span className="text-sm">
                    {selectedStudent ? `${selectedStudent.user?.name} (${selectedStudent.enrollmentNumber})` : 'Select student...'}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10"
                  >
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border-b border-border bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                          <button
                            key={student._id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, studentId: student._id }));
                              setDropdownOpen(false);
                              setSearchTerm('');
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{student.user?.name}</p>
                              <p className="text-xs text-muted-foreground">{student.department} — Year {student.year}</p>
                            </div>
                            {formData.studentId === student._id && <Check size={16} className="text-primary" />}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-sm text-muted-foreground">No students found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Scholarship Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scholarship Name *
              </label>
              <input
                type="text"
                value={formData.scholarshipName}
                onChange={(e) => setFormData(prev => ({ ...prev, scholarshipName: e.target.value }))}
                placeholder="e.g., Merit Scholarship"
                className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="10000"
                  className="w-full pl-8 pr-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Selected"
                    checked={formData.status === 'Selected'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Selected</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Not Selected"
                    checked={formData.status === 'Not Selected'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Not Selected</span>
                </label>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Optional notes..."
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading ? 'Assigning...' : <><Plus size={16} /> Assign</>}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ━━━ Move to Selected Dialog ━━━
const MoveToSelectedDialog = ({ isOpen, scholarship, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    scholarshipName: '',
    amount: '',
    remarks: ''
  });

  useEffect(() => {
    if (scholarship) {
      setFormData({
        scholarshipName: scholarship.scholarshipName,
        amount: scholarship.amount.toString(),
        remarks: scholarship.remarks || ''
      });
    }
  }, [scholarship, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.scholarshipName || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
  };

  if (!isOpen || !scholarship) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold text-foreground">Move to Selected</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scholarship Name *
              </label>
              <input
                type="text"
                value={formData.scholarshipName}
                onChange={(e) => setFormData(prev => ({ ...prev, scholarshipName: e.target.value }))}
                className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
              >
                {loading ? 'Moving...' : 'Move'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ━━━ Sanction Popover ━━━
const SanctionPopover = ({ isOpen, scholarship, onClose, onSanction, onReject, loading }) => {
  const [remarks, setRemarks] = useState('');

  const handleSanction = () => {
    onSanction(scholarship._id, { sanctionStatus: 'Sanctioned', remarks });
    setRemarks('');
  };

  const handleReject = () => {
    onReject(scholarship._id, { sanctionStatus: 'Rejected', remarks });
    setRemarks('');
  };

  if (!isOpen || !scholarship) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    </AnimatePresence>
  );
};

// ━━━ Main Component ━━━
const Scholarship = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    selected: 0,
    notSelected: 0,
    sanctioned: 0,
    reimbPending: 0,
    totalAmount: 0,
    sanctionedAmount: 0
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [activeTab, setActiveTab] = useState('selected');
  const [searchTerm, setSearchTerm] = useState('');
  const [sanctionPopover, setSanctionPopover] = useState({ open: false, scholarshipId: null, remarks: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch scholarships and students
  const fetchData = async () => {
    try {
      setLoading(true);
      const [scholarshipsRes, studentsRes] = await Promise.all([
        api.get('/scholarships'),
        api.get('/students')
      ]);
      setScholarships(scholarshipsRes.data);
      setStudents(studentsRes.data);

      // Fetch stats if admin
      if (user?.role === 'Admin') {
        const statsRes = await api.get('/scholarships/dashboard/stats');
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle assign scholarship
  const handleAssignScholarship = async (formData) => {
    setSubmitting(true);
    try {
      await api.post('/scholarships', formData);
      showToast('Scholarship assigned successfully!');
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign scholarship', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle move to selected
  const handleMoveToSelected = async (formData) => {
    if (!selectedScholarship) return;
    setSubmitting(true);
    try {
      await api.patch(`/scholarships/${selectedScholarship._id}/status`, {
        status: 'Selected',
        scholarshipName: formData.scholarshipName,
        amount: formData.amount,
        remarks: formData.remarks
      });
      showToast('Scholarship moved to selected!');
      setShowMoveDialog(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move scholarship', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle sanction
  const handleSanction = async (scholarshipId, data) => {
    try {
      await api.patch(`/scholarships/${scholarshipId}/sanction`, data);
      showToast('Scholarship sanctioned!');
      setSanctionPopover({ open: false, scholarshipId: null, remarks: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to sanction', 'error');
    }
  };

  // Handle reject
  const handleReject = async (scholarshipId, data) => {
    try {
      await api.patch(`/scholarships/${scholarshipId}/sanction`, data);
      showToast('Scholarship rejected!');
      setSanctionPopover({ open: false, scholarshipId: null, remarks: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject', 'error');
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (scholarshipId) => {
    try {
      await api.patch(`/scholarships/${scholarshipId}/reimburse`);
      showToast('Marked as paid!');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as paid', 'error');
    }
  };

  // Filter scholarships based on tab
  const selectedScholarships = scholarships.filter(s => s.status === 'Selected');
  const notSelectedScholarships = scholarships.filter(s => s.status === 'Not Selected');

  const activeScholarships = activeTab === 'selected' ? selectedScholarships : notSelectedScholarships;
  const filteredScholarships = activeScholarships.filter(s =>
    s.studentId?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Scholarship Management</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage scholarships and reimbursements' : 'View your scholarship information'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-semibold shadow-sm shadow-primary/20 whitespace-nowrap"
          >
            <Plus size={18} />
            Assign Scholarship
          </button>
        )}
      </div>

      {/* Operations Dashboard (Admin Only) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              icon={TrendingUp}
              title="Total Students Assessed"
              value={stats.total}
              color="bg-muted text-muted-foreground"
              animationDelay={0}
            />
            <KPICard
              icon={Award}
              title="Selected"
              value={stats.selected}
              color="bg-emerald-500/10 text-emerald-600"
              animationDelay={0.08}
            />
            <KPICard
              icon={AlertCircle}
              title="Not Selected"
              value={stats.notSelected}
              color="bg-red-500/10 text-red-600"
              animationDelay={0.16}
            />
            <KPICard
              icon={Check}
              title="Money Sanctioned"
              value={stats.sanctioned}
              color="bg-blue-500/10 text-blue-600"
              animationDelay={0.24}
            />
            <KPICard
              icon={Clock}
              title="Reimbursement Pending"
              value={stats.reimbPending}
              color="bg-amber-500/10 text-amber-600"
              animationDelay={0.32}
            />
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Scholarship Disbursement Progress</p>
              <p className="text-sm font-semibold text-primary">₹{stats.sanctionedAmount.toLocaleString()} of ₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: stats.totalAmount > 0 ? `${(stats.sanctionedAmount / stats.totalAmount) * 100}%` : 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-full bg-gradient-to-r from-primary to-blue-500"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tabs and Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isAdmin ? 0.5 : 0.2 }}
        className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col"
      >
        {/* Tab Headers */}
        <div className="border-b border-border flex">
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('selected')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === 'selected'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Selected Students ({selectedScholarships.length})
              </button>
              <button
                onClick={() => setActiveTab('notSelected')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === 'notSelected'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Not Selected ({notSelectedScholarships.length})
              </button>
            </>
          )}
        </div>

        {/* Search Bar */}
        {isAdmin && (
          <div className="px-6 py-3 border-b border-border bg-muted/20">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'selected' ? 'selected' : 'not selected'} students...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto max-h-[600px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading scholarships...</div>
          ) : filteredScholarships.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {activeTab === 'selected'
                ? 'No selected scholarships yet.'
                : 'No scholarships awaiting selection.'}
            </div>
          ) : (
            <AnimatePresence>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-widest">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-widest">Dept / Year</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-widest">Scholarship Name</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-foreground uppercase tracking-widest">Amount</th>
                    {activeTab === 'selected' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-widest">Sanction Status</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-widest">Reimbursement</th>
                      </>
                    )}
                    {isAdmin && <th className="px-6 py-3 text-right text-xs font-bold text-foreground uppercase tracking-widest">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredScholarships.map((scholarship, idx) => (
                    <motion.tr
                      key={scholarship._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{scholarship.studentId?.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{scholarship.studentId?.enrollmentNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-foreground">{scholarship.studentId?.department}</p>
                          <p className="text-xs text-muted-foreground">Year {scholarship.studentId?.year}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{scholarship.scholarshipName}</td>
                      <td className="px-6 py-4 text-right text-foreground font-semibold">₹{scholarship.amount.toLocaleString()}</td>

                      {activeTab === 'selected' && (
                        <>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              scholarship.sanctionStatus === 'Sanctioned'
                                ? 'bg-blue-500/10 text-blue-600'
                                : scholarship.sanctionStatus === 'Rejected'
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {scholarship.sanctionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {scholarship.sanctionStatus === 'Sanctioned' && (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                scholarship.reimbursementPaid
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {scholarship.reimbursementPaid ? 'Paid' : 'Pending'}
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === 'selected' ? (
                              scholarship.sanctionStatus === 'Pending Approval' ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setSanctionPopover({ open: true, scholarshipId: scholarship._id, remarks: '' });
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                                    title="Sanction"
                                  >
                                    <Check size={14} /> Sanction
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSanctionPopover({ open: true, scholarshipId: scholarship._id, remarks: '', action: 'reject' });
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                                    title="Reject"
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </div>
                              ) : scholarship.sanctionStatus === 'Sanctioned' && !scholarship.reimbursementPaid ? (
                                <button
                                  onClick={() => handleMarkAsPaid(scholarship._id)}
                                  className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors whitespace-nowrap"
                                >
                                  Mark as Paid
                                </button>
                              ) : scholarship.reimbursementPaid ? (
                                <span className="text-xs text-muted-foreground">Completed</span>
                              ) : null
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedScholarship(scholarship);
                                  setShowMoveDialog(true);
                                }}
                                className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Move to Selected
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Non-Admin Empty State */}
      {!isAdmin && scholarships.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p className="text-sm">No scholarship assigned to you yet.</p>
        </motion.div>
      )}

      {/* Modals */}
      <AssignScholarshipModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        students={students}
        onSubmit={handleAssignScholarship}
        loading={submitting}
      />

      <MoveToSelectedDialog
        isOpen={showMoveDialog}
        scholarship={selectedScholarship}
        onClose={() => {
          setShowMoveDialog(false);
          setSelectedScholarship(null);
        }}
        onSubmit={handleMoveToSelected}
        loading={submitting}
      />

      {/* Sanction Modal */}
      {sanctionPopover.open && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSanctionPopover({ ...sanctionPopover, open: false })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-foreground">
                {sanctionPopover.action === 'reject' ? 'Reject Scholarship' : 'Sanction Scholarship'}
              </h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Remarks (optional)</label>
                <textarea
                  value={sanctionPopover.remarks}
                  onChange={(e) => setSanctionPopover({ ...sanctionPopover, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
                  placeholder="Add remarks here..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSanctionPopover({ ...sanctionPopover, open: false })}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (sanctionPopover.action === 'reject') {
                      handleReject(sanctionPopover.scholarshipId, {
                        sanctionStatus: 'Rejected',
                        remarks: sanctionPopover.remarks
                      });
                    } else {
                      handleSanction(sanctionPopover.scholarshipId, {
                        sanctionStatus: 'Sanctioned',
                        remarks: sanctionPopover.remarks
                      });
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${
                    sanctionPopover.action === 'reject'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {sanctionPopover.action === 'reject' ? 'Reject' : 'Sanction'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Scholarship;
