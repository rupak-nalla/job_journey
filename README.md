# Job Application Tracker

A modern, full-stack web application for tracking job applications, managing interviews, and organizing your job search process.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Django](https://img.shields.io/badge/django-5.0.7-green.svg)
![Next.js](https://img.shields.io/badge/next.js-15.3.0-black.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)

## 🚀 Features

### Application Management
- **Track Applications**: Add, view, edit, and delete job applications
- **Resume Upload**: Upload and store resumes for each application
- **Status Tracking**: Monitor application status (Applied, Ghosted, Interviewing, Assessment)
- **Detailed Information**: Store job descriptions, contact details, and notes

### Interview Scheduling
- **Automatic Scheduling**: When changing status to "Interviewing", automatically prompt for interview details
- **Interview Calendar**: View upcoming interviews with date, time, and type
- **Interview Types**: Support for Technical, HR, Behavioral, Final, Phone Screen, and System Design interviews
- **Visual Dashboard**: See all upcoming interviews at a glance

### Dashboard & Analytics
- **Statistics Overview**: Real-time stats on total applications, active interviews, and status breakdown
- **Recent Applications**: Quick access to your latest job applications
- **Upcoming Interviews**: Calendar view of scheduled interviews
- **Status Visualization**: Color-coded status indicators for easy tracking

### Modern UI/UX
- **Clean Design**: Professional, modern interface with smooth animations
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Inline Editing**: Quick status updates directly from the dashboard
- **Loading States**: Visual feedback for all async operations
- **Error Handling**: Graceful error messages and recovery

## 🛠️ Tech Stack

### Backend
- **Django 5.0.7**: Python web framework
- **Django REST Framework 3.15.2**: API development
- **SQLite**: Lightweight database (production-ready for small to medium apps)
- **Django CORS Headers**: Cross-origin resource sharing

### Frontend
- **Next.js 15.3.0**: React framework with server-side rendering
- **React 19.0.0**: Modern UI library
- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Icons**: Lightweight SVG icon system

## 📋 Prerequisites

- Python 3.12 or higher
- Node.js 18 or higher
- npm or yarn
- Git

## 🔧 Installation

### Option 1: Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set your SECRET_KEY

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local if needed

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Option 2: Docker Setup

#### 1. Using Docker Compose
```bash
# From project root
docker-compose up --build
```

This will start both backend and frontend services:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

#### 2. Using Individual Docker Containers

**Backend:**
```bash
cd backend
docker build -t job-tracker-backend .
docker run -p 8000:8000 job-tracker-backend
```

**Frontend:**
```bash
cd frontend
docker build -t job-tracker-frontend .
docker run -p 3000:3000 job-tracker-frontend
```

## 📁 Project Structure

```
job-tracker/
├── backend/                    # Django backend
│   ├── applications/          # Main app
│   │   ├── migrations/       # Database migrations
│   │   ├── models.py        # Data models
│   │   ├── serializers.py   # API serializers
│   │   ├── views.py         # API views
│   │   └── urls.py          # URL routing
│   ├── job_tracker/          # Project settings
│   │   ├── settings.py      # Django settings
│   │   └── urls.py          # Main URL config
│   ├── media/               # Uploaded files (resumes)
│   ├── db.sqlite3          # SQLite database
│   ├── manage.py           # Django management script
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend Docker config
│   └── .env.example        # Environment variables template
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   │   ├── page.js    # Dashboard (main page)
│   │   │   ├── add-application/  # Add application page
│   │   │   ├── application/      # Application detail pages
│   │   │   ├── globals.css       # Global styles
│   │   │   └── layout.js         # Root layout
│   │   ├── components/     # Reusable components
│   │   ├── config/        # Configuration files
│   │   │   └── api.js     # API endpoints
│   │   └── utils/         # Utility functions
│   ├── public/            # Static files
│   ├── package.json       # Node dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   ├── Dockerfile         # Frontend Docker config
│   └── .env.local.example # Frontend environment template
│
├── docker-compose.yml     # Docker Compose configuration
├── .gitignore            # Git ignore rules
├── LICENSE               # MIT License
└── README.md            # This file
```

## 🔑 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 🎯 Usage

### Adding a Job Application
1. Click "Add Application" button on the dashboard
2. Fill in the required fields:
   - Company name
   - Position
   - Status
   - Applied date
3. Optionally add:
   - Resume file
   - Job description
   - Contact information
   - Company website
   - Notes
4. If status is "Interviewing", provide interview details:
   - Interview date
   - Interview time
   - Interview type
5. Click "Submit Application"

### Viewing Applications
- **Dashboard**: See all applications in a table view
- **Recent Applications**: Quick view of latest applications
- **Click on any application**: View full details

### Editing Applications
1. Click on an application to view details
2. Click "Edit Application"
3. Modify any fields
4. If changing status to "Interviewing", interview fields will appear
5. Click "Save Changes"

### Scheduling Interviews
**From Dashboard:**
- Change application status dropdown to "Interviewing"
- Modal appears with interview details form
- Fill in date, time, and type
- Click "Schedule Interview"

**From Application Detail:**
- Edit application
- Change status to "Interviewing"
- Interview fields appear automatically
- Fill in details and save

### Deleting Applications
- From dashboard: Click trash icon and confirm
- From detail page: Click "Delete" button and confirm

## 🚢 Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-app-name-backend

# Add PostgreSQL (optional, for production)
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run lint
npm run format:check
```

## 📚 API Documentation

### Endpoints

#### Applications
- `GET /api/recent-applications/` - Get all applications
- `POST /api/add-job-application/` - Create new application
- `GET /api/applications/:id/` - Get application by ID
- `PUT /api/applications/:id/update/` - Update application
- `PATCH /api/applications/:id/update/` - Partial update application
- `DELETE /api/applications/:id/delete/` - Delete application

#### Statistics
- `GET /api/job-stats/` - Get application statistics

#### Interviews
- `GET /api/upcoming-interviews/` - Get upcoming interviews (next 5)

### Request/Response Examples

**Create Application:**
```json
POST /api/add-job-application/
Content-Type: multipart/form-data

{
  "company": "Tech Corp",
  "position": "Software Engineer",
  "status": "Applied",
  "applied_date": "2026-02-03",
  "resume": <file>,
  "job_description": "...",
  "contact_email": "recruiter@techcorp.com"
}
```

**Update Status to Interviewing:**
```json
PATCH /api/applications/1/update/

{
  "status": "Interviewing",
  "interview_date": "2026-02-10",
  "interview_time": "14:00",
  "interview_type": "Technical"
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- **Backend**: Follow PEP 8 style guide
- **Frontend**: Use Prettier for formatting
- **Commits**: Use conventional commit messages

## 🐛 Known Issues

- None currently reported

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Django and DRF communities
- Next.js team
- Tailwind CSS team
- All contributors

## 📞 Support

For support, email support@example.com or open an issue in the GitHub repository.

## 🔄 Changelog

### Version 1.0.0 (2026-02-03)
- Initial release
- Application management (CRUD operations)
- Interview scheduling
- Dashboard with statistics
- Resume upload functionality
- Modern UI with Tailwind CSS
- Full REST API
- Docker support

## 🗺️ Roadmap

- [ ] Email notifications for upcoming interviews
- [ ] Calendar export (iCal, Google Calendar)
- [ ] Advanced filtering and search
- [ ] Data export (CSV, PDF)
- [ ] Interview feedback tracking
- [ ] Salary tracking
- [ ] Company research notes
- [ ] Application templates
- [ ] Browser extension for quick adds
- [ ] Mobile app (React Native)

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
