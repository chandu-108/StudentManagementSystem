import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function attachAnonymousAdmin(req) {
  let user = await User.findOne({ role: 'Admin' }).sort({ createdAt: 1 });
  if (!user && process.env.EMAIL_USER) {
    user = await User.findOne({ email: process.env.EMAIL_USER });
  }
  if (!user) return null;
  req.user = user;
  return user;
}

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const allowAnon = process.env.ALLOW_ANONYMOUS_ACCESS === 'true';
  const noToken = !token || token === 'undefined' || token === 'null';

  if (noToken && allowAnon) {
    const user = await attachAnonymousAdmin(req);
    if (!user) {
      return res.status(503).json({
        message:
          'Anonymous access is enabled but no Admin user exists. Visit /api/seed once or create an admin.',
      });
    }
    return next();
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};
