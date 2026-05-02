import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Grade from '../models/Grade.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    
    // Departments count from students
    const departments = await Student.distinct('department');
    const totalDepartments = departments.length;

    // Today's attendance percentage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAttendance = await Attendance.find({ date: { $gte: today } });
    const presentCount = todaysAttendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = todaysAttendance.length > 0 
      ? Math.round((presentCount / todaysAttendance.length) * 100) 
      : 0;

    res.json({
      totalStudents,
      totalTeachers,
      totalDepartments,
      attendancePercentage,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardCharts = async (req, res, next) => {
  try {
    // Enrollment by department
    const deptStats = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const barChartData = deptStats.map(stat => ({
      name: stat._id,
      value: stat.count
    }));

    // Grade Distribution
    const grades = await Grade.find();
    let gradeCounts = { A: 0, B: 0, C: 0, F: 0 };
    
    grades.forEach(g => {
      if (g.totalMarks > 0) {
        const percentage = (g.marksObtained / g.totalMarks) * 100;
        if (percentage >= 90) gradeCounts.A++;
        else if (percentage >= 75) gradeCounts.B++;
        else if (percentage >= 60) gradeCounts.C++;
        else gradeCounts.F++;
      }
    });

    const pieChartData = [
      { name: 'Grade A', value: gradeCounts.A },
      { name: 'Grade B', value: gradeCounts.B },
      { name: 'Grade C', value: gradeCounts.C },
      { name: 'Grade F', value: gradeCounts.F },
    ];

    res.json({
      barChartData,
      pieChartData
    });
  } catch (error) {
    next(error);
  }
};
