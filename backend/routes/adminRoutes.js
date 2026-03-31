const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const { adminValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/requestValidation');
const { getAllUsers, assignMentor, getStats, createUser, updateUser, deleteUser } = require('../controllers/adminController');

// All routes are admin-protected
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.post('/users', adminValidators.createUser, validateRequest, createUser);
router.put('/users/:id', validateObjectId('id'), adminValidators.updateUser, validateRequest, updateUser);
router.delete('/users/:id', validateObjectId('id'), deleteUser);
router.put('/assign-mentor/:studentId', validateObjectId('studentId'), adminValidators.assignMentor, validateRequest, assignMentor);
router.get('/stats', getStats);

module.exports = router;
