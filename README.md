

# SITS — Student Internship Tracking System

A full-stack MERN application for academic institutions to manage student internship workflows — from submission to approval, weekly reporting, mentor feedback, and completion certification.

Built with a futuristic glassmorphism UI featuring dark/light theming, animated transitions, role-scoped notifications, and full form validation.

---

## Demo Credentials

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | demo.admin@sits.local     | Pass@1234  |
| Faculty | demo.faculty@sits.local   | Pass@1234  |
| Student | demo.student1@sits.local  | Pass@1234  |
| Student | demo.student2@sits.local  | Pass@1234  |
| Company | demo.company@sits.local   | Pass@1234  |

> To seed demo data: `cd backend && node seedDemoData.js`

---

## Tech Stack

| Layer     | Technology                                     |
|-----------|------------------------------------------------|
| Frontend  | React 18 + Vite, Tailwind CSS, Framer Motion   |
| Auth      | JWT + bcryptjs                                 |
| API       | Node.js + Express                              |
| Database  | MongoDB + Mongoose                             |
| Uploads   | Multer (local disk)                            |
| Charts    | Recharts                                       |
| Testing   | Jest + Supertest + mongodb-memory-server       |
| Validation| express-validator (backend), custom (frontend) |

---

## Features

### Role-Based Access Control

- **Student** — submit internships, upload offer letter/certificate, submit weekly reports, manage profile
- **Faculty** — review and approve/reject only their **assigned students'** internships, provide report feedback
- **Admin** — manage all users, assign mentors, view analytics, audit logs

### UI / UX

- Futuristic glassmorphism design — `backdrop-blur`, neon cyan/teal gradient palette
- Custom thin cyan→teal scrollbar (6px)
- Sidebar and navbar fixed in place; only main content area scrolls
- Animated page transitions (Framer Motion)
- Dark/light mode persisted in localStorage

### Form Validation

Every form has both **client-side** (inline field errors) and **server-side** (express-validator) validation:

| Form             | Validated Fields                                                               |
|------------------|--------------------------------------------------------------------------------|
| Register         | Name (min 2), email format, password (min 6), confirm password match           |
| Login            | Email format, password not empty                                               |
| Add Internship   | Company (min 2), role (min 2), end date > start date, file type + size ≤ 5 MB |
| Submit Report    | Week number (1–52), content (min 10 chars), file type + size ≤ 5 MB           |
| Faculty Feedback | Feedback text (min 3 chars)                                                    |
| Reject Reason    | Rejection reason required, min 3 chars                                         |
| Profile          | Phone format, semester (1–12), LinkedIn/GitHub valid URLs                      |

### Scoped Notifications

Notifications are per-user and role-scoped (stored in localStorage keyed by `sits-notifications-{userId}`):

- **Student** — internship status change (Approved/Rejected) + new mentor feedback on any report
- **Faculty** — new pending submissions + new reports from **assigned students only** (API filters `{ mentor: req.user._id }`)
- **Admin** — all platform-wide pending submissions

Polling interval: 45 seconds.

---

## Project Structure

```text
InternShip/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── seedDemoData.js
│   ├── cleanupQaData.js
│   ├── config/db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── StudentProfile.js
│   │   ├── Internship.js
│   │   ├── Report.js
│   │   ├── Feedback.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── internshipController.js
│   │   ├── reportController.js
│   │   ├── adminController.js
│   │   └── profileController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── internshipRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── userRoutes.js
│   │   ├── facultyRoutes.js
│   │   └── profileRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   ├── validateObjectId.js
│   │   └── requestValidation.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── validators.js
│   │   └── audit.js
│   ├── tests/
│   │   ├── setup.js
│   │   └── integration/rbac.integration.test.js
│   └── uploads/
└── frontend/
    ├── tailwind.config.cjs
    └── src/
	   ├── index.css
	   ├── context/
	   │   ├── AuthContext.jsx
	   │   ├── ThemeContext.jsx
	   │   └── NotificationContext.jsx
	   ├── services/api.js
	   ├── layouts/AppLayout.jsx
	   ├── components/
	   │   ├── common/
	   │   │   ├── AnimatedPage.jsx
	   │   │   └── NotificationsPanel.jsx
	   │   ├── dashboard/AnalyticsCharts.jsx
	   │   └── layout/
	   │       ├── Navbar.jsx
	   │       └── Sidebar.jsx
	   └── pages/
		  ├── Login.jsx
		  ├── Register.jsx
		  ├── StudentDashboard.jsx
		  ├── FacultyDashboard.jsx
		  ├── AdminDashboard.jsx
		  ├── AddInternship.jsx
		  ├── ReportsPage.jsx
		  ├── ProfilePage.jsx
		  ├── Unauthorized.jsx
		  └── NotFound.jsx
```

---

## User Roles and Permissions

### Student

| Can | Cannot |
|-----|--------|
| Register and login | Access admin or faculty routes |
| Submit internship + offer letter | Approve/reject internships |
| View own internships and status | View other students' data |
| Upload completion certificate | |
| Submit weekly reports with attachments | |
| View own report history and mentor feedback | |
| Manage profile and resume | |

### Faculty

| Can | Cannot |
|-----|--------|
| Login and access Faculty Review Center | Access admin user CRUD |
| View only their assigned students' internships | View or act on unassigned students |
| Approve or reject internships (rejection reason required) | Delete users |
| View reports for assigned students only | |
| Provide feedback on reports (min 3 chars) | |

> Faculty mentor assignment is done by Admin via `PUT /api/admin/assign-mentor/:studentId`.
> The `Internship.mentor` field stores the assigned faculty `_id`.

### Admin

| Can | Cannot |
|-----|--------|
| View all users, internships, and stats | Delete their own account |
| Create, update, delete users | |
| Assign faculty mentors to students | |
| Access analytics charts and audit logs | |

---

## Internship Lifecycle

```
Student submits
	↓
  Pending
	↓
Admin assigns Faculty Mentor
	↓
Faculty Reviews
	├─ Approves → Student submits weekly Reports
	│                      ↓
	│             Faculty provides Feedback
	│                      ↓
	│             Student uploads Certificate
	└─ Rejects (reason required)
		↓
	Student sees rejection reason in dashboard
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint       | Access | Description        |
|--------|----------------|--------|--------------------|
| POST   | /auth/register | Public | Register user      |
| POST   | /auth/login    | Public | Login, returns JWT |

### Internships

| Method | Endpoint                     | Access        | Description                           |
|--------|------------------------------|---------------|---------------------------------------|
| POST   | /internships                 | Student       | Create internship + offer letter      |
| GET    | /internships                 | Student       | Get own internships                   |
| GET    | /internships/my              | Student       | Get own internships (alias)           |
| GET    | /internships/all             | Faculty/Admin | Get all (faculty: assigned only)      |
| PUT    | /internships/:id/status      | Faculty/Admin | Approve or Reject with status field   |
| PUT    | /internships/:id/approve     | Faculty/Admin | Approve shorthand                     |
| PUT    | /internships/:id/reject      | Faculty/Admin | Reject (rejectionReason required)     |
| PUT    | /internships/:id/certificate | Student       | Upload completion certificate         |

### Reports

| Method | Endpoint                    | Access        | Description                                  |
|--------|-----------------------------|---------------|----------------------------------------------|
| POST   | /reports                    | Student       | Submit weekly report + attachment            |
| GET    | /reports/:internshipId      | Role-scoped   | Student: own only; Faculty: assigned only    |
| PUT    | /reports/:reportId/feedback | Faculty/Admin | Add feedback + mark Reviewed                 |

### Admin

| Method | Endpoint                        | Access | Description          |
|--------|---------------------------------|--------|----------------------|
| GET    | /admin/users                    | Admin  | List all users       |
| POST   | /admin/users                    | Admin  | Create user          |
| PUT    | /admin/users/:id                | Admin  | Update user          |
| DELETE | /admin/users/:id                | Admin  | Delete user          |
| PUT    | /admin/assign-mentor/:studentId | Admin  | Assign faculty mentor|
| GET    | /admin/stats                    | Admin  | Platform statistics  |

### Profile

| Method | Endpoint | Access  | Description                    |
|--------|----------|---------|--------------------------------|
| GET    | /profile | Student | Get student profile            |
| PUT    | /profile | Student | Update profile + resume upload |

### Faculty

| Method | Endpoint  | Access        | Description                 |
|--------|-----------|---------------|-----------------------------|
| GET    | /students | Faculty/Admin | List students with profiles |

---

## API Examples

### Register

```http
POST /api/auth/register
Content-Type: application/json

{ "name": "Aarav", "email": "aarav@test.local", "password": "Pass@1234", "role": "student" }
```

### Submit Internship

```bash
curl -X POST http://localhost:5000/api/internships \
  -H "Authorization: Bearer <student_token>" \
  -F "companyName=Acme Corp" -F "role=Frontend Intern" \
  -F "startDate=2026-04-01" -F "endDate=2026-09-30" \
  -F "offerLetter=@offer.pdf"
```

### Approve Internship

```http
PUT /api/internships/<id>/approve
Authorization: Bearer <faculty_token>
```

### Reject Internship

```http
PUT /api/internships/<id>/reject
Authorization: Bearer <faculty_token>
Content-Type: application/json

{ "rejectionReason": "Offer letter details are incomplete." }
```

### Submit Report

```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer <student_token>" \
  -F "internship=<id>" -F "weekNumber=1" \
  -F "content=Completed onboarding and project setup." \
  -F "attachment=@week1.pdf"
```

### Add Feedback

```http
PUT /api/reports/<reportId>/feedback
Authorization: Bearer <faculty_token>
Content-Type: application/json

{ "feedback": "Good progress. Improve documentation.", "status": "Reviewed", "rating": 4 }
```

### Assign Mentor (Admin)

```http
PUT /api/admin/assign-mentor/<studentUserId>
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "facultyId": "<facultyUserId>" }
```

---

## Error Codes

| Code | Meaning                              |
|------|--------------------------------------|
| 400  | Validation error / bad request data  |
| 401  | Missing or invalid JWT token         |
| 403  | Role not authorized for this route   |
| 404  | Resource not found                   |
| 409  | Conflict (e.g. duplicate email)      |
| 413  | Uploaded file too large (> 5 MB)     |
| 415  | Unsupported file type                |
| 500  | Internal server error                |

---

## Environment Setup

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sits
JWT_SECRET=your_strong_secret_here_min_32_chars
ALLOW_PUBLIC_ADMIN_REGISTER=false
```

> Set `ALLOW_PUBLIC_ADMIN_REGISTER=true` only for local QA — never in production.

### Frontend (`frontend/.env`) — optional

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ASSET_BASE_URL=http://localhost:5000
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/sits`)

### 2. Install Dependencies

```powershell
cd backend ; npm install
cd ../frontend ; npm install
```

### 3. Configure Environment

Create `backend/.env` with values from the Environment Setup section above.

### 4. Seed Demo Data (optional)

```powershell
cd backend
node seedDemoData.js
```

### 5. Start Backend

```powershell
cd backend
npm run dev
# Server running on http://localhost:5000
```

### 6. Start Frontend

```powershell
cd frontend
npm run dev
# App running on http://localhost:5173
```

---

## Running Tests

```powershell
cd backend
npm test
```

The integration test suite validates:

- Student RBAC restrictions (cannot access faculty/admin routes)
- Admin user management (create, update, delete)
- Full internship → approve → report → feedback workflow
- Unassigned faculty receives 403 on another faculty's student reports
- Request validation rejections (bad email, short password, etc.)

All tests must pass with exit code 0.

---

## File Uploads

Files are stored in `backend/uploads/`.

| Field       | Route                            | Allowed Types | Max Size |
|-------------|----------------------------------|---------------|----------|
| offerLetter | POST /internships                | PDF/JPG/PNG   | 5 MB     |
| attachment  | POST /reports                    | PDF/JPG/PNG   | 5 MB     |
| certificate | PUT /internships/:id/certificate | PDF/JPG/PNG   | 5 MB     |
| resume      | PUT /profile                     | PDF/JPG/PNG   | 5 MB     |

Paths stored in MongoDB as `/uploads/<filename>`.  
Frontend retrieves with `getAssetUrl(path)` from `services/api.js`.

---

## Validation Reference

### Backend (express-validator)

| Route group   | Validated fields                                               |
|---------------|----------------------------------------------------------------|
| Auth          | name, email, password, role                                    |
| Internship    | companyName, role, startDate, endDate, status, rejectionReason |
| Report        | internship (MongoId), weekNumber (1–52), content (min 10)      |
| Feedback      | feedback (min 3), status (enum), rating (1–5)                  |
| Admin user    | name, email, password, role (create/update)                    |
| Mentor assign | studentId and facultyId both valid MongoIds                    |
| Profile       | phone length, semester range (1–12), URL format                |

### Frontend (inline field errors)

Each form shows per-field error messages and highlights the field in red before any API call is made.  
File inputs are validated for MIME type and size client-side.

---

## Audit Logging

Critical actions are persisted in the `AuditLog` collection:

| Action                   | Triggered by                      |
|--------------------------|-----------------------------------|
| USER_REGISTER            | auth register                     |
| USER_LOGIN               | auth login                        |
| INTERNSHIP_CREATE        | student submits internship        |
| INTERNSHIP_STATUS_UPDATE | faculty/admin approves or rejects |
| INTERNSHIP_CERTIFICATE   | student uploads certificate       |
| REPORT_SUBMIT            | student submits weekly report     |
| REPORT_REVIEW            | faculty submits feedback          |
| USER_CREATE              | admin creates user                |
| USER_UPDATE              | admin updates user                |
| USER_DELETE              | admin deletes user                |
| MENTOR_ASSIGN            | admin assigns faculty mentor      |
| PROFILE_UPDATE           | student updates profile           |

Each log entry stores: actor, actorRole, action, entityType, entityId, metadata, IP, userAgent, timestamp.

---

## Workflow Guide

### Authentication Flow

1. User opens Login or Register page
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage and attaches it automatically to future API requests via Axios interceptor
4. User is redirected to role dashboard (Student / Faculty / Admin)
5. If token expires, user is automatic ally logged out

### Student Journey

1. Register and login
2. Submit internship with offer letter → status = Pending
3. Admin assigns a faculty mentor
4. Track status in dashboard
5. Once Approved: submit weekly reports
6. Receive mentor feedback via notifications panel
7. Upload completion certificate

### Faculty Journey

1. Login → Faculty Review Center
2. See only assigned students' internships
3. Approve or Reject (with reason)
4. Open report history per internship
5. Write feedback (min 3 chars) and mark reports Reviewed

### Admin Journey

1. Login → Admin Dashboard with charts
2. Create/manage users
3. Assign faculty mentors to students
4. Monitor internship stats and audit logs

---

## Troubleshooting

### Port 5000 already in use

```powershell
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

### MongoDB connection refused

```powershell
mongod --dbpath C:\data\db
```

### Faculty sees "No internships available"

Admin must assign the faculty as mentor first:

```http
PUT /api/admin/assign-mentor/<studentUserId>
Authorization: Bearer <admin_token>
{ "facultyId": "<facultyUserId>" }
```

### 401 on every request

Token expired. Clear localStorage and log in again.

### QA scripts fail with 403 admin register

```powershell
$env:ALLOW_PUBLIC_ADMIN_REGISTER="true"; npm run dev
```

---

## Security Notes

- Keep `JWT_SECRET` private, minimum 32 characters, randomly generated
- Never set `ALLOW_PUBLIC_ADMIN_REGISTER=true` in production
- Never commit `.env` files (add to `.gitignore`)
- File MIME types and size are enforced server-side regardless of frontend validation
- In production: use HTTPS, a reverse proxy (nginx), and rate limiting

---

## License

For academic/project use. See your institution's guidelines before redistributing.

