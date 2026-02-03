# Deployment Guide

This guide covers deploying the Job Application Tracker to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
  - [Heroku](#heroku)
  - [Vercel + Railway](#vercel--railway)
  - [Docker](#docker)
  - [VPS (Ubuntu)](#vps-ubuntu)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Git repository with your code
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
SECRET_KEY=your-super-secret-key-minimum-50-characters-long
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Email (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (Optional, for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

### Frontend Environment Variables

Create `.env.production` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Database Setup

### PostgreSQL (Recommended for Production)

1. **Install PostgreSQL** on your server or use a managed service

2. **Update Django settings:**

```python
# backend/job_tracker/settings.py
import dj_database_url

DATABASES = {
    'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
}
```

3. **Install psycopg2:**

```bash
pip install psycopg2-binary
# Add to requirements.txt
```

4. **Run migrations:**

```bash
python manage.py migrate
```

---

## Deployment Options

### Option 1: Heroku

#### Backend Deployment

1. **Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. **Create Heroku app:**
```bash
cd backend
heroku create your-app-backend
```

3. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set environment variables:**
```bash
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS="your-app-backend.herokuapp.com"
```

5. **Create `Procfile` in backend:**
```
web: gunicorn job_tracker.wsgi --log-file -
release: python manage.py migrate
```

6. **Deploy:**
```bash
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-backend
git push heroku main
```

7. **Create superuser:**
```bash
heroku run python manage.py createsuperuser
```

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel --prod
```

3. **Set environment variables** in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-app-backend.herokuapp.com
```

---

### Option 2: Vercel + Railway

#### Backend on Railway

1. **Go to [Railway.app](https://railway.app)**

2. **Create new project** → Deploy from GitHub

3. **Select backend folder**

4. **Add PostgreSQL** plugin

5. **Set environment variables** in Railway dashboard

6. **Railway will auto-deploy**

#### Frontend on Vercel

1. **Go to [Vercel.com](https://vercel.com)**

2. **Import Git repository**

3. **Set root directory** to `frontend`

4. **Add environment variable:**
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

5. **Deploy**

---

### Option 3: Docker

#### Using Docker Compose

1. **Update `docker-compose.yml` for production:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: job_tracker
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: dbpassword

  backend:
    build: ./backend
    command: gunicorn job_tracker.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=postgresql://dbuser:dbpassword@db:5432/job_tracker
    depends_on:
      - db

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/static
      - media_volume:/media
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

2. **Create `nginx.conf`:**

```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }
    
    location /media/ {
        alias /media/;
    }
    
    location /static/ {
        alias /static/;
    }
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Deploy:**
```bash
docker-compose up -d
```

---

### Option 4: VPS (Ubuntu)

#### Server Setup

1. **Update system:**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install dependencies:**
```bash
sudo apt install -y python3.12 python3-pip python3-venv
sudo apt install -y nodejs npm
sudo apt install -y nginx postgresql postgresql-contrib
sudo apt install -y certbot python3-certbot-nginx
```

#### Backend Setup

1. **Clone repository:**
```bash
cd /var/www
sudo git clone https://github.com/yourusername/job-tracker.git
cd job-tracker/backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

3. **Configure PostgreSQL:**
```bash
sudo -u postgres psql
CREATE DATABASE job_tracker;
CREATE USER dbuser WITH PASSWORD 'dbpassword';
GRANT ALL PRIVILEGES ON DATABASE job_tracker TO dbuser;
\q
```

4. **Set up environment:**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

5. **Run migrations:**
```bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

6. **Create systemd service** (`/etc/systemd/system/job-tracker.service`):
```ini
[Unit]
Description=Job Tracker Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/job-tracker/backend
Environment="PATH=/var/www/job-tracker/backend/venv/bin"
ExecStart=/var/www/job-tracker/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/var/www/job-tracker/backend/gunicorn.sock \
          job_tracker.wsgi:application

[Install]
WantedBy=multi-user.target
```

7. **Start service:**
```bash
sudo systemctl start job-tracker
sudo systemctl enable job-tracker
```

#### Frontend Setup

1. **Build frontend:**
```bash
cd /var/www/job-tracker/frontend
npm install
npm run build
```

2. **Create systemd service** (`/etc/systemd/system/job-tracker-frontend.service`):
```ini
[Unit]
Description=Job Tracker Frontend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/job-tracker/frontend
Environment="PATH=/usr/bin"
ExecStart=/usr/bin/npm start

[Install]
WantedBy=multi-user.target
```

3. **Start service:**
```bash
sudo systemctl start job-tracker-frontend
sudo systemctl enable job-tracker-frontend
```

#### Nginx Configuration

1. **Create nginx config** (`/etc/nginx/sites-available/job-tracker`):
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;
    
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/job-tracker/backend/gunicorn.sock;
    }
    
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/job-tracker/backend/gunicorn.sock;
    }
    
    location /media/ {
        alias /var/www/job-tracker/backend/media/;
    }
    
    location /static/ {
        alias /var/www/job-tracker/backend/staticfiles/;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/job-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

3. **Get SSL certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Post-Deployment

### 1. Health Checks

Test all endpoints:
```bash
curl https://yourdomain.com/api/job-stats/
curl https://yourdomain.com
```

### 2. Monitoring

Set up monitoring with:
- [Sentry](https://sentry.io) for error tracking
- [UptimeRobot](https://uptimerobot.com) for uptime monitoring
- [Google Analytics](https://analytics.google.com) for usage tracking

### 3. Backups

Set up automated backups:

**PostgreSQL:**
```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump job_tracker > /backups/db_backup_$DATE.sql
# Upload to S3 or similar
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
crontab -e
0 2 * * * /usr/local/bin/backup-db.sh
```

### 4. Security

- Enable firewall
- Set up fail2ban
- Regular security updates
- Monitor logs

---

## Troubleshooting

### Common Issues

**502 Bad Gateway:**
- Check if Gunicorn is running: `sudo systemctl status job-tracker`
- Check Gunicorn socket: `ls -la /var/www/job-tracker/backend/gunicorn.sock`
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`

**Database Connection Error:**
- Verify DATABASE_URL
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql -U dbuser -d job_tracker -h localhost`

**Static Files Not Loading:**
- Run collectstatic: `python manage.py collectstatic`
- Check nginx static files configuration
- Verify file permissions

**CORS Errors:**
- Check CORS_ALLOWED_ORIGINS in settings
- Verify frontend is using correct API URL
- Check nginx proxy headers

---

## Performance Optimization

1. **Enable caching:**
   - Redis for Django cache
   - CDN for static files

2. **Database optimization:**
   - Add indexes
   - Connection pooling

3. **Frontend optimization:**
   - Enable Next.js image optimization
   - Implement code splitting

4. **Server optimization:**
   - Tune Gunicorn workers
   - Configure nginx caching

---

For additional help, consult:
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
