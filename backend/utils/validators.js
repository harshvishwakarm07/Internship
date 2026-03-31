const { body, param } = require('express-validator');

const roles = ['student', 'faculty', 'admin'];

const authValidators = {
  register: [
    body('name').trim().isLength({ min: 2 }).withMessage('name must be at least 2 characters'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('role').optional().isIn(roles).withMessage('role must be student, faculty, or admin'),
  ],
  login: [
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('password is required'),
  ],
};

const internshipValidators = {
  create: [
    body('companyName').trim().isLength({ min: 2 }).withMessage('companyName is required'),
    body('role').trim().isLength({ min: 2 }).withMessage('role is required'),
    body('startDate').isISO8601().withMessage('startDate must be a valid date'),
    body('endDate').isISO8601().withMessage('endDate must be a valid date'),
  ],
  status: [
    body('status').isIn(['Pending', 'Approved', 'Rejected']).withMessage('status must be Pending, Approved, or Rejected'),
    body('rejectionReason')
      .optional({ values: 'falsy' })
      .isLength({ min: 3 })
      .withMessage('rejectionReason must be at least 3 characters'),
  ],
  approveReject: [
    body('rejectionReason')
      .optional({ values: 'falsy' })
      .isLength({ min: 3 })
      .withMessage('rejectionReason must be at least 3 characters'),
  ],
};

const reportValidators = {
  create: [
    body('internship').isMongoId().withMessage('internship must be a valid id'),
    body('weekNumber').isInt({ min: 1, max: 52 }).withMessage('weekNumber must be between 1 and 52'),
    body('content').trim().isLength({ min: 10 }).withMessage('content must be at least 10 characters'),
  ],
  feedback: [
    body('feedback').trim().isLength({ min: 3 }).withMessage('feedback must be at least 3 characters'),
    body('status').optional().isIn(['Submitted', 'Reviewed']).withMessage('status must be Submitted or Reviewed'),
    body('rating').optional({ values: 'null' }).isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
  ],
};

const adminValidators = {
  createUser: [
    body('name').trim().isLength({ min: 2 }).withMessage('name must be at least 2 characters'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('role').isIn(roles).withMessage('role must be student, faculty, or admin'),
  ],
  updateUser: [
    param('id').isMongoId().withMessage('id must be a valid user id'),
    body('name').optional().trim().isLength({ min: 2 }).withMessage('name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('role').optional().isIn(roles).withMessage('role must be student, faculty, or admin'),
  ],
  assignMentor: [
    param('studentId').isMongoId().withMessage('studentId must be valid'),
    body('facultyId').isMongoId().withMessage('facultyId must be valid'),
  ],
};

const profileValidators = {
  update: [
    body('enrollmentNo').optional().trim().isLength({ max: 64 }).withMessage('enrollmentNo is too long'),
    body('department').optional().trim().isLength({ max: 100 }).withMessage('department is too long'),
    body('semester').optional().isInt({ min: 1, max: 12 }).withMessage('semester must be between 1 and 12'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('phone is too long'),
    body('linkedinUrl').optional().isURL().withMessage('linkedinUrl must be a valid URL'),
    body('githubUrl').optional().isURL().withMessage('githubUrl must be a valid URL'),
  ],
};

module.exports = {
  authValidators,
  internshipValidators,
  reportValidators,
  adminValidators,
  profileValidators,
};
