# Render Deployment Guide

This guide explains how to deploy the JobJourney application to Render.

## Deployment Options

Render supports two deployment approaches:
1. **Separate Services** (Recommended): Deploy backend and frontend as separate services
2. **Single Docker Service**: Deploy using the Dockerfile (single container)

## Option 1: Separate Services (Recommended)

### Backend Service (Django)

1. **Create a new Web Service** in Render
   - **Name**: `job-tracker-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT job_tracker.wsgi:application`
   - **Root Directory**: `backend`

2. **Set Environment Variables**:
   ```
   SECRET_KEY=<your-secret-key>
   DEBUG=False
   ALLOWED_HOSTS=job-tracker-backend.onrender.com
   CORS_ALLOWED_ORIGINS=https://job-journey-qcmc.onrender.com
   SUPPORT_EMAIL=your-email@gmail.com
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=<your-gmail-app-password>
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

3. **Add PostgreSQL Database** (if needed):
   - Create a PostgreSQL database in Render
   - Add `DATABASE_URL` environment variable (Render auto-provides this)

### Frontend Service (Next.js)

1. **Create a new Web Service** in Render
   - **Name**: `job-tracker-frontend`
   - **Environment**: `Node`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
   - **Root Directory**: `frontend`

2. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://job-tracker-backend.onrender.com
   NODE_ENV=production
   ```

   **Important**: Replace `job-tracker-backend.onrender.com` with your actual backend service URL.

## Option 2: Single Docker Service

1. **Create a new Web Service** in Render
   - **Name**: `job-tracker`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (root directory)

2. **Set Environment Variables** (same as backend + frontend combined):
   ```
   SECRET_KEY=<your-secret-key>
   DEBUG=False
   ALLOWED_HOSTS=job-tracker.onrender.com
   CORS_ALLOWED_ORIGINS=https://job-journey-qcmc.onrender.com
   SUPPORT_EMAIL=your-email@gmail.com
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=<your-gmail-app-password>
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   NEXT_PUBLIC_API_URL=https://job-journey-qcmc.onrender.com
   ```

## Build Fix for Render

The build should work now, but if you still see errors about `NEXT_PUBLIC_API_URL`:

1. **Make sure the environment variable is set** in Render's dashboard before building
2. **The build will use a default** if not set, but you must set it for production

## Post-Deployment Steps

1. **Run Migrations** (for backend):
   - In Render dashboard, open the backend service shell
   - Run: `python manage.py migrate`

2. **Create Superuser** (optional):
   - Run: `python manage.py createsuperuser`

3. **Verify Services**:
   - Backend should be accessible at: `https://job-tracker-backend.onrender.com`
   - Frontend should be accessible at: `https://job-journey-qcmc.onrender.com`
   - Test API endpoints: `https://job-tracker-backend.onrender.com/api/auth/register/`

## Troubleshooting

### Build Fails with "NEXT_PUBLIC_API_URL not set"
- **Solution**: Set `NEXT_PUBLIC_API_URL` in Render's environment variables before building
- The build will use a default, but the variable should be set for production

### CORS Errors
- **Solution**: Make sure `CORS_ALLOWED_ORIGINS` in backend includes your frontend URL
- Format: `https://job-journey-qcmc.onrender.com` (no trailing slash)

### Database Connection Issues
- **Solution**: Ensure PostgreSQL database is created and `DATABASE_URL` is set
- Update `settings.py` to use `dj-database-url` if needed

### Email Not Sending
- **Solution**: Verify Gmail app password is correct
- Check that `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are set correctly

## Notes

- Render provides free SSL certificates automatically
- Services may spin down after inactivity (free tier)
- Consider using Render's PostgreSQL for production database
- Monitor logs in Render dashboard for debugging
