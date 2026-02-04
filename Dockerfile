# Multi-stage build for Job Tracker full-stack application
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

# Install system dependencies, Node.js, and nginx for reverse proxy
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    nginx \
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

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Get PORT from environment (Render provides this) or use 8080\n\
NGINX_PORT=${PORT:-8080}\n\
\n\
# Create nginx config with dynamic port\n\
cat > /etc/nginx/nginx.conf <<\'NGINX_EOF\'\n\
events {\n\
    worker_connections 1024;\n\
}\n\
\n\
http {\n\
    upstream backend {\n\
        server 127.0.0.1:8000;\n\
    }\n\
\n\
    upstream frontend {\n\
        server 127.0.0.1:3000;\n\
    }\n\
\n\
    server {\n\
        listen NGINX_PORT_PLACEHOLDER default_server;\n\
        server_name _;\n\
\n\
        # Proxy API requests to backend\n\
        location /api/ {\n\
            proxy_pass http://backend;\n\
            proxy_set_header Host $host;\n\
            proxy_set_header X-Real-IP $remote_addr;\n\
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
            proxy_set_header X-Forwarded-Proto $scheme;\n\
        }\n\
\n\
        # Proxy media files to backend\n\
        location /media/ {\n\
            proxy_pass http://backend;\n\
            proxy_set_header Host $host;\n\
            proxy_set_header X-Real-IP $remote_addr;\n\
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
            proxy_set_header X-Forwarded-Proto $scheme;\n\
        }\n\
\n\
        # Serve frontend for all other requests\n\
        location / {\n\
            proxy_pass http://frontend;\n\
            proxy_set_header Host $host;\n\
            proxy_set_header X-Real-IP $remote_addr;\n\
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
            proxy_set_header X-Forwarded-Proto $scheme;\n\
            proxy_http_version 1.1;\n\
            proxy_set_header Upgrade $http_upgrade;\n\
            proxy_set_header Connection "upgrade";\n\
            proxy_cache_bypass $http_upgrade;\n\
        }\n\
    }\n\
}\n\
NGINX_EOF\n\
sed -i "s/NGINX_PORT_PLACEHOLDER/$NGINX_PORT/g" /etc/nginx/nginx.conf\n\
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
cd ../frontend\n\
PORT=3000 HOSTNAME=0.0.0.0 node server.js &\n\
FRONTEND_PID=$!\n\
\n\
# Start nginx reverse proxy\n\
echo "Starting nginx reverse proxy on port $NGINX_PORT..."\n\
nginx -g "daemon off;" &\n\
NGINX_PID=$!\n\
\n\
# Wait for all processes\n\
wait $BACKEND_PID $FRONTEND_PID $NGINX_PID\n\
' > ./start.sh && chmod +x ./start.sh

# Run startup script
CMD ["./start.sh"]
