require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Internship = require('./models/Internship');
const Report = require('./models/Report');

async function cleanupQaData() {
  await mongoose.connect(process.env.MONGO_URI);

  const qaUsers = await User.find({
    $or: [
      { email: /^qa_/i },
      { email: /^x\d*@test\.com$/i },
    ],
  }).select('_id email');

  const userIds = qaUsers.map((user) => user._id);

  const internships = await Internship.find({
    $or: [
      { student: { $in: userIds } },
      { companyName: { $in: ['QA Corp', 'Extra QA Corp'] } },
    ],
  }).select('_id');

  const internshipIds = internships.map((internship) => internship._id);

  const reportDelete = await Report.deleteMany({
    $or: [
      { student: { $in: userIds } },
      { internship: { $in: internshipIds } },
    ],
  });

  const internshipDelete = await Internship.deleteMany({ _id: { $in: internshipIds } });
  const userDelete = await User.deleteMany({ _id: { $in: userIds } });

  console.log(JSON.stringify({
    qaUsersMatched: qaUsers.length,
    internshipsMatched: internshipIds.length,
    reportsDeleted: reportDelete.deletedCount,
    internshipsDeleted: internshipDelete.deletedCount,
    usersDeleted: userDelete.deletedCount,
  }, null, 2));

  await mongoose.disconnect();
}

cleanupQaData().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // Ignore disconnect errors during cleanup failure.
  }
  process.exit(1);
});