import User from '../models/User.js';

// Fetch (or create) the first Admin user to attach to every request
async function getAdminUser() {
  let user = await User.findOne({ role: 'Admin' }).sort({ createdAt: 1 });
  if (!user && process.env.EMAIL_USER) {
    user = await User.findOne({ email: process.env.EMAIL_USER });
  }
  return user;
}

// All routes are open — no login required.
// Every request is treated as the Admin user.
export const protect = async (req, res, next) => {
  try {
    const user = await getAdminUser();
    if (!user) {
      return res.status(503).json({
        message: 'No Admin user found. Visit /api/seed once to initialise the database.',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Role check is bypassed — everyone is treated as Admin
export const authorize = (...roles) => {
  return (req, res, next) => next();
};
