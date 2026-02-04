#!/bin/bash
set -e

# Get PORT from environment (Render provides this) or use 8080
NGINX_PORT=${PORT:-8080}

# Create nginx config with dynamic port
cat > /etc/nginx/nginx.conf <<'NGINX_EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server 127.0.0.1:8000;
    }

    upstream frontend {
        server 127.0.0.1:3000;
    }

    server {
        listen NGINX_PORT_PLACEHOLDER default_server;
        server_name _;

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Proxy media files to backend
        location /media/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Serve frontend for all other requests
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_cache_bypass $http_upgrade;
        }
    }
}
NGINX_EOF

# Replace placeholder with actual port
sed -i "s/NGINX_PORT_PLACEHOLDER/$NGINX_PORT/g" /etc/nginx/nginx.conf

# Run backend migrations
echo "Running database migrations..."
python manage.py migrate --noinput || true

# Start backend with gunicorn in background
echo "Starting backend server..."
gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 job_tracker.wsgi:application &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend server..."
cd ../frontend
PORT=3000 HOSTNAME=0.0.0.0 node server.js &
FRONTEND_PID=$!

# Start nginx reverse proxy
echo "Starting nginx reverse proxy on port $NGINX_PORT..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for all processes
wait $BACKEND_PID $FRONTEND_PID $NGINX_PID
