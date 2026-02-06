# Security Guidelines

This document outlines security best practices for the JobJourney application.

## Environment Variables

### ⚠️ Critical Security Rules

1. **Never commit `.env` or `.env.local` files** - These files are already in `.gitignore`
2. **Never hardcode secrets in source code** - All sensitive values must use environment variables
3. **Use `.env.example` files as templates** - These are safe to commit (no real secrets)
4. **Rotate secrets regularly** - Especially in production environments

## Backend Security

### Required Environment Variables

The following environment variables **must** be set (no hardcoded defaults):

- `SECRET_KEY` - Django secret key (required, no default)
- `SUPPORT_EMAIL` - Support email address (required, no default)
- `EMAIL_HOST_USER` - SMTP email user (required when using SMTP)
- `EMAIL_HOST_PASSWORD` - SMTP email password (required when using SMTP)
- `DEFAULT_FROM_EMAIL` - Default sender email (required when using SMTP)

### Optional Environment Variables (with safe defaults)

- `DEBUG` - Debug mode (defaults to `True` for development)
- `ALLOWED_HOSTS` - Allowed hostnames (defaults to `localhost,127.0.0.1`)
- `CORS_ALLOWED_ORIGINS` - CORS origins (defaults to localhost URLs)
- `EMAIL_BACKEND` - Email backend (defaults to SMTP)
- `EMAIL_HOST` - SMTP host (defaults to `smtp.gmail.com`)
- `EMAIL_PORT` - SMTP port (defaults to `587`)

### Security Features

- **Secret Key Validation**: Application will fail to start if `SECRET_KEY` is not set
- **Email Configuration Validation**: Application will fail to start if email credentials are missing when using SMTP
- **No Hardcoded Secrets**: All sensitive values are read from environment variables only

## Frontend Security

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
  - **Development**: Defaults to `http://127.0.0.1:8000` with a warning
  - **Production**: **Required** - Application will fail to start if not set

### Client-Side Security

- API URLs are only exposed client-side (required for Next.js)
- Authentication tokens are stored in `localStorage` (consider httpOnly cookies for production)
- No sensitive backend credentials are exposed to the frontend

## Production Deployment

### Before Deploying

1. **Generate a new SECRET_KEY**:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **Set DEBUG=False** in production environment

3. **Update ALLOWED_HOSTS** with your production domain

4. **Configure CORS_ALLOWED_ORIGINS** with your production frontend URL

5. **Use secure email credentials** (consider using environment variable management services)

6. **Set NEXT_PUBLIC_API_URL** to your production backend URL

### Environment Variable Management

For production, consider using:
- **AWS Secrets Manager**
- **Azure Key Vault**
- **HashiCorp Vault**
- **Kubernetes Secrets**
- **Docker Secrets**

## Code Review Checklist

When reviewing code, ensure:

- ✅ No hardcoded passwords, API keys, or secrets
- ✅ All sensitive values use `os.getenv()` or `process.env`
- ✅ No secrets in commit history (use `git-secrets` or similar tools)
- ✅ `.env` files are in `.gitignore`
- ✅ `.env.example` files exist and are up-to-date
- ✅ Error messages don't leak sensitive information
- ✅ Logs don't contain passwords or tokens

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **Do NOT** create a public issue
2. Contact the maintainers directly
3. Provide details about the vulnerability
4. Allow time for a fix before public disclosure

## Additional Resources

- [Django Security Best Practices](https://docs.djangoproject.com/en/stable/topics/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
