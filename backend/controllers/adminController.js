const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const Internship = require('../models/Internship');
const StudentProfile = require('../models/StudentProfile');
const { createAuditLog } = require('../utils/audit');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Assign student to faculty/mentor
// @route   PUT /api/admin/assign-mentor/:studentId
// @access  Private (Admin)
const assignMentor = asyncHandler(async (req, res) => {
  const { facultyId } = req.body;
  if (!facultyId || !mongoose.Types.ObjectId.isValid(facultyId)) {
    res.status(400);
    throw new Error('Invalid facultyId');
  }

  const faculty = await User.findById(facultyId);
  if (!faculty || faculty.role !== 'faculty') {
    res.status(404);
    throw new Error('Faculty not found');
  }

  const user = await User.findById(req.params.studentId);
  
  if (user && user.role === 'student') {
    // Logic for assigning (this depends on the schema choice, but a common pattern is to update the internship)
    const internships = await Internship.updateMany({ student: user._id }, { mentor: faculty._id });
    await createAuditLog({
      req,
      action: 'MENTOR_ASSIGN',
      entityType: 'User',
      entityId: user._id,
      metadata: { facultyId: faculty._id, internshipCount: internships.modifiedCount },
    });
    res.json({ message: 'Mentor assigned to all student internships', count: internships.modifiedCount });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Get system-wide analytics stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments();
  const studentCount = await User.countDocuments({ role: 'student' });
  const internshipCount = await Internship.countDocuments();
  const pendingCount = await Internship.countDocuments({ status: 'Pending' });

  res.json({
    totalUsers: userCount,
    students: studentCount,
    totalInternships: internshipCount,
    pendingApprovals: pendingCount,
    faculty: await User.countDocuments({ role: 'faculty' })
  });
});

// @desc    Create user (Admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('name, email, password, and role are required');
  }

  const allowedRoles = ['student', 'faculty', 'admin'];
  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role value');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });
  if (role === 'student') {
    await StudentProfile.create({ user: user._id });
  }
  await createAuditLog({
    req,
    action: 'USER_CREATE',
    entityType: 'User',
    entityId: user._id,
    metadata: { email: user.email, role: user.role },
  });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (role) {
    const allowedRoles = ['student', 'faculty', 'admin'];
    if (!allowedRoles.includes(role)) {
      res.status(400);
      throw new Error('Invalid role value');
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  if (password) user.password = password;

  const updated = await user.save();
  await createAuditLog({
    req,
    action: 'USER_UPDATE',
    entityType: 'User',
    entityId: updated._id,
    metadata: { email: updated.email, role: updated.role },
  });
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('Admin cannot delete own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  await createAuditLog({
    req,
    action: 'USER_DELETE',
    entityType: 'User',
    entityId: user._id,
    metadata: { email: user.email, role: user.role },
  });
  res.json({ message: 'User deleted successfully' });
});

module.exports = { getAllUsers, assignMentor, getStats, createUser, updateUser, deleteUser };
