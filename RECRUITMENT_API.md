# Recruitment System APIs

---

## 🔹 1. Public Endpoints (Career Page)

| Description                                    | Endpoint                   | Auth      | Method   |
| ---------------------------------------------- | -------------------------- | --------- | -------- |
| List all published job posts (for career page) | `/api/jobs`              | – (none) | `GET`  |
| Show full details of a single job post         | `/api/jobs/{slug}`       | – (none) | `GET`  |
| Submit an application for a job                | `/api/jobs/{slug}/apply` | – (none) | `POST` |

### `POST /api/jobs/{slug}/apply`

> **Content-Type:** `multipart/form-data`

**Required Fields**

| Field         | Type                     | Notes   |
| ------------- | ------------------------ | ------- |
| `firstname` | string                   |         |
| `lastname`  | string                   |         |
| `email`     | email                    |         |
| `phone`     | string                   |         |
| `cv_file`   | file (PDF/DOC, max 5 MB) | CV file |

**Optional Fields**

| Field                | Type              | Notes                                                           |
| -------------------- | ----------------- | --------------------------------------------------------------- |
| `birth_date`       | date (YYYY-MM-DD) |                                                                 |
| `gender`           | enum              | `male` \| `female`                                          |
| `city`             | string            |                                                                 |
| `country`          | string            |                                                                 |
| `linkedin`         | URL               | LinkedIn profile                                                |
| `experience_years` | integer           | Years of experience                                             |
| `current_salary`   | number            |                                                                 |
| `expected_salary`  | number            |                                                                 |
| `notice_period`    | string            | e.g.`"2 weeks"`                                               |
| `current_company`  | string            |                                                                 |
| `english_level`    | string            |                                                                 |
| `skills`           | array\<string\>   | e.g.`["PHP", "Laravel", "MySQL"]`                             |
| `languages`        | array\<string\>   | e.g.`["Arabic", "English"]`                                   |
| `source`           | string            | e.g.`LinkedIn`, `Company Website`, `Referral`, `Indeed` |

---

## 🔹 2. Job Requests

| Description                                                   | Endpoint                                       | Auth   | Method     |
| ------------------------------------------------------------- | ---------------------------------------------- | ------ | ---------- |
| List all job requests (filters:`status`, `department_id`) | `/api/recruitment/job-requests`              | Bearer | `GET`    |
| Create a new job request                                      | `/api/recruitment/job-requests`              | Bearer | `POST`   |
| Show a job request                                            | `/api/recruitment/job-requests/{id}`         | Bearer | `GET`    |
| Update a job request*(only draft allowed)*                    | `/api/recruitment/job-requests/{id}`         | Bearer | `PUT`    |
| Soft-delete a job request                                     | `/api/recruitment/job-requests/{id}`         | Bearer | `DELETE` |
| Submit request for approval*(draft → pending)*               | `/api/recruitment/job-requests/{id}/submit`  | Bearer | `POST`   |
| Approve a pending request                                     | `/api/recruitment/job-requests/{id}/approve` | Bearer | `POST`   |
| Reject a pending request                                      | `/api/recruitment/job-requests/{id}/reject`  | Bearer | `POST`   |
| Reopen a rejected request*(sets back to draft)*               | `/api/recruitment/job-requests/{id}/reopen`  | Bearer | `POST`   |

### `POST /api/recruitment/job-requests` — Create

```json
{
  "department_id": 1,                     // required | exists:departments
  "position_id": 2,                       // required | exists:positions
  "requested_by_employee_id": 3,          // required | exists:employees
  "branch_id": 1,                         // optional | exists:branches
  "requested_count": 2,                   // required | integer, min:1
  "priority": "high",                     // required | enum: low, medium, high, urgent
  "reason": "Need developers",            // optional | string
  "notes": "Urgent",                      // optional | string
  "needed_before": "2026-08-15",          // optional | date
  "employment_type": "full_time",         // required | enum: full_time, part_time, contract, internship, freelance
  "request_type": "expansion",            // required | enum: replacement, expansion, temporary, seasonal
  "budget_salary_from": 5000,             // optional | numeric, min:0
  "budget_salary_to": 8000,              // optional | numeric, min:0, gte:budget_salary_from
  "replacement_for_employee_id": null     // optional | exists:employees
}
```

### `PUT /api/recruitment/job-requests/{id}` — Update *(draft only)*

```json
{
  "department_id": 1,                     // optional | exists:departments
  "position_id": 2,                       // optional | exists:positions
  "requested_by_employee_id": 3,          // optional | exists:employees
  "branch_id": 1,                         // optional | exists:branches
  "requested_count": 2,                   // optional | integer, min:1
  "priority": "high",                     // optional | enum: low, medium, high, urgent
  "reason": "Need developers",            // optional | string
  "notes": "Urgent requirement",          // optional | string
  "needed_before": "2026-08-15",          // optional | date
  "employment_type": "full_time",         // optional | enum: full_time, part_time, contract, internship, freelance
  "request_type": "expansion",            // optional | enum: replacement, expansion, temporary, seasonal
  "budget_salary_from": 5000,             // optional | numeric, min:0
  "budget_salary_to": 8000,              // optional | numeric, min:0, gte:budget_salary_from
  "replacement_for_employee_id": null     // optional | exists:employees
}
```

### `POST /api/recruitment/job-requests/{id}/approve`

```json
{
  "approval_notes": "Approved by HR"  // optional | string
}
```

### `POST /api/recruitment/job-requests/{id}/reject`

```json
{
  "reason": "Budget not approved"  // required | string
}
```

---

## 🔹 3. Job Posts

| Description                                                                      | Endpoint                                    | Auth   | Method     |
| -------------------------------------------------------------------------------- | ------------------------------------------- | ------ | ---------- |
| List all job posts (filters:`status`, `job_request_id`, `employment_type`) | `/api/recruitment/job-posts`              | Bearer | `GET`    |
| Create a job post*(requires approved job request)*                               | `/api/recruitment/job-posts`              | Bearer | `POST`   |
| Show a job post with full details                                                | `/api/recruitment/job-posts/{id}`         | Bearer | `GET`    |
| Update a job post                                                                | `/api/recruitment/job-posts/{id}`         | Bearer | `PUT`    |
| Soft-delete a job post                                                           | `/api/recruitment/job-posts/{id}`         | Bearer | `DELETE` |
| Publish a job post*(draft → published)*                                         | `/api/recruitment/job-posts/{id}/publish` | Bearer | `POST`   |
| Close a published or draft job post                                              | `/api/recruitment/job-posts/{id}/close`   | Bearer | `POST`   |
| Archive a closed job post                                                        | `/api/recruitment/job-posts/{id}/archive` | Bearer | `POST`   |

### `POST /api/recruitment/job-posts` — Create

```json
{
  "job_request_id": 1,                    // required | exists:recruitment_job_requests
  "title": "BackEnd Developer",           // required | string
  "slug": "backend-developer",            // required | string, unique
  "description": "We are looking...",     // optional | string
  "employment_type": "full_time",         // required | enum: full_time, part_time, contract, internship, freelance
  "salary_min": 6000,                     // optional | numeric, min:0
  "salary_max": 8000,                     // optional | numeric, min:0, gte:salary_min
  "location": "Cairo",                    // optional | string
  "deadline": "2026-08-30",              // optional | date, after:today
  "requirements_snapshot": null           // optional | array
}
```

### `PUT /api/recruitment/job-posts/{id}` — Update

```json
{
  "job_request_id": 1,                    // optional | exists:recruitment_job_requests
  "title": "BackEnd Developer",           // optional | string
  "slug": "backend-developer",            // optional | string, unique
  "description": "We are looking...",     // optional | string
  "employment_type": "full_time",         // optional | enum: full_time, part_time, contract, internship, freelance
  "salary_min": 6000,                     // optional | numeric, min:0
  "salary_max": 8000,                     // optional | numeric, min:0, gte:salary_min
  "location": "Cairo",                    // optional | string
  "deadline": "2026-08-30",              // optional | date, after:today
  "status": "draft",                      // optional | enum: draft, published, closed, archived
  "requirements_snapshot": null           // optional | array
}
```

### `POST /api/recruitment/job-posts/{id}/publish`

```json
{
  "platforms": [
    {
      "platform_name": "LinkedIn",        // required | string
      "publish_method": "copy_text",      // required | enum: copy_text, manual, automatic
      "external_url": null                // optional | url
    },
    {
      "platform_name": "Company Website",
      "publish_method": "manual",
      "external_url": null
    }
  ]
}
```

---

## 🔹 4. Candidates

| Description                                          | Endpoint                             | Auth   | Method     |
| ---------------------------------------------------- | ------------------------------------ | ------ | ---------- |
| List all candidates (filters:`status`, `source`) | `/api/recruitment/candidates`      | Bearer | `GET`    |
| Create a candidate manually                          | `/api/recruitment/candidates`      | Bearer | `POST`   |
| Show a candidate with applications                   | `/api/recruitment/candidates/{id}` | Bearer | `GET`    |
| Update a candidate                                   | `/api/recruitment/candidates/{id}` | Bearer | `PUT`    |
| Soft-delete a candidate                              | `/api/recruitment/candidates/{id}` | Bearer | `DELETE` |

### `POST /api/recruitment/candidates` — Create

```json
{
  "firstname": "John",                              // required | string
  "lastname": "Doe",                               // required | string
  "email": "john.doe@example.com",                 // required | email, unique
  "phone": "+201234567890",                        // required | string
  "birth_date": "1990-01-01",                      // required | date
  "gender": "male",                                // required | enum: male, female
  "city": "Cairo",                                 // required | string
  "country": "Egypt",                              // required | string
  "linkedin": "https://linkedin.com/in/johndoe",   // optional | url
  "experience_years": 5,                           // optional | integer
  "current_salary": 7000,                          // optional | numeric
  "expected_salary": 9000,                         // optional | numeric
  "notice_period": "2 weeks",                      // optional | string
  "current_company": "Acme Corp",                  // optional | string
  "highest_education": "Bachelor",                 // optional | string
  "english_level": "Advanced",                     // optional | string
  "skills": ["PHP", "Laravel"],                    // optional | array
  "languages": ["Arabic", "English"],              // optional | array
  "cv_file": "(file upload)",                      // required | file, mimes:pdf,doc,docx, max:5MB
  "source": "LinkedIn",                            // optional | string
  "notes": "Good candidate",                       // optional | string
  "status": "active"                               // optional | enum: active, blacklisted, archived
}
```

### `PUT /api/recruitment/candidates/{id}` — Update

```json
{
  "firstname": "John",                              // optional | string
  "lastname": "Doe",                               // optional | string
  "email": "john.doe@example.com",                 // optional | email, unique
  "phone": "+201234567890",                        // optional | string
  "birth_date": "1990-01-01",                      // optional | date
  "gender": "male",                                // optional | enum: male, female
  "city": "Cairo",                                 // optional | string
  "country": "Egypt",                              // optional | string
  "linkedin": "https://linkedin.com/in/johndoe",   // optional | url
  "experience_years": 5,                           // optional | integer
  "current_salary": 7000,                          // optional | numeric
  "expected_salary": 9000,                         // optional | numeric
  "notice_period": "2 weeks",                      // optional | string
  "current_company": "Acme Corp",                  // optional | string
  "highest_education": "Bachelor",                 // optional | string
  "english_level": "Advanced",                     // optional | string
  "skills": ["PHP", "Laravel"],                    // optional | array
  "languages": ["Arabic", "English"],              // optional | array
  "cv_file": "(file upload)",                      // optional | file, mimes:pdf,doc,docx, max:5MB
  "source": "LinkedIn",                            // optional | string
  "notes": "Good candidate",                       // optional | string
  "status": "active"                               // optional | enum: active, blacklisted, archived
}
```

---

## 🔹 5. Applications

| Description                                                                             | Endpoint                                                | Auth   | Method     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------ | ---------- |
| List applications (filters:`status`, `stage_id`, `job_post_id`, `candidate_id`) | `/api/recruitment/applications`                       | Bearer | `GET`    |
| Create an application manually*(for internal use)*                                      | `/api/recruitment/applications`                       | Bearer | `POST`   |
| Show full application details*(with candidate, job post, interviews, offer, hire)*      | `/api/recruitment/applications/{id}`                  | Bearer | `GET`    |
| Update an application*(e.g. notes, status)*                                             | `/api/recruitment/applications/{id}`                  | Bearer | `PUT`    |
| Soft-delete an application                                                              | `/api/recruitment/applications/{id}`                  | Bearer | `DELETE` |
| Assign a recruiter to the application                                                   | `/api/recruitment/applications/{id}/assign-recruiter` | Bearer | `POST`   |
| Move application to a specific stage                                                    | `/api/recruitment/applications/{id}/move-stage`       | Bearer | `POST`   |
| Reject an application                                                                   | `/api/recruitment/applications/{id}/reject`           | Bearer | `POST`   |
| Withdraw an application*(by candidate/HR)*                                              | `/api/recruitment/applications/{id}/withdraw`         | Bearer | `POST`   |
| Mark application as hired*(moves to hiring stage)*                                      | `/api/recruitment/applications/{id}/hire`             | Bearer | `POST`   |
| Get activity log for an application                                                     | `/api/recruitment/applications/{id}/activity-log`     | Bearer | `GET`    |
| Get all interviews for an application                                                   | `/api/recruitment/applications/{id}/interviews`       | Bearer | `GET`    |
| Get the offer for an application*(if exists)*                                           | `/api/recruitment/applications/{id}/offer`            | Bearer | `GET`    |

### `POST /api/recruitment/applications` — Create

```json
{
  "job_post_id": 1,            // required | exists:recruitment_job_posts
  "candidate_id": 1,           // required | exists:recruitment_candidates
  "status": "active",          // optional | enum: active, rejected, withdrawn, hired
  "assigned_recruiter_id": 4,  // optional | exists:employees
  "notes": "New application"   // optional | string
}
```

### `PUT /api/recruitment/applications/{id}` — Update

```json
{
  "job_post_id": 1,            // optional | exists:recruitment_job_posts
  "candidate_id": 1,           // optional | exists:recruitment_candidates
  "status": "active",          // optional | enum: active, rejected, withdrawn, hired
  "assigned_recruiter_id": 4,  // optional | exists:employees
  "notes": "New application"   // optional | string
}
```

### `POST /api/recruitment/applications/{id}/assign-recruiter`

```json
{
  "recruiter_id": 5  // required | exists:employees
}
```

### `POST /api/recruitment/applications/{id}/move-stage`

```json
{
  "stage_id": 2,        // required | integer, exists:recruitment_interview_stages
  "skip_optional": false // optional | boolean
}
```

### `POST /api/recruitment/applications/{id}/reject`

```json
{
  "reason": "Not a good fit"  // optional | string
}
```

### `POST /api/recruitment/applications/{id}/withdraw`

```json
{
  "reason": "Found another job"  // optional | string
}
```

---

## 🔹 6. Interviews

| Description                                                                      | Endpoint                                           | Auth   | Method     |
| -------------------------------------------------------------------------------- | -------------------------------------------------- | ------ | ---------- |
| List interviews (filters:`application_id`, `interview_stage_id`, `result`) | `/api/recruitment/interviews`                    | Bearer | `GET`    |
| Schedule an interview                                                            | `/api/recruitment/interviews`                    | Bearer | `POST`   |
| Show an interview                                                                | `/api/recruitment/interviews/{id}`               | Bearer | `GET`    |
| Update interview details                                                         | `/api/recruitment/interviews/{id}`               | Bearer | `PUT`    |
| Soft-delete an interview                                                         | `/api/recruitment/interviews/{id}`               | Bearer | `DELETE` |
| Reschedule an interview*(updates time, link, location)*                          | `/api/recruitment/interviews/{id}/schedule`      | Bearer | `POST`   |
| Submit interview result*(passed/rejected/no-show)*                               | `/api/recruitment/interviews/{id}/submit-result` | Bearer | `POST`   |
| Cancel a pending interview                                                       | `/api/recruitment/interviews/{id}/cancel`        | Bearer | `POST`   |

### `POST /api/recruitment/interviews` — Schedule

```json
{
  "application_id": 1,                             // required | exists:recruitment_applications
  "interview_stage_id": 3,                         // required | exists:recruitment_interview_stages
  "scheduled_at": "2026-07-20 10:00:00",           // optional | date
  "interviewer_id": 4,                             // optional | exists:employees
  "meeting_link": "https://meet.google.com/abc",   // optional | url
  "location": "Virtual",                           // optional | string
  "notes": "First contact"                         // optional | string
}
```

### `PUT /api/recruitment/interviews/{id}` — Update

```json
{
  "application_id": 1,                             // optional | exists:recruitment_applications
  "interview_stage_id": 3,                         // optional | exists:recruitment_interview_stages
  "scheduled_at": "2026-07-20 10:00:00",           // optional | date
  "interviewer_id": 4,                             // optional | exists:employees
  "result": "pending",                             // optional | enum: pending, passed, rejected, no_show, cancelled
  "score": null,                                   // optional | integer, 0-100
  "meeting_link": "https://meet.google.com/abc",   // optional | url
  "location": "Virtual",                           // optional | string
  "notes": "First contact",                        // optional | string
  "feedback": "Good"                               // optional | string
}
```

### `POST /api/recruitment/interviews/{id}/schedule` — Reschedule

```json
{
  "scheduled_at": "2026-07-25 14:00:00",           // required | date
  "interviewer_id": 5,                             // optional | exists:employees
  "meeting_link": "https://meet.google.com/xyz",   // optional | url
  "location": "Cairo"                              // optional | string
}
```

### `POST /api/recruitment/interviews/{id}/submit-result`

```json
{
  "result": "passed",                  // required | enum: passed, rejected, no_show
  "score": 85,                         // optional | integer, 0-100
  "feedback": "Good fit",              // optional | string
  "notes": "Excellent communication"   // optional | string
}
```

---

## 🔹 7. Offers

| Description                                          | Endpoint                                | Auth   | Method     |
| ---------------------------------------------------- | --------------------------------------- | ------ | ---------- |
| List offers (filters:`status`, `application_id`) | `/api/recruitment/offers`             | Bearer | `GET`    |
| Create an offer                                      | `/api/recruitment/offers`             | Bearer | `POST`   |
| Show an offer                                        | `/api/recruitment/offers/{id}`        | Bearer | `GET`    |
| Update an offer                                      | `/api/recruitment/offers/{id}`        | Bearer | `PUT`    |
| Soft-delete an offer                                 | `/api/recruitment/offers/{id}`        | Bearer | `DELETE` |
| Mark offer as sent*(resends email if needed)*        | `/api/recruitment/offers/{id}/send`   | Bearer | `POST`   |
| Manually expire a pending offer                      | `/api/recruitment/offers/{id}/expire` | Bearer | `POST`   |

### `POST /api/recruitment/offers` — Create

```json
{
  "application_id": 1,               // required | exists:recruitment_applications
  "offer_number": "OFF-202607-0001", // optional | string, unique - auto-generated if omitted
  "salary": 8000,                    // optional | numeric, min:0
  "allowance": 500,                  // optional | numeric, min:0
  "bonus": 1000,                     // optional | numeric, min:0
  "currency": "EGP",                 // optional | string, max:3
  "start_date": "2026-09-01",        // optional | date
  "probation_months": 3,             // optional | integer, min:0
  "status": "pending"                // optional | enum: pending, accepted, rejected, expired
}
```

### `PUT /api/recruitment/offers/{id}` — Update

```json
{
  "salary": 8000,                    // optional | numeric, min:0
  "allowance": 500,                  // optional | numeric, min:0
  "bonus": 1000,                     // optional | numeric, min:0
  "currency": "EGP",                 // optional | string, max:3
  "start_date": "2026-09-01",        // optional | date
  "probation_months": 3,             // optional | integer, min:0
  "status": "pending"                // optional | enum: pending, accepted, rejected, expired
}
```

---

## 🔹 8. Hires

| Description                                                           | Endpoint                        | Auth   | Method     |
| --------------------------------------------------------------------- | ------------------------------- | ------ | ---------- |
| List hires (filters:`application_id`, `candidate_id`, `status`) | `/api/recruitment/hires`      | Bearer | `GET`    |
| Create a hire manually                                                | `/api/recruitment/hires`      | Bearer | `POST`   |
| Show a hire                                                           | `/api/recruitment/hires/{id}` | Bearer | `GET`    |
| Update a hire*(e.g. status)*                                          | `/api/recruitment/hires/{id}` | Bearer | `PUT`    |
| Soft-delete a hire                                                    | `/api/recruitment/hires/{id}` | Bearer | `DELETE` |

### `POST /api/recruitment/hires` — Create

```json
{
  "application_id": 1,  // required | exists:recruitment_applications
  "offer_id": 1         // optional | exists:recruitment_offers
}
```

### `PUT /api/recruitment/hires/{id}` — Update

```json
{
  "status": "onboarded",  // optional | enum: pending_onboarding, onboarded, cancelled
  "offer_id": 1           // optional | exists:recruitment_offers
}
```

---

## 🔹 9. Interview Stages (Configuration)

| Description        | Endpoint                                   | Auth   | Method     |
| ------------------ | ------------------------------------------ | ------ | ---------- |
| List active stages | `/api/recruitment/interview-stages`      | Bearer | `GET`    |
| Create a new stage | `/api/recruitment/interview-stages`      | Bearer | `POST`   |
| Show a stage       | `/api/recruitment/interview-stages/{id}` | Bearer | `GET`    |
| Update a stage     | `/api/recruitment/interview-stages/{id}` | Bearer | `PUT`    |
| Delete a stage     | `/api/recruitment/interview-stages/{id}` | Bearer | `DELETE` |

### `POST /api/recruitment/interview-stages` — Create

```json
{
  "name": "3rd Interview",       // required | string
  "code": "third_interview",     // required | string, unique
  "sort_order": 6,               // optional | integer, min:0
  "is_optional": false,          // optional | boolean
  "is_active": true,             // optional | boolean
  "requires_schedule": true,     // optional | boolean
  "requires_feedback": true,     // optional | boolean
  "allow_score": true            // optional | boolean
}
```

### `PUT /api/recruitment/interview-stages/{id}` — Update

```json
{
  "name": "3rd Interview",       // optional | string
  "code": "third_interview",     // optional | string, unique
  "sort_order": 6,               // optional | integer, min:0
  "is_optional": false,          // optional | boolean
  "is_active": true,             // optional | boolean
  "requires_schedule": true,     // optional | boolean
  "requires_feedback": true,     // optional | boolean
  "allow_score": true            // optional | boolean
}
```

---

> **Auth Legend:** `Bearer` = requires `Authorization: Bearer <token>` header | `- (none)` = public endpoint
