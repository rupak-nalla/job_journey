# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-03

### Added
- Initial release of Job Application Tracker
- Full CRUD operations for job applications
- Interview scheduling with automatic prompting
- Dashboard with statistics and analytics
- Resume upload and storage functionality
- Application status tracking (Applied, Ghosted, Interviewing, Assessment)
- Interview types support (Technical, HR, Behavioral, Final, Phone Screen, System Design)
- Upcoming interviews calendar view
- Recent applications quick view
- Inline status editing from dashboard
- Application detail view with full information display
- Contact information management (email, phone, website)
- Job description and notes fields
- Modern, responsive UI with Tailwind CSS
- Django REST API backend
- Next.js frontend with React 19
- SQLite database support
- Docker and Docker Compose configuration
- Resume file upload with validation
- Error handling and loading states
- CORS configuration for local development
- Professional README and documentation
- MIT License
- Contributing guidelines

### Backend Features
- Django 5.0.7 with Django REST Framework
- JobApplication model with comprehensive fields
- Interview model with foreign key relationship
- API endpoints for all CRUD operations
- File upload handling for resumes
- Automatic interview creation when status changes
- Statistics endpoint for dashboard
- Upcoming interviews endpoint with filtering
- Proper serialization with interview data

### Frontend Features
- Next.js 15.3.0 with React 19
- Server-side rendering support
- Three main pages: Dashboard, Add Application, Application Detail
- Interview scheduling modal
- Inline status editing
- File upload with drag-and-drop
- Dynamic form fields based on status
- Responsive design for all screen sizes
- Custom SVG icon system
- Loading and error states
- Client-side routing with next/navigation
- Environment-based API configuration

### Developer Experience
- Docker support with multi-stage builds
- Docker Compose for easy development setup
- Clean requirements.txt with minimal dependencies
- Environment variable templates
- Comprehensive .gitignore
- Code formatting with Prettier
- ESLint configuration
- Professional project structure
- Detailed documentation

### Security
- CORS configuration
- Environment variable support
- Secure file upload handling
- Input validation on frontend and backend
- SQL injection protection (Django ORM)
- XSS protection (React)

## [Unreleased]

### Planned
- Email notifications for upcoming interviews
- Calendar export (iCal, Google Calendar)
- Advanced filtering and search
- Data export (CSV, PDF)
- Interview feedback tracking
- Salary tracking
- Application templates
- Browser extension
- Mobile app

---

## Version History

### Version Number Format
- Major.Minor.Patch (e.g., 1.0.0)
- Major: Breaking changes
- Minor: New features, backwards compatible
- Patch: Bug fixes, backwards compatible

### Release Notes
Each release includes:
- Date of release
- Added features
- Changed features
- Deprecated features
- Removed features
- Fixed bugs
- Security updates

---

[1.0.0]: https://github.com/yourusername/job-tracker/releases/tag/v1.0.0
