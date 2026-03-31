const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.status(400);
  throw new Error(`Validation failed: ${errors.array().map((error) => error.msg).join('; ')}`);
};

module.exports = { validateRequest };
