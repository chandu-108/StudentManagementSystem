import React, { useState, useEffect } from 'react';
import { Plus, X, Mail, BookOpen, ChevronDown, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: 'Computer Science',
    subjects: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/teachers', formData);
      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', employeeId: '', 
        department: 'Computer Science', subjects: ''
      });
      fetchTeachers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.user?.name || '',
      email: teacher.user?.email || '',
      phone: teacher.phone || '',
      employeeId: teacher.employeeId || '',
      department: teacher.department || 'Computer Science',
      subjects: teacher.subjects ? teacher.subjects.join(', ') : ''
    });
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.put(`/teachers/${editingTeacher._id}`, formData);
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update teacher');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/teachers/${id}`);
        fetchTeachers();
      } catch (err) {
        console.error('Error deleting teacher:', err);
        alert('Failed to delete teacher');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teachers</h1>
          <p className="text-muted-foreground mt-1">Manage teaching staff and their assignments.</p>
        </div>
        
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium shadow-sm shadow-primary/20"
          >
            <Plus size={16} />
            Add Teacher
          </button>
        )}
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">
          No teachers found. Click "Add Teacher" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Banner Top Half */}
              <div className="h-24 bg-gradient-to-r from-purple-500 to-primary relative rounded-t-xl">
                {/* Admin Actions */}
                {user?.role === 'Admin' && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button 
                      onClick={() => handleEditClick(teacher)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md backdrop-blur-sm transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeacher(teacher._id)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md backdrop-blur-sm transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                {/* Avatar (overlapping banner) */}
                <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-card bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl shadow-sm">
                  {teacher.user?.name?.charAt(0) || 'T'}
                </div>
              </div>
              
              {/* Details Bottom Half */}
              <div className="pt-10 pb-6 px-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-foreground">{teacher.user?.name || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground mb-4">{teacher.department}</p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail size={14} />
                  <span>{teacher.user?.email}</span>
                </div>
                
                {/* Subjects */}
                <div className="mt-auto pt-4 border-t border-border flex items-start gap-2">
                  <BookOpen size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects.map((subject, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-foreground text-xs font-medium rounded-md">
                          {subject}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No subjects assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Add Teacher</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {formError && (
                <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm rounded-r-md">
                  {formError}
                </div>
              )}
              
              <form id="add-teacher-form" onSubmit={handleAddTeacher} className="space-y-5">
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
                  <label className="text-sm font-medium text-foreground">Employee ID</label>
                  <input
                    type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required
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
                      <option>Electronics</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Subjects (comma separated)</label>
                  <input
                    type="text" name="subjects" value={formData.subjects} onChange={handleInputChange}
                    placeholder="e.g. Programming, Data Structures"
                    className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-teacher-form"
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 border border-transparent rounded-lg transition-all shadow-sm shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-background disabled:opacity-50"
              >
                {formLoading ? 'Adding...' : 'Add teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Edit Teacher</h2>
              <button 
                onClick={() => setEditingTeacher(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {formError && (
                <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm rounded-r-md">
                  {formError}
                </div>
              )}
              
              <form id="edit-teacher-form" onSubmit={handleUpdateTeacher} className="space-y-5">
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
                  <label className="text-sm font-medium text-foreground">Employee ID</label>
                  <input
                    type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required
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
                      <option>Electronics</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Subjects (comma separated)</label>
                  <input
                    type="text" name="subjects" value={formData.subjects} onChange={handleInputChange}
                    placeholder="e.g. Programming, Data Structures"
                    className="w-full px-4 py-2.5 text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-5 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-teacher-form"
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 border border-transparent rounded-lg transition-all shadow-sm shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-background disabled:opacity-50"
              >
                {formLoading ? 'Updating...' : 'Update teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
