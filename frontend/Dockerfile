# Frontend Dockerfile for Next.js application
# This Dockerfile assumes Root Directory is set to "frontend" in Render
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (build context is frontend/ directory)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps --prefer-offline --no-audit

# Copy frontend source (build context is frontend/ directory)
COPY . .

# Set build-time environment variable (can be overridden at runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application from builder
# Next.js standalone build outputs to .next/standalone in the WORKDIR
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port (Render will provide PORT via environment variable)
EXPOSE 3000

# Set default port (Render's PORT env var will override this)
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the production server (NOT dev server!)
# Next.js standalone server automatically uses PORT and HOSTNAME env vars
CMD ["node", "server.js"]
