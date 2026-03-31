require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: 'qa_student_1774955744@test.com' }).select('+password');
  console.log('DATA|passwordHashPrefix|' + (user.password || '').substring(0, 4));
  console.log('DATA|passwordEqualsPlain|' + (user.password === 'Pass@1234'));

  const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '-10s' });
  console.log('DATA|expiredToken|' + expiredToken);

  const dup = await User.aggregate([
    { $group: { _id: '$email', c: { $sum: 1 } } },
    { $match: { c: { $gt: 1 } } },
    { $count: 'dups' }
  ]);
  console.log('DATA|duplicateEmailGroups|' + ((dup[0] && dup[0].dups) || 0));

  await mongoose.disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
