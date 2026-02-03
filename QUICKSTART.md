# Quick Start Guide

Get the Job Application Tracker running in 5 minutes!

## 🚀 Fastest Method: Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-tracker.git
   cd job-tracker
   ```

2. **Start everything**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

That's it! 🎉

---

## 💻 Manual Setup (Development)

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Backend Setup (5 steps)

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Activate it:
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup database**
   ```bash
   python manage.py migrate
   ```

5. **Start server**
   ```bash
   python manage.py runserver
   ```

✅ Backend is now running at http://127.0.0.1:8000

### Frontend Setup (3 steps)

1. **Navigate to frontend** (in new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

✅ Frontend is now running at http://localhost:3000

---

## 🎯 First Steps

### 1. Add Your First Application

1. Click **"Add Application"** button
2. Fill in:
   - Company name (e.g., "Google")
   - Position (e.g., "Software Engineer")
   - Status (select "Applied")
   - Date (today's date)
3. Optional: Upload your resume
4. Click **"Submit Application"**

### 2. Schedule an Interview

1. From dashboard, click status dropdown
2. Select **"Interviewing"**
3. Modal appears - fill in:
   - Interview date
   - Time
   - Type (Technical, HR, etc.)
4. Click **"Schedule Interview"**

### 3. View Application Details

1. Click on any application in the table
2. View all details
3. Click **"Edit Application"** to modify
4. Click **"Delete"** to remove

---

## 📊 Dashboard Overview

The dashboard shows:

- **Total Applications**: All applications you've added
- **Active Interviews**: Applications in interviewing status
- **Application Status**: Breakdown by status (Applied, Ghosted, etc.)
- **Recent Applications**: Your latest 5 applications
- **Upcoming Interviews**: Next 5 scheduled interviews

---

## 🔧 Common Commands

### Backend

```bash
# Create superuser for admin panel
python manage.py createsuperuser

# Run tests
python manage.py test

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

### Docker

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build
```

---

## ❓ Troubleshooting

### Backend won't start

**Error: Port 8000 already in use**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

**Error: No module named 'rest_framework'**
```bash
# Make sure you're in virtual environment
pip install -r requirements.txt
```

### Frontend won't start

**Error: Port 3000 already in use**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

**Error: Module not found**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

If you see CORS errors in browser console:

1. Check backend is running on http://127.0.0.1:8000
2. Check `CORS_ALLOWED_ORIGINS` in `backend/job_tracker/settings.py`
3. Restart backend server

### Database Errors

**Reset database (WARNING: Deletes all data)**
```bash
cd backend
rm db.sqlite3
python manage.py migrate
```

---

## 📱 Using the Application

### Adding Applications

1. **Required fields:**
   - Company name
   - Position
   - Status
   - Applied date

2. **Optional fields:**
   - Resume (PDF, DOC, DOCX)
   - Job description
   - Contact email
   - Contact phone
   - Company website
   - Notes

### Status Types

| Status | When to Use |
|--------|-------------|
| Applied | Just submitted application |
| Ghosted | No response received |
| Interviewing | Interview scheduled/in progress |
| Assessment | Technical test/assignment |

### Interview Types

| Type | Description |
|------|-------------|
| Technical | Coding/technical interview |
| HR | Human resources screening |
| Behavioral | Behavioral questions |
| Final | Final round/decision |
| Phone Screen | Initial phone call |
| System Design | Architecture/design interview |

---

## 🎨 Customization

### Change Color Scheme

Edit `frontend/tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        // ... more colors
      }
    }
  }
}
```

### Add Custom Status

1. Edit `backend/applications/models.py`:
```python
STATUS_CHOICES = [
    # ... existing choices
    ("YourStatus", "Your Status"),
]
```

2. Create migration:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. Update frontend in `frontend/src/app/add-application/page.js`

---

## 📚 Next Steps

1. ✅ **Read the full [README.md](README.md)**
2. 📖 **Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)** for API details
3. 🚀 **See [DEPLOYMENT.md](DEPLOYMENT.md)** for production deployment
4. 🤝 **Read [CONTRIBUTING.md](CONTRIBUTING.md)** to contribute
5. 🔒 **Review [SECURITY.md](SECURITY.md)** for security best practices

---

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/yourusername/job-tracker/issues)
- **Email**: support@example.com
- **Documentation**: See README.md

---

**Happy job hunting! 🎯**
