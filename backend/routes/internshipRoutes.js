const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const upload = require('../middleware/uploadMiddleware');
const { internshipValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/requestValidation');
const { 
  createInternship, 
  getMyInternships, 
  getMyInternshipsAlias,
  getAllInternships, 
  updateStatus,
  approveInternship,
  rejectInternship,
  uploadCertificate
} = require('../controllers/internshipController');

// CREATE: Student adds internship (with local file upload)
router.post('/', protect, authorize('student'), upload.single('offerLetter'), internshipValidators.create, validateRequest, createInternship);

// GET: My internships
router.get('/', protect, getMyInternships);
router.get('/my', protect, authorize('student'), getMyInternshipsAlias);

// GET ALL: Faculty/Admin view all
router.get('/all', protect, authorize('faculty', 'admin'), getAllInternships);

// UPDATE: Approve/Reject
router.put('/:id/status', protect, authorize('faculty', 'admin'), validateObjectId('id'), internshipValidators.status, validateRequest, updateStatus);
router.put('/:id/approve', protect, authorize('faculty', 'admin'), validateObjectId('id'), internshipValidators.approveReject, validateRequest, approveInternship);
router.put('/:id/reject', protect, authorize('faculty', 'admin'), validateObjectId('id'), internshipValidators.approveReject, validateRequest, rejectInternship);

// UPDATE: Student uploads completion certificate
router.put('/:id/certificate', protect, authorize('student'), validateObjectId('id'), upload.single('certificate'), uploadCertificate);

module.exports = router;
