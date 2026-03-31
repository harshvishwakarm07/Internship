const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  offerLetter: { type: String },
  certificate: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusUpdatedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
