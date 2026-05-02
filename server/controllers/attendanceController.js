import Attendance from '../models/Attendance.js';

export const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status, subject } = req.body;

    const attendance = new Attendance({
      student: studentId,
      date,
      status,
      subject,
      recordedBy: req.user._id
    });

    const createdAttendance = await attendance.save();
    res.status(201).json(createdAttendance);
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

export const getDailyAttendance = async (req, res, next) => {
  try {
    const { date, subject } = req.query;
    
    if (!date || !subject) {
      res.status(400);
      throw new Error('Date and subject are required');
    }

    // Build date range from a fresh Date object each time
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      subject,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json(attendanceRecords);
  } catch (error) {
    next(error);
  }
};

export const getOverallAttendance = async (req, res, next) => {
  try {
    const { subject } = req.query;

    // If no subject, get overall across ALL subjects (for Students page)
    const query = subject ? { subject } : {};
    const attendanceRecords = await Attendance.find(query);

    // Group by student
    const studentStats = {};
    attendanceRecords.forEach(record => {
      const id = record.student.toString();
      if (!studentStats[id]) {
        studentStats[id] = { total: 0, present: 0 };
      }
      studentStats[id].total++;
      if (record.status === 'Present') {
        studentStats[id].present++;
      }
    });

    const overallPercentages = {};
    for (const studentId in studentStats) {
      const stats = studentStats[studentId];
      overallPercentages[studentId] = Math.round((stats.present / stats.total) * 100);
    }

    res.json(overallPercentages);
  } catch (error) {
    next(error);
  }
};

export const bulkMarkAttendance = async (req, res, next) => {
  try {
    const { date, subject, attendanceData } = req.body;

    if (!date || !subject || !Array.isArray(attendanceData)) {
      res.status(400);
      throw new Error('Date, subject, and attendance data are required');
    }

    // Build the stored date as a proper Date object (noon UTC to avoid timezone shifts)
    const storedDate = new Date(date);
    storedDate.setUTCHours(12, 0, 0, 0);

    // Build fresh start/end Date objects for the filter range
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Perform upsert for each student record individually to avoid compound index collisions
    const results = await Promise.all(
      attendanceData.map(record =>
        Attendance.findOneAndUpdate(
          {
            student: record.studentId,
            subject,
            date: { $gte: startOfDay, $lte: endOfDay }
          },
          {
            $set: {
              student: record.studentId,
              date: storedDate,        // proper Date object, not a number
              subject,
              status: record.status,
              recordedBy: req.user._id
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.json({ message: 'Attendance saved successfully', count: results.length });
  } catch (error) {
    next(error);
  }
};
