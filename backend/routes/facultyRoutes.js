const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getStudentsForFaculty } = require('../controllers/internshipController');

router.get('/', verifyToken, authorizeRoles('faculty', 'admin'), getStudentsForFaculty);

module.exports = router;
