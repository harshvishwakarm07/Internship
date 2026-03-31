const request = require('supertest');
const path = require('path');
const app = require('../../app');

const validUploadPath = path.resolve(__dirname, '../../uploads/qa_test_valid.pdf');

const registerAndLogin = async (role, suffix) => {
  const payload = {
    name: `${role}-${suffix}`,
    email: `${role}.${suffix}@test.local`,
    password: 'Pass@1234',
    role,
  };

  await request(app).post('/api/auth/register').send(payload).expect(201);
  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password,
  }).expect(200);

  return loginRes.body;
};

describe('RBAC integration', () => {
  test('student cannot access admin users endpoint', async () => {
    const student = await registerAndLogin('student', Date.now());
    await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${student.token}`)
      .expect(403);
  });

  test('admin can manage users via /api/users', async () => {
    const admin = await registerAndLogin('admin', Date.now());

    const created = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        name: 'Managed User',
        email: `managed.${Date.now()}@test.local`,
        password: 'Pass@1234',
        role: 'student',
      })
      .expect(201);

    await request(app)
      .delete(`/api/users/${created.body._id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });

  test('student submits internship, faculty approves, and feedback flow works', async () => {
    const student = await registerAndLogin('student', `s${Date.now()}`);
    const faculty = await registerAndLogin('faculty', `f${Date.now()}`);
    const admin = await registerAndLogin('admin', `a${Date.now()}`);

    const internshipRes = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${student.token}`)
      .field('companyName', 'Acme Corp')
      .field('role', 'Intern')
      .field('startDate', '2026-01-01')
      .field('endDate', '2026-06-01')
      .attach('offerLetter', validUploadPath)
      .expect(201);

    await request(app)
      .put(`/api/admin/assign-mentor/${student._id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ facultyId: faculty._id })
      .expect(200);

    await request(app)
      .put(`/api/internships/${internshipRes.body._id}/approve`)
      .set('Authorization', `Bearer ${faculty.token}`)
      .send({})
      .expect(200);

    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${student.token}`)
      .field('internship', internshipRes.body._id)
      .field('weekNumber', 1)
      .field('content', 'Completed onboarding and basic tasks for week one.')
      .attach('attachment', validUploadPath)
      .expect(201);

    await request(app)
      .put(`/api/reports/${reportRes.body._id}/feedback`)
      .set('Authorization', `Bearer ${faculty.token}`)
      .send({ feedback: 'Good progress', status: 'Reviewed', rating: 4 })
      .expect(200);
  });

  test('validation rejects invalid auth payload', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'x', email: 'invalid', password: '123' })
      .expect(400);

    expect(res.body.message).toContain('Validation failed');
  });
});
