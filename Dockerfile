# Multi-stage build for Job Tracker full-stack application
# This Dockerfile builds both backend and frontend in a single container

# ============================================================================
# Stage 1: Backend Builder
# ============================================================================
FROM python:3.12-slim AS backend-builder

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================================================
# Stage 2: Frontend Builder
# ============================================================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./
# Install dependencies (use npm install for better compatibility)
RUN npm install --legacy-peer-deps --prefer-offline --no-audit

# Copy frontend source and build
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================================
# Stage 3: Production Runtime
# ============================================================================
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies and Node.js for running Next.js
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy backend from builder
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin
COPY backend/ ./backend/

# Copy frontend build from builder
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Create necessary directories
RUN mkdir -p ./backend/media/resumes && \
    mkdir -p ./frontend

# Set working directory to backend for migrations
WORKDIR /app/backend

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput || true

# Expose ports
EXPOSE 8000 3000

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Run backend migrations\n\
echo "Running database migrations..."\n\
python manage.py migrate --noinput || true\n\
\n\
# Start backend with gunicorn in background\n\
echo "Starting backend server..."\n\
gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 job_tracker.wsgi:application &\n\
BACKEND_PID=$!\n\
\n\
# Start frontend\n\
echo "Starting frontend server..."\n\
cd ./frontend\n\
PORT=3000 HOSTNAME=0.0.0.0 node server.js &\n\
FRONTEND_PID=$!\n\
\n\
# Wait for both processes\n\
wait $BACKEND_PID $FRONTEND_PID\n\
' > ./start.sh && chmod +x ./start.sh

# Run startup script
CMD ["./start.sh"]
