const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { 
  createInternship, 
  getMyInternships, 
  getAllInternships, 
  updateStatus,
  uploadCertificate
} = require('../controllers/internshipController');

// CREATE: Student adds internship (with local file upload)
router.post('/', protect, authorize('student'), upload.single('offerLetter'), createInternship);

// GET: My internships
router.get('/', protect, getMyInternships);

// GET ALL: Faculty/Admin view all
router.get('/all', protect, authorize('faculty', 'admin'), getAllInternships);

// UPDATE: Approve/Reject
router.put('/:id/status', protect, authorize('faculty', 'admin'), updateStatus);

// UPDATE: Student uploads completion certificate
router.put('/:id/certificate', protect, authorize('student'), upload.single('certificate'), uploadCertificate);

module.exports = router;
