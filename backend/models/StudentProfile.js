const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  enrollmentNo: { type: String, default: '' },
  department: { type: String, default: '' },
  semester: { type: Number, default: null },
  phone: { type: String, default: '' },
  resumePath: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
