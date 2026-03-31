require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Internship = require('./models/Internship');
const Report = require('./models/Report');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.countDocuments();
  const internships = await Internship.countDocuments();
  const reports = await Report.countDocuments();

  const internWithMissingStudent = await Internship.countDocuments({
    student: { $nin: await User.distinct('_id') }
  });

  const reportWithMissingInternship = await Report.countDocuments({
    internship: { $nin: await Internship.distinct('_id') }
  });

  const reportWithMissingStudent = await Report.countDocuments({
    student: { $nin: await User.distinct('_id') }
  });

  console.log('DATA|usersCount|' + users);
  console.log('DATA|internshipsCount|' + internships);
  console.log('DATA|reportsCount|' + reports);
  console.log('DATA|internshipMissingStudentRefs|' + internWithMissingStudent);
  console.log('DATA|reportMissingInternshipRefs|' + reportWithMissingInternship);
  console.log('DATA|reportMissingStudentRefs|' + reportWithMissingStudent);

  await mongoose.disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
