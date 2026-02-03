# User Authentication Feature

## Overview

User authentication has been successfully implemented for the Job Tracker application. Users can now register, login, and their job applications are securely linked to their accounts.

## Branch

**Branch**: `feature/user-authentication`

## Backend Implementation

### Dependencies Added
- `djangorestframework-simplejwt==5.3.1` - JWT token authentication

### Changes Made

1. **Settings (`backend/job_tracker/settings.py`)**
   - Added `rest_framework_simplejwt` to `INSTALLED_APPS`
   - Configured REST Framework with JWT authentication
   - Set default permission to `IsAuthenticated`
   - Configured JWT token settings (1 hour access, 7 days refresh)

2. **Models (`backend/applications/models.py`)**
   - Added `user` ForeignKey to `JobApplication` model
   - Links each application to a Django User

3. **Authentication Views (`backend/applications/auth_views.py`)**
   - `register()` - User registration with validation
   - `login()` - User login with JWT token generation
   - `logout()` - Token blacklisting
   - `get_user()` - Get current user info
   - `refresh_token()` - Refresh access token

4. **URLs (`backend/applications/urls.py`)**
   - `/api/auth/register/` - POST - Register new user
   - `/api/auth/login/` - POST - Login user
   - `/api/auth/logout/` - POST - Logout user
   - `/api/auth/user/` - GET - Get current user
   - `/api/auth/refresh/` - POST - Refresh token

5. **Views Updated (`backend/applications/views.py`)**
   - All views now filter by `user=request.user`
   - `add_job_application` - Links application to authenticated user
   - `job_stats` - Shows stats for logged-in user only
   - `recent_applications` - Shows user's applications only
   - `upcoming_interviews` - Shows user's interviews only
   - `get_job_application` - Users can only access their own applications
   - `update_job_application` - Users can only update their own applications
   - `delete_job_application` - Users can only delete their own applications

6. **Migration**
   - Created migration `0007_add_user_to_job_application.py`
   - User field is nullable to handle existing data

## Frontend Implementation

### New Files Created

1. **Auth Context (`frontend/src/contexts/AuthContext.js`)**
   - Manages authentication state
   - Provides `login`, `register`, `logout` functions
   - Auto-refreshes tokens
   - Checks authentication on mount

2. **Login Page (`frontend/src/app/login/page.js`)**
   - Beautiful login form
   - Username and password fields
   - Error handling
   - Link to register page

3. **Register Page (`frontend/src/app/register/page.js`)**
   - Registration form with:
     - First name, Last name
     - Username (required)
     - Email (required)
     - Password (required, min 8 chars)
     - Confirm password
   - Validation
   - Error handling
   - Link to login page

### Files Updated

1. **API Config (`frontend/src/config/api.js`)**
   - Added authentication endpoints
   - Added `getAuthHeaders()` helper function

2. **Layout (`frontend/src/app/layout.js`)**
   - Wrapped app with `AuthProvider`
   - Enables authentication context globally

3. **Dashboard (`frontend/src/app/page.js`)**
   - Added authentication check
   - Redirects to login if not authenticated
   - Shows loading state during auth check
   - All API calls include auth headers
   - Added logout button in topbar
   - Shows user name in topbar

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login user | No |
| POST | `/api/auth/logout/` | Logout user | Yes |
| GET | `/api/auth/user/` | Get current user | Yes |
| POST | `/api/auth/refresh/` | Refresh access token | No |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register/
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Login:**
```json
POST /api/auth/login/
{
  "username": "johndoe",
  "password": "securepass123"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "tokens": { ... }
}
```

## Security Features

1. **JWT Tokens**
   - Access token: 1 hour lifetime
   - Refresh token: 7 days lifetime
   - Automatic token rotation

2. **Password Validation**
   - Minimum 8 characters
   - Django's built-in validators

3. **User Isolation**
   - Users can only see/modify their own applications
   - All queries filtered by `user=request.user`

4. **Token Storage**
   - Tokens stored in `localStorage`
   - Automatic refresh on expiration

## Usage

### For Users

1. **Register**: Go to `/register` and create an account
2. **Login**: Go to `/login` and sign in
3. **Dashboard**: Automatically redirected after login
4. **Logout**: Click logout button in topbar

### For Developers

**Backend:**
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Manual Testing Steps

1. **Registration**
   - Navigate to `/register`
   - Fill in form
   - Submit and verify redirect to dashboard

2. **Login**
   - Navigate to `/login`
   - Enter credentials
   - Verify token storage in localStorage

3. **Protected Routes**
   - Try accessing `/` without login
   - Should redirect to `/login`

4. **User Isolation**
   - Create two accounts
   - Add applications to each
   - Verify each user only sees their own applications

## Migration Notes

### Existing Data

The `user` field in `JobApplication` is currently nullable to handle existing data. To make it required:

1. Create a default user or assign existing applications to a user
2. Create a migration to make the field non-nullable

Example migration:
```python
# In a data migration
from django.contrib.auth.models import User

default_user = User.objects.get_or_create(username='default')[0]
JobApplication.objects.filter(user__isnull=True).update(user=default_user)
```

## Next Steps

- [ ] Make user field required (after data migration)
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add profile page
- [ ] Add remember me option
- [ ] Add social authentication (optional)

## Files Changed

### Backend
- `backend/requirements.txt`
- `backend/job_tracker/settings.py`
- `backend/applications/models.py`
- `backend/applications/auth_views.py` (new)
- `backend/applications/urls.py`
- `backend/applications/views.py`
- `backend/applications/migrations/0007_add_user_to_job_application.py` (new)

### Frontend
- `frontend/src/config/api.js`
- `frontend/src/contexts/AuthContext.js` (new)
- `frontend/src/app/layout.js`
- `frontend/src/app/login/page.js` (new)
- `frontend/src/app/register/page.js` (new)
- `frontend/src/app/page.js`

---

**Status**: ✅ Complete  
**Branch**: `feature/user-authentication`  
**Date**: February 3, 2026
