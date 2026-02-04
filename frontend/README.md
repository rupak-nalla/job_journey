# Job Tracker - Frontend

Frontend application for Job Tracker built with Next.js 15 and React 19.

## Overview

Modern, responsive frontend with authentication, dashboard, application management, and support features.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set NEXT_PUBLIC_API_URL
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access application**
   - http://localhost:3000

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required in production)

See [ENV_SETUP.md](../ENV_SETUP.md) for detailed configuration.

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── login/        # Authentication
│   │   ├── register/
│   │   ├── add-application/
│   │   ├── application/  # Application details
│   │   └── support/      # Support form
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts (Auth)
│   └── config/           # API configuration
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:ci` - Run tests

## Features

- JWT-based authentication
- Responsive dashboard with statistics
- Application CRUD operations
- Interview scheduling
- Resume upload
- Support contact form
- Consistent UI with JobTracker branding

## Testing

```bash
npm run test:ci
```

## Deployment

Deploy to Vercel, Netlify, or any Node.js hosting service. See [DEPLOYMENT.md](../DEPLOYMENT.md) for details.
