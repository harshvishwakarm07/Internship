const mongoose = require('mongoose');

const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    const value = req.params[paramName];
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      res.status(400);
      throw new Error(`Invalid ${paramName}`);
    }
  }

  next();
};

module.exports = { validateObjectId };