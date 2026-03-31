const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { submitReport, getReportsByInternship, updateReportFeedback } = require('../controllers/reportController');

// Submit: STUDENT with attachment
router.post('/', protect, authorize('student'), upload.single('attachment'), submitReport);

// Get Reports for specific internship
router.get('/:internshipId', protect, getReportsByInternship);

// Faculty/Admin feedback on report
router.put('/:reportId/feedback', protect, authorize('faculty', 'admin'), updateReportFeedback);

module.exports = router;
