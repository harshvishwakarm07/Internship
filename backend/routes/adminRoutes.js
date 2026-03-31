const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, assignMentor, getStats, createUser, updateUser, deleteUser } = require('../controllers/adminController');

// All routes are admin-protected
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/assign-mentor/:studentId', assignMentor);
router.get('/stats', getStats);

module.exports = router;
