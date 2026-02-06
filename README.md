# Job Application Tracker

A modern full-stack web application for tracking job applications, managing interviews, and organizing your job search process.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-blue.svg)
![Django](https://img.shields.io/badge/django-5.0.7-green.svg)
![Next.js](https://img.shields.io/badge/next.js-15.3.0-black.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)

## Overview

JobJourney is a comprehensive solution for managing your job search journey. Track applications, schedule interviews, upload resumes, and monitor your progress with an intuitive dashboard.

### Key Features

- **Application Management**: Track applications with status updates (Applied, Interviewing, Assessment, Offered, Ghosted)
- **Interview Scheduling**: Automatically schedule and manage interviews with date, time, and type tracking
- **Resume Management**: Upload and store resumes for each application
- **Dashboard Analytics**: Real-time statistics and visual overview of your job search progress
- **Support System**: Built-in contact form for reporting issues
- **Authentication**: Secure JWT-based authentication system
- **Modern UI**: Responsive design with consistent branding across all pages

## Tech Stack

**Backend**
- Django 5.0.7 + Django REST Framework
- SQLite (production-ready for small to medium apps)
- JWT Authentication
- CORS support

**Frontend**
- Next.js 15.3.0 + React 19.0.0
- Custom styling with gradient design
- Client-side routing and state management

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job_tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration (see ENV_SETUP.md)
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://127.0.0.1:8000

## Project Structure

```
job_tracker/
├── backend/              # Django REST API
│   ├── applications/     # Main app (models, views, serializers)
│   ├── job_tracker/      # Project settings
│   └── manage.py
├── frontend/             # Next.js application
│   ├── src/
│   │   ├── app/         # Pages (dashboard, login, register, etc.)
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts (Auth)
│   │   └── config/      # API configuration
│   └── package.json
└── tests/                # Test suites for both backend and frontend
```

## Environment Variables

Environment variables are required for both backend and frontend. See [ENV_SETUP.md](ENV_SETUP.md) for detailed configuration.

**Backend** (`backend/.env`):
- `SECRET_KEY` (required)
- `DEBUG`
- `SUPPORT_EMAIL` (required)
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (required for SMTP)
- `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`

**Frontend** (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL` (required in production)

## Testing

**Backend Tests**
```bash
cd backend
python manage.py test ../tests/backend
```

**Frontend Tests**
```bash
cd frontend
npm run test:ci
```

## Documentation

- [Environment Setup](ENV_SETUP.md) - Detailed environment variable configuration
- [Security Guidelines](SECURITY.md) - Security best practices and deployment checklist
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

## Development

### Running Tests
- Backend: `python manage.py test ../tests/backend`
- Frontend: `npm run test:ci` (from frontend directory)

### Code Quality
- Automated code reviews via CodeRabbit on pull requests
- Backend follows PEP 8
- Frontend uses Prettier for formatting

## Deployment

The application is configured for deployment on various platforms:
- **Backend**: Deploy to Heroku, Railway, AWS, or any Python hosting service
- **Frontend**: Deploy to Vercel, Netlify, or any Node.js hosting service

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass
5. Submit a pull request

All PRs are automatically reviewed by CodeRabbit for code quality and security.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
