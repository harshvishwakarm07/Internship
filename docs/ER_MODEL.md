# SITS ER Model

This ER model is derived from the current backend schemas in the models folder.

## Mermaid ER Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "student|faculty|admin|company"
        boolean isActive
        date createdAt
        date updatedAt
    }

    STUDENT_PROFILE {
        ObjectId _id PK
        ObjectId user FK "unique"
        string enrollmentNo
        string department
        number semester
        string phone
        string resumePath
        string linkedinUrl
        string githubUrl
        date createdAt
        date updatedAt
    }

    INTERNSHIP {
        ObjectId _id PK
        ObjectId student FK
        string companyName
        string role
        date startDate
        date endDate
        string offerLetter
        string certificate
        string status "Pending|Approved|Rejected"
        ObjectId mentor FK
        ObjectId statusUpdatedBy FK
        date statusUpdatedAt
        string rejectionReason
        date createdAt
        date updatedAt
    }

    REPORT {
        ObjectId _id PK
        ObjectId internship FK
        ObjectId student FK
        number weekNumber
        string content
        string attachment
        date submissionDate
        string status "Submitted|Reviewed"
        string feedback
        ObjectId reviewedBy FK
        date reviewedAt
        date createdAt
        date updatedAt
    }

    FEEDBACK {
        ObjectId _id PK
        ObjectId report FK
        ObjectId internship FK
        ObjectId student FK
        ObjectId faculty FK
        string comment
        number rating "1..5"
        date createdAt
        date updatedAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId actor FK
        string actorRole
        string action
        string entityType
        string entityId
        mixed metadata
        string ipAddress
        string userAgent
        date createdAt
        date updatedAt
    }

    USER ||--o| STUDENT_PROFILE : has
    USER ||--o{ INTERNSHIP : submits_as_student
    USER ||--o{ INTERNSHIP : mentors
    USER ||--o{ INTERNSHIP : updates_status

    INTERNSHIP ||--o{ REPORT : has
    USER ||--o{ REPORT : submits
    USER ||--o{ REPORT : reviews

    REPORT ||--o{ FEEDBACK : receives
    INTERNSHIP ||--o{ FEEDBACK : contextual_for
    USER ||--o{ FEEDBACK : about_student
    USER ||--o{ FEEDBACK : written_by_faculty

    USER ||--o{ AUDIT_LOG : creates
```

## Relationship Notes

- USER to STUDENT_PROFILE is one-to-zero-or-one because only student users have profiles.
- USER to INTERNSHIP includes multiple semantic links:
  - student (owner)
  - mentor (assigned faculty)
  - statusUpdatedBy (faculty/admin actor)
- REPORT belongs to one INTERNSHIP and one student USER.
- FEEDBACK references the reviewed REPORT and keeps denormalized context to INTERNSHIP, student USER, and faculty USER.
- AUDIT_LOG tracks action history and optionally links actor to USER.
