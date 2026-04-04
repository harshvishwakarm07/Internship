require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Internship = require('./models/Internship');
const Report = require('./models/Report');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');

const DEMO_EMAIL_REGEX = /^demo\./i;

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
}

async function cleanupDemoData() {
  const demoUsers = await User.find({ email: DEMO_EMAIL_REGEX }).select('_id');
  const demoUserIds = demoUsers.map((user) => user._id);

  const demoInternships = await Internship.find({
    $or: [
      { student: { $in: demoUserIds } },
      { companyName: /^Demo /i },
    ],
  }).select('_id');

  const demoInternshipIds = demoInternships.map((internship) => internship._id);

  const demoReports = await Report.find({
    $or: [
      { student: { $in: demoUserIds } },
      { internship: { $in: demoInternshipIds } },
    ],
  }).select('_id');

  const demoReportIds = demoReports.map((report) => report._id);

  await Feedback.deleteMany({
    $or: [
      { report: { $in: demoReportIds } },
      { internship: { $in: demoInternshipIds } },
      { student: { $in: demoUserIds } },
      { faculty: { $in: demoUserIds } },
    ],
  });

  await Report.deleteMany({ _id: { $in: demoReportIds } });
  await Internship.deleteMany({ _id: { $in: demoInternshipIds } });
  await StudentProfile.deleteMany({ user: { $in: demoUserIds } });
  await AuditLog.deleteMany({
    $or: [
      { actor: { $in: demoUserIds } },
      { metadata: { $regex: 'demo\\.', $options: 'i' } },
    ],
  }).catch(() => {});
  await User.deleteMany({ _id: { $in: demoUserIds } });
}

async function seedDemoData() {
  const password = 'Pass@1234';

  const [admin, faculty, studentA, studentB, company] = await User.create([
    {
      name: 'Demo Admin',
      email: 'demo.admin@sits.local',
      password,
      role: 'admin',
    },
    {
      name: 'Demo Faculty',
      email: 'demo.faculty@sits.local',
      password,
      role: 'faculty',
    },
    {
      name: 'Demo Student One',
      email: 'demo.student1@sits.local',
      password,
      role: 'student',
    },
    {
      name: 'Demo Student Two',
      email: 'demo.student2@sits.local',
      password,
      role: 'student',
    },
    {
      name: 'Demo Company',
      email: 'demo.company@sits.local',
      password,
      role: 'company',
    },
  ]);

  await StudentProfile.create([
    {
      user: studentA._id,
      enrollmentNo: 'SITS-2026-001',
      department: 'Computer Engineering',
      semester: 8,
      phone: '9999990001',
      resumePath: '/uploads/demo-student1-resume.pdf',
      linkedinUrl: 'https://linkedin.com/in/demo-student1',
      githubUrl: 'https://github.com/demo-student1',
    },
    {
      user: studentB._id,
      enrollmentNo: 'SITS-2026-002',
      department: 'Information Technology',
      semester: 8,
      phone: '9999990002',
      resumePath: '/uploads/demo-student2-resume.pdf',
      linkedinUrl: 'https://linkedin.com/in/demo-student2',
      githubUrl: 'https://github.com/demo-student2',
    },
  ]);

  const internships = await Internship.create([
    {
      student: studentA._id,
      companyName: 'Demo Tech Labs',
      role: 'MERN Intern',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-15'),
      offerLetter: '/uploads/demo-offer-student1.pdf',
      certificate: '/uploads/demo-certificate-student1.pdf',
      status: 'Approved',
      mentor: faculty._id,
      statusUpdatedBy: faculty._id,
      statusUpdatedAt: new Date('2026-01-20'),
    },
    {
      student: studentB._id,
      companyName: 'Demo Cloud Systems',
      role: 'Backend Intern',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-07-01'),
      offerLetter: '/uploads/demo-offer-student2.pdf',
      status: 'Pending',
      mentor: faculty._id,
    },
    {
      student: studentB._id,
      companyName: 'Demo Data Works',
      role: 'Data Analyst Intern',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-06-10'),
      offerLetter: '/uploads/demo-offer-student2-alt.pdf',
      status: 'Rejected',
      mentor: faculty._id,
      statusUpdatedBy: admin._id,
      statusUpdatedAt: new Date('2026-01-14'),
      rejectionReason: 'Internship role does not match approved curriculum list.',
    },
  ]);

  const [approvedInternship] = internships;

  const reports = await Report.create([
    {
      internship: approvedInternship._id,
      student: studentA._id,
      weekNumber: 1,
      content: 'Completed onboarding, set up local dev stack, and delivered first API module.',
      attachment: '/uploads/demo-report-week1.pdf',
      status: 'Reviewed',
      feedback: 'Strong start. Keep documenting implementation details weekly.',
      reviewedBy: faculty._id,
      reviewedAt: new Date('2026-01-27'),
    },
    {
      internship: approvedInternship._id,
      student: studentA._id,
      weekNumber: 2,
      content: 'Implemented dashboard filters and improved report upload handling.',
      attachment: '/uploads/demo-report-week2.pdf',
      status: 'Submitted',
    },
  ]);

  await Feedback.create({
    report: reports[0]._id,
    internship: approvedInternship._id,
    student: studentA._id,
    faculty: faculty._id,
    comment: 'Great clarity and ownership. Add performance metrics next week.',
    rating: 4,
  });

  await AuditLog.create([
    {
      actor: admin._id,
      actorRole: 'admin',
      action: 'DEMO_SEED_RUN',
      entityType: 'System',
      entityId: 'seedDemoData',
      metadata: { email: admin.email, note: 'Inserted demo dataset for flow testing.' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
    {
      actor: faculty._id,
      actorRole: 'faculty',
      action: 'INTERNSHIP_STATUS_UPDATE',
      entityType: 'Internship',
      entityId: String(approvedInternship._id),
      metadata: { status: 'Approved', source: 'seedDemoData' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
  ]);

  return {
    credentials: [
      { role: 'admin', email: admin.email, password },
      { role: 'faculty', email: faculty.email, password },
      { role: 'student', email: studentA.email, password },
      { role: 'student', email: studentB.email, password },
      { role: 'company', email: company.email, password },
    ],
    counts: {
      users: 5,
      studentProfiles: 2,
      internships: internships.length,
      reports: reports.length,
      feedbacks: 1,
      auditLogs: 2,
    },
  };
}

async function run() {
  try {
    await connect();
    await cleanupDemoData();
    const result = await seedDemoData();

    console.log('Demo data seeded successfully.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Failed to seed demo data.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
