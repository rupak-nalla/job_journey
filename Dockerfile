# Multi-stage build for JobJourney full-stack application
# This Dockerfile builds both backend and frontend in a single container

# ============================================================================
# Stage 1: Backend Builder
# ============================================================================
FROM python:3.12-slim AS backend-builder

WORKDIR /backend

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

WORKDIR /frontend

# Copy package files and install dependencies
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./
# Install dependencies (use npm install for better compatibility)
RUN npm install --legacy-peer-deps --prefer-offline --no-audit

# Copy frontend source and build
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
# Set a default API URL for build time (can be overridden at runtime)
ENV NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
RUN npm run build

# ============================================================================
# Stage 3: Production Runtime
# ============================================================================
FROM python:3.12-slim

WORKDIR /workspace

# Install system dependencies, Node.js, nginx, and netcat for health checks
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    nginx \
    netcat-openbsd \
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
COPY --from=frontend-builder /frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /frontend/public ./frontend/public

# Create necessary directories
RUN mkdir -p ./backend/media/resumes && \
    mkdir -p ./frontend

# Set working directory to backend for migrations
WORKDIR /workspace/backend

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port (nginx will handle routing, uses PORT env var at runtime)
EXPOSE 8080

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Run startup script
CMD ["./start.sh"]
