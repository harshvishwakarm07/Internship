const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const generateToken = require('../utils/generateToken');
const { createAuditLog } = require('../utils/audit');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const requestedRole = req.body.role;
  const canCreateAdmin = process.env.ALLOW_PUBLIC_ADMIN_REGISTER === 'true' || process.env.NODE_ENV === 'test';
  const role = requestedRole === 'admin'
    ? (canCreateAdmin ? 'admin' : 'student')
    : (requestedRole || 'student');
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });

  if (role === 'student') {
    await StudentProfile.create({ user: user._id });
  }

  if (user) {
    await createAuditLog({
      req,
      action: 'AUTH_REGISTER',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email, role: user.role },
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    req.user = user;
    await createAuditLog({
      req,
      action: 'AUTH_LOGIN',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email, role: user.role },
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

module.exports = { registerUser, loginUser };
