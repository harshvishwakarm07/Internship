const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const upload = require('../middleware/uploadMiddleware');
const { reportValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/requestValidation');
const { submitReport, getReportsByInternship, updateReportFeedback } = require('../controllers/reportController');

// Submit: STUDENT with attachment
router.post('/', protect, authorize('student'), upload.single('attachment'), reportValidators.create, validateRequest, submitReport);

// Get Reports for specific internship
router.get('/:internshipId', protect, validateObjectId('internshipId'), getReportsByInternship);

// Faculty/Admin feedback on report
router.put('/:reportId/feedback', protect, authorize('faculty', 'admin'), validateObjectId('reportId'), reportValidators.feedback, validateRequest, updateReportFeedback);

module.exports = router;
