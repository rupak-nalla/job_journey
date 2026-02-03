# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Job Application Tracker team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### Where to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@example.com

### What to Include

Please include the following information in your report:

- Type of issue (e.g., SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

### Disclosure Policy

- Security issues are fixed in private
- Once fixed, we'll coordinate disclosure with you
- We prefer coordinated disclosure (30-90 days after fix)
- We'll credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices

### For Developers

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` for templates
   - Keep `SECRET_KEY` secure
   - Rotate keys regularly

2. **Dependencies**
   - Keep dependencies updated
   - Run `pip list --outdated` regularly
   - Use `npm audit` for frontend
   - Review security advisories

3. **Database**
   - Use Django ORM to prevent SQL injection
   - Never use raw SQL with user input
   - Sanitize all inputs

4. **File Uploads**
   - Validate file types
   - Limit file sizes
   - Scan uploaded files
   - Store outside web root

5. **Authentication**
   - Use Django's authentication system
   - Implement rate limiting
   - Use strong password policies
   - Enable CSRF protection

### For Production Deployments

1. **Django Settings**
   ```python
   DEBUG = False
   SECRET_KEY = os.environ.get('SECRET_KEY')
   ALLOWED_HOSTS = ['yourdomain.com']
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   ```

2. **CORS Configuration**
   - Only allow trusted origins
   - Don't use `*` in production
   - Update `CORS_ALLOWED_ORIGINS`

3. **HTTPS**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use HSTS headers

4. **Database**
   - Use PostgreSQL in production
   - Regular backups
   - Encrypted connections

5. **File Storage**
   - Use S3 or similar for production
   - Set proper permissions
   - Scan uploaded files

6. **Monitoring**
   - Set up error monitoring (Sentry, etc.)
   - Monitor failed login attempts
   - Track suspicious activity
   - Regular security audits

## Known Security Considerations

### Current Implementation

1. **SQLite in Production**
   - SQLite is used by default
   - For production, consider PostgreSQL
   - Better concurrency handling
   - More robust for multiple users

2. **File Uploads**
   - Resume files stored locally
   - Consider cloud storage for production
   - Implement virus scanning
   - Add file size limits

3. **Rate Limiting**
   - Not currently implemented
   - Recommended for production
   - Prevents brute force attacks
   - Use Django Ratelimit or similar

4. **Input Validation**
   - Frontend validation in place
   - Backend validation via DRF
   - Consider additional sanitization
   - Use Django validators

5. **Session Management**
   - Django default sessions
   - Consider Redis for production
   - Set appropriate timeouts
   - Implement logout on all devices

## Security Checklist

### Before Deployment

- [ ] Change `SECRET_KEY` from default
- [ ] Set `DEBUG = False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Update `CORS_ALLOWED_ORIGINS`
- [ ] Review file upload settings
- [ ] Enable CSRF protection
- [ ] Set up error monitoring
- [ ] Review database permissions
- [ ] Implement rate limiting
- [ ] Set up backups
- [ ] Review third-party packages
- [ ] Enable security headers
- [ ] Test authentication flows

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Audit user permissions
- [ ] Check logs for suspicious activity
- [ ] Test backup restoration
- [ ] Review access logs
- [ ] Rotate secrets/keys
- [ ] Update SSL certificates

## Vulnerability Disclosure Examples

### Severity Levels

**Critical**: Remote code execution, SQL injection, authentication bypass
**High**: XSS, CSRF, privilege escalation
**Medium**: Information disclosure, weak encryption
**Low**: Missing security headers, outdated dependencies

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [CWE Database](https://cwe.mitre.org/)

## Contact

For security concerns: security@example.com
For general issues: [GitHub Issues](https://github.com/yourusername/job-tracker/issues)

Thank you for helping keep Job Application Tracker secure!
