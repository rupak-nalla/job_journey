# Backend Dockerfile for Django application
# This Dockerfile assumes Root Directory is set to "backend" in Render
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy requirements and install dependencies (build context is backend/ directory)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code (build context is backend/ directory)
COPY . .

# Create media directory
RUN mkdir -p ./media/resumes

# Collect static files (will use default SECRET_KEY if not set, but that's okay for build)
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate --noinput && \
    gunicorn --bind 0.0.0.0:$PORT --workers 3 --timeout 120 job_journey.wsgi:application
