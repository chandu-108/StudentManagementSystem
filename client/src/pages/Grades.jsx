import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, ChevronDown, CheckCircle, Hash } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Grades = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [gradesData, setGradesData] = useState({}); // { studentId: marksObtained }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [subject, setSubject] = useState('Mathematics');
  const [examType, setExamType] = useState('Mid-term');
  const [totalMarks, setTotalMarks] = useState(100);

  // Fetch all students once
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        setStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };
    fetchStudents();
  }, []);

  // Fetch grades for selected subject/examType
  useEffect(() => {
    const fetchGrades = async () => {
      if (!students.length) return;
      
      setLoading(true);
      try {
        const res = await api.get(`/grades/class?subject=${subject}&examType=${examType}`);
        const existingRecords = res.data;
        
        // Map existing records
        const newGradesData = {};
        let fetchedTotalMarks = 100;
        
        existingRecords.forEach(record => {
          newGradesData[record.student] = record.marksObtained;
          fetchedTotalMarks = record.totalMarks; // Assuming all records for this exam have same totalMarks
        });
        
        setGradesData(newGradesData);
        if (existingRecords.length > 0) {
          setTotalMarks(fetchedTotalMarks);
        }
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [subject, examType, students]);

  const handleMarksChange = (studentId, value) => {
    const marks = value === '' ? '' : Number(value);
    setGradesData(prev => ({
      ...prev,
      [studentId]: marks
    }));
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      // Filter out empty marks
      const payload = Object.entries(gradesData)
        .filter(([_, marks]) => marks !== '' && marks !== undefined && marks !== null)
        .map(([studentId, marksObtained]) => ({ studentId, marksObtained }));

      if (payload.length === 0) {
        alert('No grades to save!');
        setSaving(false);
        return;
      }

      await api.post('/grades/bulk', {
        subject,
        examType,
        totalMarks: Number(totalMarks),
        gradesData: payload
      });
      
      alert('Grades saved successfully!');
    } catch (err) {
      console.error('Failed to save grades:', err);
      alert('Failed to save grades');
    } finally {
      setSaving(false);
    }
  };

  const calculatePercentage = (marks) => {
    if (marks === '' || marks === undefined || marks === null || !totalMarks) return null;
    const percentage = (marks / totalMarks) * 100;
    return percentage.toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage === null) return 'text-muted-foreground';
    if (percentage >= 90) return 'text-emerald-500 font-bold';
    if (percentage >= 75) return 'text-blue-500 font-bold';
    if (percentage >= 60) return 'text-amber-500 font-bold';
    return 'text-red-500 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Grades & Results</h1>
          <p className="text-muted-foreground mt-1">Record marks for assessments and exams.</p>
        </div>
        
        <button 
          onClick={handleSaveGrades}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-semibold shadow-sm shadow-primary/20 disabled:opacity-50"
        >
          {saving ? 'Saving...' : (
            <>
              <CheckCircle size={18} />
              Save Grades
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row gap-4 shadow-sm items-center">
        <div className="relative w-full sm:w-64">
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full appearance-none pl-10 pr-10 py-2.5 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
          >
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Computer Science</option>
            <option>Chemistry</option>
            <option>English</option>
          </select>
          <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        
        <div className="relative w-full sm:w-64">
          <select 
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full appearance-none pl-10 pr-10 py-2.5 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
          >
            <option>Mid-term</option>
            <option>Final</option>
            <option>Assignment</option>
          </select>
          <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative w-full sm:w-48 ml-auto flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Total Marks:</label>
          <div className="relative flex-1">
            <input 
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold"
            />
            <Hash size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Student Grades List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="font-semibold text-foreground">
            {subject} — {examType}
          </h2>
          <span className="text-sm text-muted-foreground">{students.length} Students</span>
        </div>
        
        <div className="flex-1 overflow-y-auto max-h-[600px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading grades data...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No students found. Add some students first.</div>
          ) : (
            <div className="divide-y divide-border">
              {students.map((student) => {
                const marks = gradesData[student._id] ?? '';
                const percentage = calculatePercentage(marks);
                
                return (
                  <div key={student._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                    {/* Student Info */}
                    <div className="flex items-center gap-4 min-w-[300px]">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 text-lg">
                        {student.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-lg">{student.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.enrollmentNumber} - Y{student.year}-{student.section}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between sm:justify-end flex-1">
                      {/* Mark Input */}
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max={totalMarks}
                          value={marks}
                          onChange={(e) => handleMarksChange(student._id, e.target.value)}
                          placeholder="0"
                          className="w-20 text-center px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-semibold"
                        />
                        <span className="text-muted-foreground font-medium">/ {totalMarks}</span>
                      </div>

                      {/* Percentage display */}
                      <div className="w-20 text-right">
                        {percentage !== null ? (
                          <span className={`text-lg ${getGradeColor(percentage)}`}>
                            {percentage}%
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
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

export default Grades;
