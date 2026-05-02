import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === 'Admin') {
      res.status(403);
      throw new Error('Admin registration is not allowed');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Student'
    });

    if (user) {
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        refreshToken
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Admin login using .env credentials
    if (
      email === process.env.EMAIL_USER && 
      password === process.env.EMAIL_PASS
    ) {
      // Ensure Admin exists in DB for middleware compatibility
      let adminUser = await User.findOne({ role: 'Admin' });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'System Admin',
          email: process.env.EMAIL_USER,
          password: process.env.EMAIL_PASS,
          role: 'Admin'
        });
      } else if (adminUser.email !== process.env.EMAIL_USER) {
        adminUser.email = process.env.EMAIL_USER;
        adminUser.password = process.env.EMAIL_PASS;
        await adminUser.save();
      }

      const token = generateToken(adminUser._id);
      const refreshToken = generateRefreshToken(adminUser._id);
      
      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        token,
        refreshToken
      });
    }

    // Optional: If they specifically requested Admin role but failed .env check
    if (role === 'Admin') {
      res.status(401);
      throw new Error('Invalid admin credentials');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Prevent normal login for Admin accounts just in case
      if (user.role === 'Admin') {
         res.status(401);
         throw new Error('Admin must use system credentials');
      }
      
      // Enforce role check if provided from the frontend tabs
      if (role && user.role !== role) {
         res.status(401);
         throw new Error(`Account exists but is registered as a ${user.role}, not ${role}`);
      }

      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        refreshToken
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401);
      throw new Error('No refresh token provided');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(401);
    next(new Error('Invalid refresh token'));
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Current and new password are required');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.matchPassword(currentPassword))) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
