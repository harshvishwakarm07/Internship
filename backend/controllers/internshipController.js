const asyncHandler = require('express-async-handler');
const Internship = require('../models/Internship');

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
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Approved', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }
  const internship = await Internship.findById(req.params.id);
  
  if (internship) {
    internship.status = status;
    const updated = await internship.save();
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
  res.json(updated);
});

module.exports = { createInternship, getMyInternships, getAllInternships, updateStatus, uploadCertificate };
