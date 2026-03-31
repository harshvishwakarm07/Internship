const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const Internship = require('../models/Internship');
const Feedback = require('../models/Feedback');
const { createAuditLog } = require('../utils/audit');

// @desc    Submit a weekly report
// @route   POST /api/reports
// @access  Private (Student)
const submitReport = asyncHandler(async (req, res) => {
  const { internship, weekNumber, content } = req.body;
  if (!internship || !weekNumber || !content) {
    res.status(400);
    throw new Error('internship, weekNumber, and content are required');
  }
  if (!mongoose.Types.ObjectId.isValid(internship)) {
    res.status(400);
    throw new Error('Invalid internship');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Report attachment is required');
  }

  const internshipDoc = await Internship.findById(internship);
  if (!internshipDoc) {
    res.status(404);
    throw new Error('Internship not found');
  }
  if (internshipDoc.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to submit report for this internship');
  }
  
  // File URL construction
  const attachment = req.file ? `/uploads/${req.file.filename}` : '';

  const report = await Report.create({
    student: req.user._id,
    internship,
    weekNumber,
    content,
    attachment, // Relative path saved in DB
  });

  if (report) res.status(201).json(report);
  else {
    res.status(400);
    throw new Error('Invalid report data');
  }

  await createAuditLog({
    req,
    action: 'REPORT_SUBMIT',
    entityType: 'Report',
    entityId: report._id,
    metadata: { internship, weekNumber },
  });
});

// @desc    Get reports for specific internship
// @route   GET /api/reports/:internshipId
// @access  Private
const getReportsByInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }

  const isStudent = req.user.role === 'student';
  const isOwner = internship.student.toString() === req.user._id.toString();

  if (isStudent && !isOwner) {
    res.status(403);
    throw new Error('Not authorized to view these reports');
  }

  const query = { internship: req.params.internshipId };
  if (isStudent) query.student = req.user._id;

  const reports = await Report.find(query);
  res.json(reports);
});

// @desc    Add faculty/admin feedback and mark report reviewed
// @route   PUT /api/reports/:reportId/feedback
// @access  Private (Faculty/Admin)
const updateReportFeedback = asyncHandler(async (req, res) => {
  const { feedback, status, rating } = req.body;
  const report = await Report.findById(req.params.reportId);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  report.feedback = feedback || report.feedback;
  report.status = status || 'Reviewed';
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();

  const updated = await report.save();

  if (feedback) {
    await Feedback.create({
      report: report._id,
      internship: report.internship,
      student: report.student,
      faculty: req.user._id,
      comment: feedback,
      rating: rating ?? null,
    });
  }

  await createAuditLog({
    req,
    action: 'REPORT_REVIEW',
    entityType: 'Report',
    entityId: updated._id,
    metadata: { status: updated.status, rating: rating ?? null },
  });

  res.json(updated);
});

module.exports = { submitReport, getReportsByInternship, updateReportFeedback };
