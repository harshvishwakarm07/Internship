# Student Internship Tracking System (SITS)
## Academic Project Report

Prepared for: Teacher Evaluation  
Prepared by: ____________________  
Class/Semester: ____________________  
Submission Date: ____________________

---

## 1. Abstract
Student Internship Tracking System (SITS) is a full-stack MERN platform developed to digitize the complete internship workflow in academic institutions. The system supports multi-role access (Student, Faculty, Admin, Company), internship approval workflows, weekly report submission with mentor feedback, profile management, role-scoped notifications, and audit logging.

The objective is to reduce manual coordination, improve visibility of internship progress, and enforce accountability through structured status updates and feedback trails.

---

## 2. Problem Statement
Traditional internship tracking in many institutions is handled using spreadsheets, email, and manual approvals. This creates delays, weak traceability, and communication gaps between students, faculty mentors, and administrators.

SITS addresses these gaps by providing:
- Centralized internship data
- Role-based dashboards
- Digital document submission (offer letter, reports, certificate)
- Mentor assignment and review controls
- Real-time status visibility and notifications

---

## 3. Objectives
- Build a secure web platform for internship lifecycle management.
- Implement role-based access control (RBAC).
- Enable document uploads and report review workflow.
- Provide analytics for admin decision making.
- Maintain data integrity with validation and audit logs.

---

## 4. Scope
### In Scope
- User authentication and authorization
- Internship create/approve/reject flow
- Weekly report submission and review
- Student profile and resume management
- Admin user management and mentor assignment
- Notification system by user role

### Out of Scope
- External email/SMS gateway integration
- Cloud file storage (currently local uploads)
- Mobile native application

---

## 5. Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| File Upload | Multer (local disk storage) |
| Testing | Jest, Supertest, mongodb-memory-server |
| Charts | Recharts |

---

## 6. System Architecture
SITS follows a 3-tier architecture:
1. Presentation Layer: React SPA and role dashboards
2. Application Layer: Express REST API controllers and middleware
3. Data Layer: MongoDB collections via Mongoose models

Request flow:
- Frontend sends request with JWT token
- Backend validates token and role
- Validation middleware checks payload
- Controller performs business logic
- Mongoose persists/retrieves data
- Response returned to frontend

---

## 7. DFD (Data Flow Diagram)

### 7.1 Context DFD (Level 0)
See diagram source: docs/diagrams/dfd_level0.mmd

### 7.2 Detailed DFD (Level 1)
See diagram source: docs/diagrams/dfd_level1.mmd

Insert exported DFD images in final document/PPT.

---

## 8. ER Diagram
See ER source: docs/diagrams/er_diagram.mmd

### Main Entities
- User
- StudentProfile
- Internship
- Report
- Feedback
- AuditLog

### Core Relationships
- User (student) 1:1 StudentProfile
- User (student) 1:N Internship
- User (faculty) 1:N Internship as mentor
- Internship 1:N Report
- Report 1:N Feedback
- User 1:N AuditLog as actor

---

## 9. Database Model Details (Mongoose Schemas)

### 9.1 User
Collection: users
- name: String, required
- email: String, required, unique
- password: String, required, hashed with bcrypt pre-save hook
- role: Enum(student, faculty, admin, company), default student
- isActive: Boolean, default true
- timestamps

### 9.2 StudentProfile
Collection: studentprofiles
- user: ObjectId(User), required, unique
- enrollmentNo: String
- department: String
- semester: Number
- phone: String
- resumePath: String
- linkedinUrl: String
- githubUrl: String
- timestamps

### 9.3 Internship
Collection: internships
- student: ObjectId(User), required
- companyName: String, required
- role: String, required
- startDate: Date, required
- endDate: Date, required
- offerLetter: String
- certificate: String
- status: Enum(Pending, Approved, Rejected), default Pending
- mentor: ObjectId(User)
- statusUpdatedBy: ObjectId(User)
- statusUpdatedAt: Date
- rejectionReason: String
- timestamps

### 9.4 Report
Collection: reports
- internship: ObjectId(Internship), required
- student: ObjectId(User), required
- weekNumber: Number, required
- content: String, required
- attachment: String
- submissionDate: Date
- status: Enum(Submitted, Reviewed), default Submitted
- feedback: String
- reviewedBy: ObjectId(User)
- reviewedAt: Date
- timestamps

### 9.5 Feedback
Collection: feedbacks
- report: ObjectId(Report), required
- internship: ObjectId(Internship), required
- student: ObjectId(User), required
- faculty: ObjectId(User), required
- comment: String, required
- rating: Number (1 to 5)
- timestamps

### 9.6 AuditLog
Collection: auditlogs
- actor: ObjectId(User)
- actorRole: String
- action: String, required
- entityType: String, required
- entityId: String
- metadata: Mixed
- ipAddress: String
- userAgent: String
- timestamps

---

## 10. API Module Details

### 10.1 Auth Module
- POST /api/auth/register
- POST /api/auth/login

### 10.2 Internship Module
- POST /api/internships
- GET /api/internships
- GET /api/internships/my
- GET /api/internships/all
- PUT /api/internships/:id/status
- PUT /api/internships/:id/approve
- PUT /api/internships/:id/reject
- PUT /api/internships/:id/certificate

### 10.3 Report Module
- POST /api/reports
- GET /api/reports/:internshipId
- PUT /api/reports/:reportId/feedback

### 10.4 Admin Module
- GET /api/admin/users
- POST /api/admin/users
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id
- PUT /api/admin/assign-mentor/:studentId
- GET /api/admin/stats

### 10.5 Profile Module
- GET /api/profile
- PUT /api/profile

### 10.6 Student Listing Module
- GET /api/students

---

## 11. Validation and Security

### Backend Validation
Implemented using express-validator:
- Register: name >= 2, valid email, password >= 6
- Internship: mandatory fields, valid dates
- Report: internship ObjectId, week 1 to 52, content >= 10 chars
- Feedback: feedback >= 3, rating 1 to 5
- Profile: semester 1 to 12, valid URLs

### Frontend Validation
Implemented as field-level checks with inline error messages in:
- Register page
- Login page
- Add Internship page
- Reports page
- Profile page
- Faculty feedback/reject dialogs

### Security Controls
- JWT token authentication
- Role authorization middleware
- Password hashing with bcryptjs
- ObjectId validation middleware
- Audit logging for critical actions

---

## 12. Notification Design
Role-scoped notifications (poll every 45 seconds):
- Student: internship status updates + report feedback updates
- Faculty: pending/new reports for assigned students only
- Admin: global pending counts

Storage strategy:
- Client-side persisted per user in localStorage key: sits-notifications-{userId}

---

## 13. User Interface Modules
- Authentication (Register/Login)
- Student Dashboard
- Faculty Dashboard
- Admin Dashboard
- Add Internship
- Reports Page
- Profile Page
- Common layout: Sidebar + Navbar + notifications panel

Design highlights:
- Glassmorphism cards
- Neon action buttons
- Status badges
- Fixed sidebar/navbar with controlled content scrolling

---

## 14. Testing Summary
Automated tests cover:
- RBAC restrictions
- Admin user operations
- Internship-report-feedback lifecycle
- Validation failures

Frontend production build status: successful.

---

## 15. Results and Outcomes
- Internship process became traceable and role-driven.
- Faculty visibility limited to assigned students only.
- Input errors reduced using dual-layer validation.
- Documentation and submission readiness improved with structured report artifacts.

---

## 16. Limitations
- Local file storage only (no cloud object storage)
- No push notifications (polling based)
- No advanced analytics forecasting

---

## 17. Future Enhancements
- Email/WhatsApp alerts for status changes
- Cloud storage (AWS S3/Azure Blob)
- ML-based internship recommendation
- Plagiarism checks for weekly reports
- Multi-college deployment support

---

## 18. Screenshots Section (Insert Before Final Submission)
Add screenshots at these points in your final PDF/Word submission.

1. Login page
2. Register page
3. Student Dashboard
4. Add Internship form
5. Reports submission page
6. Faculty review dashboard
7. Admin dashboard statistics
8. Mentor assignment action
9. Profile page update
10. Notifications panel view

Suggested naming:
- ss01_login.png
- ss02_register.png
- ss03_student_dashboard.png
- ss04_add_internship.png
- ss05_reports_page.png
- ss06_faculty_dashboard.png
- ss07_admin_dashboard.png
- ss08_assign_mentor.png
- ss09_profile_page.png
- ss10_notifications_panel.png

---

## 19. Conclusion
SITS demonstrates practical implementation of full-stack engineering, secure API design, role-based governance, schema-driven persistence, and maintainable UI architecture. The project is suitable for academic evaluation and can be extended into a production-ready internship management platform with minimal structural changes.

---

## 20. References
- MongoDB Documentation
- Mongoose Documentation
- Express.js Documentation
- React Documentation
- Tailwind CSS Documentation
- JWT (RFC 7519)
