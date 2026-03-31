const asyncHandler = require('express-async-handler');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { createAuditLog } = require('../utils/audit');

// @desc    Create a new internship (with File Upload)
// @route   POST /api/internships
// @access  Private (Student)
const createInternship = asyncHandler(async (req, res) => {
  const { companyName, role, startDate, endDate } = req.body;
  if (!companyName || !role || !startDate || !endDate) {
    res.status(400);
    throw new Error('companyName, role, startDate, and endDate are required');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Offer letter file is required');
  }
  
  // File URL construction
  const offerLetter = req.file ? `/uploads/${req.file.filename}` : '';
  
  const internship = await Internship.create({
    student: req.user._id,
    companyName,
    role,
    startDate,
    endDate,
    offerLetter, // Save relative path
  });

  if (internship) {
    await createAuditLog({
      req,
      action: 'INTERNSHIP_CREATE',
      entityType: 'Internship',
      entityId: internship._id,
      metadata: { companyName, role },
    });

    res.status(201).json(internship);
  } else {
    res.status(400);
    throw new Error('Invalid internship data');
  }
});

// @desc    Get current student's internships
// @route   GET /api/internships
// @access  Private
const getMyInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find({ student: req.user._id });
  res.json(internships);
});

// @desc    Get all internships (Faculty/Admin)
// @route   GET /api/internships/all
// @access  Private
const getAllInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find({}).populate('student', 'name email');
  res.json(internships);
});

// @desc    Approve/Reject Internship
// @route   PUT /api/internships/:id/status
// @access  Private
const updateStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const allowedStatuses = ['Pending', 'Approved', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }
  const internship = await Internship.findById(req.params.id);
  
  if (internship) {
    if (status === 'Rejected' && !rejectionReason) {
      res.status(400);
      throw new Error('rejectionReason is required when rejecting an internship');
    }

    internship.status = status;
    internship.rejectionReason = status === 'Rejected' ? rejectionReason : '';
    internship.statusUpdatedBy = req.user._id;
    internship.statusUpdatedAt = new Date();
    const updated = await internship.save();
    await createAuditLog({
      req,
      action: 'INTERNSHIP_STATUS_UPDATE',
      entityType: 'Internship',
      entityId: updated._id,
      metadata: { status: updated.status, rejectionReason: updated.rejectionReason || '' },
    });
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Internship not found');
  }
});

// @desc    Upload internship certificate
// @route   PUT /api/internships/:id/certificate
// @access  Private (Student)
const uploadCertificate = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Certificate file is required');
  }

  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }

  if (internship.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this internship');
  }

  internship.certificate = `/uploads/${req.file.filename}`;
  const updated = await internship.save();
  await createAuditLog({
    req,
    action: 'INTERNSHIP_CERTIFICATE_UPLOAD',
    entityType: 'Internship',
    entityId: updated._id,
    metadata: { certificate: updated.certificate },
  });
  res.json(updated);
});

// @desc    Get current student's internships (alias endpoint)
// @route   GET /api/internships/my
// @access  Private (Student)
const getMyInternshipsAlias = asyncHandler(async (req, res) => {
  const internships = await Internship.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json(internships);
});

// @desc    Approve internship
// @route   PUT /api/internships/:id/approve
// @access  Private (Faculty/Admin)
const approveInternship = asyncHandler(async (req, res) => {
  req.body.status = 'Approved';
  return updateStatus(req, res);
});

// @desc    Reject internship
// @route   PUT /api/internships/:id/reject
// @access  Private (Faculty/Admin)
const rejectInternship = asyncHandler(async (req, res) => {
  req.body.status = 'Rejected';
  return updateStatus(req, res);
});

// @desc    Get students list for faculty dashboard
// @route   GET /api/students
// @access  Private (Faculty/Admin)
const getStudentsForFaculty = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const students = await User.find({ role: 'student', isActive: true }).select('name email createdAt');
    return res.json(students);
  }

  const assignedInternships = await Internship.find({ mentor: req.user._id }).select('student').lean();
  const studentIds = [...new Set(assignedInternships.map((item) => item.student.toString()))];

  const students = await User.find({ _id: { $in: studentIds }, role: 'student', isActive: true }).select('name email createdAt');
  return res.json(students);
});

module.exports = {
  createInternship,
  getMyInternships,
  getMyInternshipsAlias,
  getAllInternships,
  updateStatus,
  approveInternship,
  rejectInternship,
  getStudentsForFaculty,
  uploadCertificate,
};
