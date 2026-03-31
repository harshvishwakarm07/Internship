const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekNumber: { type: Number, required: true },
  content: { type: String, required: true },
  attachment: { type: String },
  submissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Submitted', 'Reviewed'], default: 'Submitted' },
  feedback: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
