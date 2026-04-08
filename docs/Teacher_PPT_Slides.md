# SITS Project PPT Deck (Teacher Submission)

Use this as a complete slide-by-slide script to create your PPT.
Recommended: 18 to 22 slides.

---

## Slide 1: Title
- Student Internship Tracking System (SITS)
- Full-Stack MERN Project
- Student Name, Roll No, Department, Guide Name
- Submission Date

Visual:
- Project logo/title image or themed screenshot

---

## Slide 2: Agenda
- Problem Statement
- Objectives
- Architecture
- DFD and ER
- Database Schema and Models
- API and Modules
- UI Screenshots
- Validation and Security
- Results, Limitations, Future Scope

---

## Slide 3: Problem Statement
- Manual internship tracking causes delays and low transparency
- Approvals and report reviews are difficult to monitor
- Communication gap between student, faculty, and admin

---

## Slide 4: Objectives
- Centralize internship workflow
- Implement secure RBAC system
- Enable file uploads and report reviews
- Provide dashboard visibility and auditability

---

## Slide 5: Technology Stack
- Frontend: React + Vite + Tailwind
- Backend: Node + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs
- Uploads: Multer
- Testing: Jest + Supertest

Add table from report for clean presentation.

---

## Slide 6: System Architecture
- 3-tier architecture diagram
- Frontend -> API -> MongoDB
- JWT-secured API flow

Visual:
- Use architecture diagram from docs/diagrams/architecture.mmd

---

## Slide 7: DFD Level 0 (Context)
- External entities: Student, Faculty, Admin
- System: SITS
- Data stores: User DB, Internship DB, Report DB

Visual:
- Render and insert docs/diagrams/dfd_level0.mmd

---

## Slide 8: DFD Level 1
- Auth process
- Internship submission and approval
- Weekly report and feedback cycle
- Admin analytics and mentor assignment

Visual:
- Render and insert docs/diagrams/dfd_level1.mmd

---

## Slide 9: ER Diagram
- User, StudentProfile, Internship, Report, Feedback, AuditLog
- Explain primary relations and cardinality

Visual:
- Render and insert docs/diagrams/er_diagram.mmd

---

## Slide 10: Database Schema Summary
- Collection-wise key fields
- References through ObjectId
- Status enums and timestamps

Tip:
- Use a condensed table (Entity, Primary fields, Relationships)

---

## Slide 11: User Model and Auth Flow
- User schema fields and role enum
- Password hashing pre-save hook
- JWT login flow

---

## Slide 12: Internship + Report Models
- Internship lifecycle fields
- Report review fields
- Feedback and audit linkage

---

## Slide 13: API Endpoints
- Auth APIs
- Internship APIs
- Report APIs
- Admin APIs
- Profile APIs

Tip:
- Show grouped endpoint table for readability

---

## Slide 14: Validation and Security
- Backend: express-validator and ObjectId checks
- Frontend: inline field-level validation
- JWT auth and role middleware
- Audit logs for accountability

---

## Slide 15: Notification Design
- Polling every 45 seconds
- Student notifications: status and feedback
- Faculty notifications: assigned students only
- Admin notifications: platform-wide pending

---

## Slide 16: UI Screenshots - Authentication + Student
Insert:
- ss01_login.png
- ss02_register.png
- ss03_student_dashboard.png
- ss04_add_internship.png
- ss05_reports_page.png

---

## Slide 17: UI Screenshots - Faculty + Admin
Insert:
- ss06_faculty_dashboard.png
- ss07_admin_dashboard.png
- ss08_assign_mentor.png
- ss10_notifications_panel.png

---

## Slide 18: Testing and Build Results
- Integration tests coverage areas
- Frontend build success summary
- Error handling and status code checks

---

## Slide 19: Outcomes and Learning
- Full-stack integration experience
- Role-based security design
- Schema design and data relationship modeling
- Real-world workflow automation

---

## Slide 20: Limitations and Future Scope
Limitations:
- Local storage only
- Polling-based notifications
- No external communication channels

Future scope:
- Cloud storage
- Email/SMS alerts
- AI-based insights

---

## Slide 21: Conclusion
- SITS successfully digitizes internship lifecycle
- Improves visibility, accountability, and speed
- Ready for institutional pilot with minor enhancements

---

## Slide 22: Thank You
- Thank You
- Questions and Discussion

---

## Screenshot Collection Checklist
Capture and place under docs/screenshots:
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
