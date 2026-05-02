import Student from '../models/Student.js';
import User from '../models/User.js';

export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('user', 'name email');
    res.json(students);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'name email');
    if (student) {
      res.json(student);
    } else {
      res.status(404);
      throw new Error('Student not found');
    }
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { name, email, phone, enrollmentNumber, department, year, section } = req.body;

    // Ensure the email isn't already used
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Create the User first
    const user = await User.create({
      name,
      email,
      password: 'password123',
      role: 'Student'
    });

    // Create the Student linked to the User
    const student = new Student({
      user: user._id,
      enrollmentNumber,
      phone,
      department,
      year,
      section
    });
    
    const createdStudent = await student.save();
    await createdStudent.populate('user', 'name email');
    
    res.status(201).json(createdStudent);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      if (req.body.name || req.body.email) {
        const user = await User.findById(student.user);
        if (user) {
          user.name = req.body.name || user.name;
          user.email = req.body.email || user.email;
          await user.save();
        }
      }

      Object.assign(student, req.body);
      const updatedStudent = await student.save();
      await updatedStudent.populate('user', 'name email');
      res.json(updatedStudent);
    } else {
      res.status(404);
      throw new Error('Student not found');
    }
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      const userId = student.user;
      await student.deleteOne();
      if (userId) {
        await User.findByIdAndDelete(userId);
      }
      res.json({ message: 'Student and associated user removed' });
    } else {
      res.status(404);
      throw new Error('Student not found');
    }
  } catch (error) {
    next(error);
  }
};
