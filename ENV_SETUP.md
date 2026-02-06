# Environment Variables Setup Guide

This guide explains how to set up environment variables for the JobJourney application.

## Files Created

The following environment files have been created:

### Backend (Django)
- `backend/.env` - Actual environment variables (gitignored, contains your secrets)
- `backend/.env.example` - Template file (safe to commit, no secrets)

### Frontend (Next.js)
- `frontend/.env.local` - Actual environment variables (gitignored, contains your secrets)
- `frontend/.env.example` - Template file (safe to commit, no secrets)

## Backend Environment Variables

The backend `.env` file contains the following variables:

### Required Variables

- **SECRET_KEY**: Django secret key for cryptographic signing
  - Generate a new one for production using:
    ```bash
    python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    ```

- **DEBUG**: Set to `True` for development, `False` for production
  - Default: `True`

- **ALLOWED_HOSTS**: Comma-separated list of allowed hostnames
  - Default: `localhost,127.0.0.1,192.168.1.5`

### Email Configuration

- **SUPPORT_EMAIL**: Email address that receives support requests
  - Default: `rupaknalla1034@gmail.com`

- **EMAIL_BACKEND**: Email backend to use
  - For development: `django.core.mail.backends.console.EmailBackend` (prints to console)
  - For production: `django.core.mail.backends.smtp.EmailBackend`

- **EMAIL_HOST**: SMTP server hostname
  - Default: `smtp.gmail.com`

- **EMAIL_PORT**: SMTP server port
  - Default: `587`

- **EMAIL_USE_TLS**: Enable TLS encryption
  - Default: `True`

- **EMAIL_HOST_USER**: Your Gmail address
  - Default: `rupaknalla1034@gmail.com`

- **EMAIL_HOST_PASSWORD**: Your Gmail app password
  - **⚠️ SECURITY WARNING**: Keep this secret!
  - Generate a new app password from: https://myaccount.google.com/apppasswords
  - Default: `avaw lfvt rgiw wsoj`

- **DEFAULT_FROM_EMAIL**: Default sender email address
  - Default: Same as `EMAIL_HOST_USER`

### CORS Configuration

- **CORS_ALLOWED_ORIGINS**: Comma-separated list of allowed origins (only used when `DEBUG=False`)
  - Default: `http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.5:3000`

## Frontend Environment Variables

The frontend `.env.local` file contains:

- **NEXT_PUBLIC_API_URL**: Backend API URL
  - Default: `http://127.0.0.1:8000`
  - **Note**: Next.js requires the `NEXT_PUBLIC_` prefix for client-side variables

## Setup Instructions

### For New Developers

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and update the values as needed
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local and update the values as needed
   ```

### For Production

1. **Generate a new SECRET_KEY**:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **Update backend/.env**:
   - Set `DEBUG=False`
   - Set a strong `SECRET_KEY`
   - Update `ALLOWED_HOSTS` with your production domain
   - Update `CORS_ALLOWED_ORIGINS` with your production frontend URL
   - Update email settings with production SMTP credentials

3. **Update frontend/.env.local**:
   - Set `NEXT_PUBLIC_API_URL` to your production backend URL

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` or `.env.local` files to version control
- These files are already in `.gitignore`
- Use `.env.example` files as templates (these are safe to commit)
- Rotate secrets regularly in production
- Use strong, unique passwords for email accounts
- Consider using environment variable management services in production (e.g., AWS Secrets Manager, Azure Key Vault)

## Troubleshooting

### Backend can't read environment variables
- Make sure `python-dotenv` is installed: `pip install python-dotenv`
- Verify the `.env` file is in the `backend/` directory
- Check that `load_dotenv()` is called in `settings.py` (it already is)

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly in `frontend/.env.local`
- Make sure the backend server is running
- Check CORS settings if you're getting CORS errors

### Email not sending
- Verify Gmail app password is correct
- Check that 2-factor authentication is enabled on your Gmail account
- For development, consider using console backend to see email output
