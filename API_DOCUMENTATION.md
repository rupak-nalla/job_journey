# API Documentation

## Base URL

Development: `http://127.0.0.1:8000`
Production: `https://your-domain.com`

## Authentication

Currently, the API does not require authentication. This is suitable for personal use or trusted networks.

For production deployment, consider adding:
- Django REST Framework Token Authentication
- JWT Authentication
- OAuth2

## Endpoints

### Job Applications

#### List All Applications

```http
GET /api/recent-applications/
```

**Response:**
```json
[
  {
    "id": 1,
    "company": "Tech Corp",
    "position": "Software Engineer",
    "applied_date": "2026-02-01",
    "status": "Interviewing",
    "resume": "/media/resumes/resume.pdf",
    "job_description": "Full job description...",
    "contact_email": "recruiter@techcorp.com",
    "contact_phone": "+1234567890",
    "company_website": "https://techcorp.com",
    "notes": "Follow up next week",
    "interview_date": "2026-02-10",
    "interview_time": "14:00:00",
    "interview_type": "Technical"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

#### Get Single Application

```http
GET /api/applications/:id/
```

**Parameters:**
- `id` (integer): Application ID

**Response:**
```json
{
  "id": 1,
  "company": "Tech Corp",
  "position": "Software Engineer",
  "applied_date": "2026-02-01",
  "status": "Interviewing",
  "resume": "/media/resumes/resume.pdf",
  "job_description": "Full job description...",
  "contact_email": "recruiter@techcorp.com",
  "contact_phone": "+1234567890",
  "company_website": "https://techcorp.com",
  "notes": "Follow up next week",
  "interview_date": "2026-02-10",
  "interview_time": "14:00:00",
  "interview_type": "Technical"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Application doesn't exist

---

#### Create Application

```http
POST /api/add-job-application/
```

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
{
  company: "Tech Corp",                     // Required
  position: "Software Engineer",            // Required
  status: "Applied",                        // Required
  applied_date: "2026-02-01",              // Required
  resume: <File>,                          // Optional
  job_description: "Full description...",   // Optional
  contact_email: "recruiter@techcorp.com", // Optional
  contact_phone: "+1234567890",            // Optional
  company_website: "https://techcorp.com", // Optional
  notes: "Notes...",                       // Optional
  
  // If status is "Interviewing":
  interview_date: "2026-02-10",            // Required for Interviewing
  interview_time: "14:00",                 // Required for Interviewing
  interview_type: "Technical"              // Required for Interviewing
}
```

**Response:**
```json
{
  "message": "Application and resume uploaded successfully."
}
```

**Status Codes:**
- `201 Created`: Success
- `400 Bad Request`: Validation error

---

#### Update Application (Full)

```http
PUT /api/applications/:id/update/
```

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "company": "Tech Corp Updated",
  "position": "Senior Software Engineer",
  "status": "Interviewing",
  "applied_date": "2026-02-01",
  "job_description": "Updated description...",
  "contact_email": "newrecruiter@techcorp.com",
  "contact_phone": "+1234567890",
  "company_website": "https://techcorp.com",
  "notes": "Updated notes",
  "interview_date": "2026-02-15",
  "interview_time": "10:00",
  "interview_type": "HR"
}
```

**Response:**
```json
{
  "id": 1,
  "company": "Tech Corp Updated",
  // ... full application object
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Validation error
- `404 Not Found`: Application doesn't exist

---

#### Update Application (Partial)

```http
PATCH /api/applications/:id/update/
```

**Content-Type:** `application/json`

**Request Body (any fields):**
```json
{
  "status": "Interviewing",
  "interview_date": "2026-02-15",
  "interview_time": "10:00",
  "interview_type": "Technical"
}
```

**Response:**
```json
{
  "id": 1,
  "company": "Tech Corp",
  // ... full application object with updates
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Validation error
- `404 Not Found`: Application doesn't exist

---

#### Delete Application

```http
DELETE /api/applications/:id/delete/
```

**Response:**
```json
{
  "message": "Job application deleted successfully"
}
```

**Status Codes:**
- `204 No Content`: Success
- `404 Not Found`: Application doesn't exist

---

### Statistics

#### Get Job Statistics

```http
GET /api/job-stats/
```

**Response:**
```json
{
  "total": 10,
  "applied": 5,
  "ghosted": 2,
  "interviewing": 2,
  "assessment": 1
}
```

**Status Codes:**
- `200 OK`: Success

---

### Interviews

#### Get Upcoming Interviews

```http
GET /api/upcoming-interviews/
```

Returns the next 5 upcoming interviews.

**Response:**
```json
[
  {
    "id": 1,
    "company": "Tech Corp",
    "position": "Software Engineer",
    "date": "2026-02-10",
    "time": "14:00:00",
    "type": "Technical"
  },
  {
    "id": 2,
    "company": "StartupXYZ",
    "position": "Full Stack Developer",
    "date": "2026-02-12",
    "time": "10:00:00",
    "type": "HR"
  }
]
```

**Status Codes:**
- `200 OK`: Success

---

## Data Models

### JobApplication

```python
{
  id: integer,                    # Auto-generated
  company: string (max 100),      # Required
  position: string (max 100),     # Required
  applied_date: date,             # Required (default: today)
  status: enum,                   # Required (default: "Applied")
                                  # Options: Applied, Ghosted, Interviewing, Assessment
  resume: file,                   # Optional (PDF, DOC, DOCX, max 5MB)
  job_description: text,          # Optional
  contact_email: email,           # Optional
  contact_phone: string (max 20), # Optional
  company_website: url,           # Optional
  notes: text,                    # Optional
  interview_date: date,           # Read-only (from Interview)
  interview_time: time,           # Read-only (from Interview)
  interview_type: string          # Read-only (from Interview)
}
```

### Interview

```python
{
  id: integer,                    # Auto-generated
  job_application: foreign_key,  # Reference to JobApplication
  date: date,                     # Required
  time: time,                     # Required
  type: enum                      # Required
                                  # Options: Technical, HR, Behavioral, 
                                  # Final, Phone Screen, System Design
}
```

---

## Status Values

| Status | Description |
|--------|-------------|
| `Applied` | Application submitted |
| `Ghosted` | No response received |
| `Interviewing` | Interview scheduled or in progress |
| `Assessment` | Technical assessment or assignment |

---

## Interview Types

| Type | Description |
|------|-------------|
| `Technical` | Technical coding interview |
| `HR` | Human resources interview |
| `Behavioral` | Behavioral questions |
| `Final` | Final round/decision interview |
| `Phone Screen` | Initial phone screening |
| `System Design` | System design interview |

---

## Error Responses

### 400 Bad Request

```json
{
  "field_name": ["Error message"]
}
```

Example:
```json
{
  "company": ["This field is required."],
  "applied_date": ["Date has wrong format. Use YYYY-MM-DD."]
}
```

### 404 Not Found

```json
{
  "error": "Job application not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error message"
}
```

---

## File Upload

### Resume Upload

**Supported Formats:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)

**Maximum Size:** 5 MB

**Upload Process:**
1. Use `multipart/form-data` content type
2. Include resume in `resume` field
3. File is stored in `media/resumes/`
4. URL returned in response: `/media/resumes/filename.pdf`

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('company', 'Tech Corp');
formData.append('position', 'Software Engineer');
formData.append('status', 'Applied');
formData.append('applied_date', '2026-02-01');
formData.append('resume', fileInput.files[0]);

const response = await fetch('/api/add-job-application/', {
  method: 'POST',
  body: formData
});
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider:
- Django Ratelimit
- Django REST Framework throttling
- Nginx rate limiting

**Recommended Limits:**
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour

---

## CORS

**Allowed Origins (Development):**
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://192.168.1.5:3000`

**Allowed Methods:**
- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

**Credentials:** Allowed

---

## Pagination

Currently, all endpoints return all results. For large datasets, consider implementing pagination:

```http
GET /api/recent-applications/?page=1&page_size=10
```

---

## Filtering & Search

Future implementation:

```http
GET /api/recent-applications/?status=Interviewing
GET /api/recent-applications/?company=Tech Corp
GET /api/recent-applications/?date_from=2026-01-01&date_to=2026-02-01
```

---

## Versioning

Current version: v1 (implicit)

Future versions will use URL versioning:
- `/api/v1/recent-applications/`
- `/api/v2/recent-applications/`

---

## SDKs & Client Libraries

### JavaScript/TypeScript

```javascript
// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// Fetch all applications
async function getApplications() {
  const response = await fetch(`${API_BASE_URL}/api/recent-applications/`);
  return await response.json();
}

// Create application
async function createApplication(data) {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  const response = await fetch(`${API_BASE_URL}/api/add-job-application/`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

### Python

```python
import requests

API_BASE_URL = 'http://127.0.0.1:8000'

# Fetch all applications
def get_applications():
    response = requests.get(f'{API_BASE_URL}/api/recent-applications/')
    return response.json()

# Create application
def create_application(data, resume_file=None):
    files = {'resume': resume_file} if resume_file else {}
    response = requests.post(
        f'{API_BASE_URL}/api/add-job-application/',
        data=data,
        files=files
    )
    return response.json()
```

---

## Testing

### Using cURL

**Get all applications:**
```bash
curl http://127.0.0.1:8000/api/recent-applications/
```

**Create application:**
```bash
curl -X POST http://127.0.0.1:8000/api/add-job-application/ \
  -F "company=Tech Corp" \
  -F "position=Software Engineer" \
  -F "status=Applied" \
  -F "applied_date=2026-02-01" \
  -F "resume=@/path/to/resume.pdf"
```

**Update status:**
```bash
curl -X PATCH http://127.0.0.1:8000/api/applications/1/update/ \
  -H "Content-Type: application/json" \
  -d '{"status":"Interviewing","interview_date":"2026-02-10","interview_time":"14:00","interview_type":"Technical"}'
```

### Using Postman

1. Import the API endpoints
2. Set base URL: `http://127.0.0.1:8000`
3. For file uploads, use form-data body type
4. For JSON updates, use raw JSON body type

---

## Changelog

### v1.0.0 (2026-02-03)
- Initial API release
- CRUD operations for job applications
- Interview scheduling
- Statistics endpoint
- Upcoming interviews endpoint

---

For support or questions, open an issue on GitHub.
