import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';

import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Grade from './models/Grade.js';
import Attendance from './models/Attendance.js';

dotenv.config();

// ── MongoDB connection (cached for serverless warm reuse) ─────────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const conn = await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/student-management'
  );
  isConnected = true;
  console.log(`MongoDB Connected: ${conn.connection.host}`);

  // Always ensure an Admin user exists (no login required)
  const hasAdmin = await User.exists({ role: 'Admin' });
  if (!hasAdmin) {
    await User.create({
      name: 'System Admin',
      email: process.env.EMAIL_USER || 'admin@app.com',
      password: process.env.EMAIL_PASS || 'admin123',
      role: 'Admin',
    });
    console.log('[auth] Bootstrapped Admin user.');
  }
}

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ── Connect DB before every request (no-op if already connected) ──────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scholarships', scholarshipRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// ── Seed route ────────────────────────────────────────────────────────────────
app.get('/api/seed', async (req, res) => {
  try {
    const STUDENT_NAMES = [
      'Aarav Sharma', 'Aditya Kumar', 'Akash Singh', 'Ananya Patel', 'Arjun Verma',
      'Ayesha Khan', 'Bhavya Gupta', 'Chirag Mehta', 'Deepika Nair', 'Divya Reddy',
      'Gaurav Joshi', 'Harini Menon', 'Ishaan Tiwari', 'Jatin Malhotra', 'Kavya Pillai',
      'Kiran Yadav', 'Lakshmi Iyer', 'Manish Dubey', 'Meera Rajput', 'Mohit Bansal',
      'Neha Saxena', 'Nikhil Chandra', 'Pooja Agarwal', 'Priya Kapoor', 'Rahul Mishra',
      'Riya Bose', 'Rohit Desai', 'Sanjay Trivedi', 'Sneha Choudhary',
    ];
    const TEACHER_DATA = [
      { name: 'Prof. Ramesh Kumar', subjects: ['Data Structures', 'C'] },
      { name: 'Dr. Sunita Sharma', subjects: ['Python', 'DBMS'] },
      { name: 'Prof. Vijay Nair', subjects: ['Java', 'Data Structures'] },
    ];
    const DEPARTMENTS = ['Computer Science', 'Computer Science', 'Information Technology', 'Computer Science'];
    const SECTIONS = ['A', 'B', 'C'];
    const YEARS = [1, 2, 3, 4];
    const GENDERS = ['Male', 'Female'];
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    await User.deleteMany({ role: { $ne: 'Admin' } });
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Grade.deleteMany();
    await Attendance.deleteMany();

    const pwd = await bcrypt.hash('password123', 10);

    const teacherDocs = [];
    for (let i = 0; i < TEACHER_DATA.length; i++) {
      const t = TEACHER_DATA[i];
      const lastName = t.name.split(' ').pop().toLowerCase();
      const tUser = await User.create({
        name: t.name,
        email: `${lastName}@gmail.com`,
        password: pwd,
        role: 'Teacher',
      });
      await Teacher.create({
        user: tUser._id,
        employeeId: `T${1000 + i}`,
        phone: `98765432${i}0`,
        department: 'Computer Science',
        subjects: t.subjects,
      });
      teacherDocs.push(tUser);
    }

    const studentDocs = [];
    for (let i = 0; i < STUDENT_NAMES.length; i++) {
      const name = STUDENT_NAMES[i];
      const firstName = name.split(' ')[0].toLowerCase();
      const sUser = await User.create({
        name,
        email: `${firstName}@gmail.com`,
        password: pwd,
        role: 'Student',
      });
      const student = await Student.create({
        user: sUser._id,
        enrollmentNumber: `CS2024${String(i + 1).padStart(3, '0')}`,
        phone: `9${rand(600000000, 999999999)}`,
        dob: new Date(2002 + (i % 3), i % 12, (i % 28) + 1),
        gender: GENDERS[i % 2],
        address: `${rand(10, 999)} College Road, Sector ${rand(1, 20)}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        year: YEARS[i % YEARS.length],
        section: SECTIONS[i % SECTIONS.length],
      });
      studentDocs.push(student);
    }

    res.json({
      success: true,
      message: '✅ Database seeded successfully!',
      students: studentDocs.length,
      teachers: teacherDocs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
