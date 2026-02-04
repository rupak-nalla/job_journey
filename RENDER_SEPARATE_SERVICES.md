# Render Deployment - Separate Services (Quick Reference)

## Backend Service Setup

**Service Type**: Docker Web Service  
**Dockerfile Path**: `backend/Dockerfile`  
**Root Directory**: (leave empty)

### Environment Variables:
```
SECRET_KEY=django-insecure-i2=@n$^!%!=+l1(03cylaygdefok16&s8&a-290kr9*uskcnw@
DEBUG=False
ALLOWED_HOSTS=<your-backend-url>.onrender.com
CORS_ALLOWED_ORIGINS=https://<your-frontend-url>.onrender.com
SUPPORT_EMAIL=rupaknalla1034@gmail.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=rupaknalla1034@gmail.com
EMAIL_HOST_PASSWORD=avaw lfvt rgiw wsoj
EMAIL_PORT=587
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=rupaknalla1034@gmail.com
```

## Frontend Service Setup

**Service Type**: Docker Web Service  
**Dockerfile Path**: `frontend/Dockerfile`  
**Root Directory**: (leave empty)

### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://<your-backend-url>.onrender.com
NODE_ENV=production
```

## Important Notes

1. **Replace URLs**: After deployment, Render will give you URLs like:
   - Backend: `https://job-tracker-backend-xxxx.onrender.com`
   - Frontend: `https://job-tracker-frontend-xxxx.onrender.com`
   
   Update the environment variables with these actual URLs.

2. **Backend First**: Deploy backend first, then use its URL in frontend's `NEXT_PUBLIC_API_URL`

3. **CORS**: Make sure `CORS_ALLOWED_ORIGINS` in backend matches your frontend URL exactly (including `https://`)

4. **No Quotes**: Don't use quotes around values in Render's environment variables

## Deployment Steps

1. Create backend service → Set environment variables → Deploy
2. Note the backend URL
3. Create frontend service → Set `NEXT_PUBLIC_API_URL` to backend URL → Deploy
4. Note the frontend URL
5. Update backend's `CORS_ALLOWED_ORIGINS` with frontend URL → Redeploy backend
6. Done! 🎉
