const multer = require('multer');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err instanceof multer.MulterError) {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  } else if (err.message && err.message.includes('Unsupported file type')) {
    statusCode = 415;
  } else if (err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 400;
  } else if (err.code === 11000) {
    statusCode = 409;
  }

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
