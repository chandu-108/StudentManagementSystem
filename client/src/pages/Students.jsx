import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Download, Upload, Eye, Edit, Trash2, X, ChevronDown 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [overallAttendance, setOverallAttendance] = useState({}); // { studentId: percentage }
  const { user } = useAuth();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [yearFilter, setYearFilter] = useState('All Years');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enrollmentNumber: '',
    department: 'Computer Science',
    year: '1',
    section: 'A'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchOverallAttendance();
  }, []);

  const fetchOverallAttendance = async () => {
    try {
      // No subject filter = overall across all subjects
      const res = await api.get('/attendance/overall');
      setOverallAttendance(res.data);
    } catch (err) {
      console.error('Error fetching overall attendance:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/students', {
        ...formData,
        year: parseInt(formData.year.toString().replace('Year ', ''), 10)
      });
      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', enrollmentNumber: '', 
        department: 'Computer Science', year: '1', section: 'A'
      });
      fetchStudents(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.user?.name || '',
      email: student.user?.email || '',
      phone: student.phone || '',
      enrollmentNumber: student.enrollmentNumber || '',
      department: student.department || 'Computer Science',
      year: student.year?.toString() || '1',
      section: student.section || 'A'
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.put(`/students/${editingStudent._id}`, {
        ...formData,
        year: parseInt(formData.year.toString().replace('Year ', ''), 10)
      });
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error('Failed to delete student:', err);
        alert('Failed to delete student');
      }
    }
  };

  // Derived filtered students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = departmentFilter === 'All Departments' || student.department === departmentFilter;
    const matchesYear = yearFilter === 'All Years' || student.year.toString() === yearFilter.replace('Year ', '');
    
    return matchesSearch && matchesDept && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            {filteredStudents.length} of {students.length} students
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export CSV */}
          <button
            onClick={() => {
              const headers = ['Name', 'Email', 'Enrollment No', 'Department', 'Year', 'Section', 'Gender', 'Phone'];
              const rows = students.map(s => [
                s.user?.name || '',
                s.user?.email || '',
                s.enrollmentNumber,
                s.department,
                s.year,
                s.section,
                s.gender || '',
                s.phone || ''
              ]);
              const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'students.csv'; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={16} />
            Export CSV
          </button>

          {/* Import CSV */}
          <label className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium shadow-sm cursor-pointer">
            <Upload size={16} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const text = await file.text();
                const lines = text.split('\n').filter(Boolean);
                const headers = lines[0].replace(/"/g, '').split(',');
                const rows = lines.slice(1);
                let imported = 0, failed = 0;
                for (const row of rows) {
                  const vals = row.split(',').map(v => v.replace(/"/g, '').trim());
                  const obj = {};
                  headers.forEach((h, i) => obj[h.trim()] = vals[i]);
                  try {
                    await api.post('/students', {
                      name: obj['Name'],
                      email: obj['Email'],
                      enrollmentNumber: obj['Enrollment No'],
                      department: obj['Department'] || 'Computer Science',
                      year: parseInt(obj['Year']) || 1,
                      section: obj['Section'] || 'A',
                      gender: obj['Gender'] || 'Male',
                      phone: obj['Phone'] || '9000000000',
                    });
                    imported++;
                  } catch { failed++; }
                }
                alert(`Import done: ${imported} added, ${failed} failed.`);
                fetchStudents();
                e.target.value = '';
              }}
            />
          </label>

          {user?.role === 'Admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium shadow-sm shadow-primary/20"
            >
              <Plus size={16} />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border p-3 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, email, enrollment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[160px]">
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
            >
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Mechanical</option>
              <option>Electrical</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="relative min-w-[120px]">
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
            >
              <option>All Years</option>
              <option>Year 1</option>
              <option>Year 2</option>
              <option>Year 3</option>
              <option>Year 4</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">Year / Section</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">Attendance</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">CGPA</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-3">
                      <div className="h-10 bg-muted animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <Search size={24} className="opacity-40" />
                      </div>
                      <p className="font-medium">No students found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const pct = overallAttendance[student._id];
                  const isGood = pct !== undefined && pct >= 75;
                  const avatarColors = [
                    'bg-primary/10 text-primary',
                    'bg-violet-500/10 text-violet-600',
                    'bg-emerald-500/10 text-emerald-600',
                    'bg-amber-500/10 text-amber-600',
                    'bg-blue-500/10 text-blue-600',
                    'bg-pink-500/10 text-pink-600',
                  ];
                  const avatarColor = avatarColors[idx % avatarColors.length];

                  return (
                    <tr
                      key={student._id}
                      className="group hover:bg-primary/5 transition-all duration-150"
                    >
                      {/* Student Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor}`}>
                            {student.user?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground leading-tight">{student.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{student.enrollmentNumber}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border">
                          {student.department}
                        </span>
                      </td>

                      {/* Year / Section */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {student.year}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">Year · Sec {student.section}</span>
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-8 rounded-full ${
                            pct !== undefined ? (isGood ? 'bg-emerald-500' : 'bg-red-500') : 'bg-muted'
                          }`} />
                          <div>
                            <span className={`text-sm font-bold ${
                              pct !== undefined ? (isGood ? 'text-emerald-600' : 'text-red-500') : 'text-muted-foreground'
                            }`}>
                              {pct !== undefined ? `${pct}%` : '0%'}
                            </span>
                            <p className="text-xs text-muted-foreground">{isGood ? 'Good' : pct !== undefined ? 'Low' : 'No record'}</p>
                          </div>
                        </div>
                      </td>

                      {/* CGPA */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">—</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewingStudent(student)}
                            title="View"
                            className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => handleEditClick(student)}
                              title="Edit"
                              className="p-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 text-muted-foreground transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              title="Delete"
                              className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredStudents.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> of{' '}
              <span className="font-semibold text-foreground">{students.length}</span> students
            </p>
            <p className="text-xs text-muted-foreground">Hover a row to see actions</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Add Student</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
                  {formError}
                </div>
              )}
              
              <form id="add-student-form" onSubmit={handleAddStudent} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleInputChange} required
                      className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                      className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Enrollment #</label>
                  <input
                    type="text" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Department</label>
                  <div className="relative">
                    <select 
                      name="department" value={formData.department} onChange={handleInputChange}
                      className="w-full appearance-none px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground cursor-pointer"
                    >
                      <option>Computer Science</option>
                      <option>Mechanical</option>
                      <option>Electrical</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Year</label>
                    <div className="relative">
                      <select 
                        name="year" value={formData.year} onChange={handleInputChange}
                        className="w-full appearance-none px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground cursor-pointer"
                      >
                        <option>Year 1</option>
                        <option>Year 2</option>
                        <option>Year 3</option>
                        <option>Year 4</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Section</label>
                    <div className="relative">
                      <select 
                        name="section" value={formData.section} onChange={handleInputChange}
                        className="w-full appearance-none px-4 py-2.5 bg-background border border-primary ring-2 ring-primary/25 rounded-lg focus:outline-none text-foreground cursor-pointer"
                      >
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-muted flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted/80 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-student-form"
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 border border-transparent rounded-lg transition-all shadow-sm shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-background"
              >
                {formLoading ? 'Adding...' : 'Add student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Edit Student</h2>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
                  {formError}
                </div>
              )}
              
              <form id="edit-student-form" onSubmit={handleUpdateStudent} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleInputChange} required
                      className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                      className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Enrollment #</label>
                  <input
                    type="text" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Department</label>
                  <div className="relative">
                    <select 
                      name="department" value={formData.department} onChange={handleInputChange}
                      className="w-full appearance-none px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground cursor-pointer"
                    >
                      <option>Computer Science</option>
                      <option>Mechanical</option>
                      <option>Electrical</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Year</label>
                    <div className="relative">
                      <select 
                        name="year" value={formData.year} onChange={handleInputChange}
                        className="w-full appearance-none px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground cursor-pointer"
                      >
                        <option>Year 1</option>
                        <option>Year 2</option>
                        <option>Year 3</option>
                        <option>Year 4</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Section</label>
                    <div className="relative">
                      <select 
                        name="section" value={formData.section} onChange={handleInputChange}
                        className="w-full appearance-none px-4 py-2.5 bg-background border border-primary ring-2 ring-primary/25 rounded-lg focus:outline-none text-foreground cursor-pointer"
                      >
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-muted flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted/80 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-student-form"
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 border border-transparent rounded-lg transition-all shadow-sm shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-background"
              >
                {formLoading ? 'Updating...' : 'Update student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Student Details</h2>
              <button 
                onClick={() => setViewingStudent(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                  {viewingStudent.user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{viewingStudent.user?.name}</h3>
                  <p className="text-muted-foreground">{viewingStudent.user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Enrollment #</p>
                    <p className="text-foreground font-medium">{viewingStudent.enrollmentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Phone</p>
                    <p className="text-foreground font-medium">{viewingStudent.phone}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Department</p>
                  <p className="text-foreground font-medium">{viewingStudent.department}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Year</p>
                    <p className="text-foreground font-medium">{viewingStudent.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Section</p>
                    <p className="text-foreground font-medium">{viewingStudent.section}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-muted flex justify-end">
              <button 
                onClick={() => setViewingStudent(null)}
                className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted/80 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
