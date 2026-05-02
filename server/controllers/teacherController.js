import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate('user', 'name email role');
    res.json(teachers);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private/Admin
export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, phone, employeeId, department, subjects } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // 2. Check if employeeId already exists
    const teacherExists = await Teacher.findOne({ employeeId });
    if (teacherExists) {
      res.status(400);
      throw new Error('Teacher with this Employee ID already exists');
    }

    // 3. Create User account automatically (default password: password123)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Teacher'
    });

    // 4. Create Teacher profile linked to User
    const teacher = await Teacher.create({
      user: user._id,
      employeeId,
      phone,
      department,
      subjects: subjects ? subjects.split(',').map(s => s.trim()) : []
    });

    // Populate user details for the response
    const populatedTeacher = await Teacher.findById(teacher._id).populate('user', 'name email role');

    res.status(201).json(populatedTeacher);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
export const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      if (req.body.name || req.body.email) {
        const user = await User.findById(teacher.user);
        if (user) {
          user.name = req.body.name || user.name;
          user.email = req.body.email || user.email;
          await user.save();
        }
      }

      // Handle subjects string to array conversion if provided
      if (req.body.subjects !== undefined) {
        if (typeof req.body.subjects === 'string') {
          req.body.subjects = req.body.subjects.split(',').map(s => s.trim()).filter(s => s);
        }
      }

      Object.assign(teacher, req.body);
      const updatedTeacher = await teacher.save();
      await updatedTeacher.populate('user', 'name email role');
      res.json(updatedTeacher);
    } else {
      res.status(404);
      throw new Error('Teacher not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      const userId = teacher.user;
      await teacher.deleteOne();
      if (userId) {
        await User.findByIdAndDelete(userId);
      }
      res.json({ message: 'Teacher and associated user removed' });
    } else {
      res.status(404);
      throw new Error('Teacher not found');
    }
  } catch (error) {
    next(error);
  }
};
