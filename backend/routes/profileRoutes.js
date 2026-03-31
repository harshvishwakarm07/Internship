const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getMyProfile, upsertMyProfile } = require('../controllers/profileController');
const { profileValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/requestValidation');

router.get('/', verifyToken, authorizeRoles('student'), getMyProfile);
router.put('/', verifyToken, authorizeRoles('student'), upload.single('resume'), profileValidators.update, validateRequest, upsertMyProfile);

module.exports = router;
