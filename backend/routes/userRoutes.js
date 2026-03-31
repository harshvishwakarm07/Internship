const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const { getAllUsers, createUser, deleteUser } = require('../controllers/adminController');
const { adminValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/requestValidation');

router.use(verifyToken, authorizeRoles('admin'));
router.get('/', getAllUsers);
router.post('/', adminValidators.createUser, validateRequest, createUser);
router.delete('/:id', validateObjectId('id'), deleteUser);

module.exports = router;
