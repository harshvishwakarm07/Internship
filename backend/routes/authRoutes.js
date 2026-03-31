const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { authValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/requestValidation');

router.post('/register', authValidators.register, validateRequest, registerUser);
router.post('/login', authValidators.login, validateRequest, loginUser);

module.exports = router;
