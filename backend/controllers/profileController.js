const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const { createAuditLog } = require('../utils/audit');

// @desc    Get current student profile
// @route   GET /api/profile
// @access  Private (Student)
const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email role');
  if (!profile) {
    profile = await StudentProfile.create({ user: req.user._id });
    profile = await profile.populate('user', 'name email role');
  }
  res.json(profile);
});

// @desc    Update current student profile + optional resume upload
// @route   PUT /api/profile
// @access  Private (Student)
const upsertMyProfile = asyncHandler(async (req, res) => {
  const { enrollmentNo, department, semester, phone, linkedinUrl, githubUrl } = req.body;

  const update = {
    enrollmentNo,
    department,
    semester: semester ? Number(semester) : null,
    phone,
    linkedinUrl,
    githubUrl,
  };

  Object.keys(update).forEach((key) => {
    if (typeof update[key] === 'undefined') {
      delete update[key];
    }
  });

  if (req.file) {
    update.resumePath = `/uploads/${req.file.filename}`;
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('user', 'name email role');

  await createAuditLog({
    req,
    action: 'STUDENT_PROFILE_UPDATE',
    entityType: 'StudentProfile',
    entityId: profile._id,
    metadata: { hasResume: Boolean(profile.resumePath) },
  });

  res.json(profile);
});

module.exports = { getMyProfile, upsertMyProfile };
