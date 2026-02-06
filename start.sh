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

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=0
    
    echo "Waiting for $service_name to be ready on $host:$port..."
    while [ $attempt -lt $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            echo "$service_name is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo "Warning: $service_name did not become ready after $max_attempts attempts"
    return 1
}

# Note: netcat should be installed in Dockerfile, but check anyway
if ! command -v nc &> /dev/null; then
    echo "Warning: netcat not available, health checks may not work properly"
fi

# Run backend migrations (ensure we're in the backend directory)
echo "Running database migrations..."
cd /workspace/backend || cd ./backend || exit 1
python manage.py migrate --noinput || true

# Start backend with gunicorn in background
echo "Starting backend server..."
gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 job_journey.wsgi:application &
BACKEND_PID=$!

# Wait for backend to be ready
wait_for_service 127.0.0.1 8000 "Backend" || true

# Start frontend (ensure we're in the frontend directory)
echo "Starting frontend server..."
cd /workspace/frontend || cd ../frontend || exit 1
PORT=3000 HOSTNAME=0.0.0.0 node server.js &
FRONTEND_PID=$!

# Wait for frontend to be ready (give it more time as Next.js takes longer to start)
echo "Waiting for frontend to be ready..."
sleep 5
wait_for_service 127.0.0.1 3000 "Frontend" || true

# Start nginx reverse proxy
echo "Starting nginx reverse proxy on port $NGINX_PORT..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Function to handle shutdown
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID $NGINX_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Wait for all processes
wait $BACKEND_PID $FRONTEND_PID $NGINX_PID
