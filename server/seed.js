import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Grade from './models/Grade.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-management');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const STUDENT_NAMES = [
  'Aarav Sharma', 'Aditya Kumar', 'Akash Singh', 'Ananya Patel', 'Arjun Verma',
  'Ayesha Khan', 'Bhavya Gupta', 'Chirag Mehta', 'Deepika Nair', 'Divya Reddy',
  'Gaurav Joshi', 'Harini Menon', 'Ishaan Tiwari', 'Jatin Malhotra', 'Kavya Pillai',
  'Kiran Yadav', 'Lakshmi Iyer', 'Manish Dubey', 'Meera Rajput', 'Mohit Bansal',
  'Neha Saxena', 'Nikhil Chandra', 'Pooja Agarwal', 'Priya Kapoor', 'Rahul Mishra',
  'Riya Bose', 'Rohit Desai', 'Sanjay Trivedi', 'Sneha Choudhary'
];

const TEACHER_DATA = [
  { name: 'Prof. Ramesh Kumar', subjects: ['Data Structures', 'C'] },
  { name: 'Dr. Sunita Sharma',  subjects: ['Python', 'DBMS'] },
  { name: 'Prof. Vijay Nair',   subjects: ['Java', 'Data Structures'] },
];

const DEPARTMENTS = ['Computer Science', 'Computer Science', 'Information Technology', 'Computer Science'];
const SECTIONS = ['A', 'B', 'C'];
const YEARS = [1, 2, 3, 4];
const GENDERS = ['Male', 'Female'];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const importData = async () => {
  try {
    await connectDB();

    // Clear all data except Admin
    await User.deleteMany({ role: { $ne: 'Admin' } });
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Grade.deleteMany();       // Remove all fake grades
    await Attendance.deleteMany();  // Remove all fake attendance

    const pwd = await bcrypt.hash('password123', 10);

    // Ensure Admin exists
    let adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      const adminHash = await bcrypt.hash(process.env.EMAIL_PASS || 'admin123', 10);
      adminUser = await User.create({
        name: 'System Admin',
        email: process.env.EMAIL_USER || 'admin@school.edu',
        password: adminHash,
        role: 'Admin'
      });
      console.log('✓ Admin created');
    } else {
      console.log('✓ Admin already exists, skipping');
    }

    // Teachers
    console.log('\nCreating teachers...');
    for (let i = 0; i < TEACHER_DATA.length; i++) {
      const t = TEACHER_DATA[i];
      const lastName = t.name.split(' ').pop().toLowerCase();
      const tUser = await User.create({ name: t.name, email: `${lastName}@gmail.com`, password: pwd, role: 'Teacher' });
      await Teacher.create({ user: tUser._id, employeeId: `T${1000 + i}`, phone: `98765432${i}0`, department: 'Computer Science', subjects: t.subjects });
      console.log(`  ✓ ${t.name} — ${lastName}@gmail.com`);
    }

    // Students (no grades, no attendance)
    console.log('\nCreating students...');
    for (let i = 0; i < STUDENT_NAMES.length; i++) {
      const name = STUDENT_NAMES[i];
      const firstName = name.split(' ')[0].toLowerCase();
      const sUser = await User.create({ name, email: `${firstName}@gmail.com`, password: pwd, role: 'Student' });
      await Student.create({
        user: sUser._id,
        enrollmentNumber: `CS2024${String(i + 1).padStart(3, '0')}`,
        phone: `9${rand(600000000, 999999999)}`,
        dob: new Date(2002 + (i % 3), i % 12, (i % 28) + 1),
        gender: GENDERS[i % 2],
        address: `${rand(10, 999)} College Road, Sector ${rand(1, 20)}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        year: YEARS[i % YEARS.length],
        section: SECTIONS[i % SECTIONS.length]
      });
      console.log(`  ✓ ${name} — ${firstName}@gmail.com`);
    }

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────────');
    console.log(`  Students   : ${STUDENT_NAMES.length}  (password: password123)`);
    console.log(`  Teachers   : ${TEACHER_DATA.length}   (password: password123)`);
    console.log(`  Grades     : 0  (enter manually from Grades page)`);
    console.log(`  Attendance : 0  (mark manually from Attendance page)`);
    console.log('─────────────────────────────────────');
    process.exit();
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
