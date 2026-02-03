# Job Application Tracker - Frontend

A modern, production-ready job application tracking system built with Next.js 15 and React 19.

## Features

- 🎨 Modern UI with custom color palette
- 📱 Fully responsive design
- ⚡ Fast and optimized
- 🔒 Production-ready with error handling
- 📊 Real-time statistics and tracking
- 📄 Resume upload and management
- 🔄 Status tracking (Applied, Ghosted, Interviewing, Assessment, Offered)

## Color Palette

The application uses a professional blue gradient palette:
- **Primary Dark**: `#03045e`
- **Primary**: `#0077b6`
- **Primary Light**: `#00b4d8`
- **Accent**: `#90e0ef`
- **Accent Light**: `#caf0f8`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (copy from `.env.example`):
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://127.0.0.1:8000)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.js       # Main dashboard
│   │   ├── add-application/  # Add application page
│   │   └── application/  # Application detail pages
│   ├── components/       # React components
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
├── public/               # Static assets
└── package.json
```

## Production Optimizations

- ✅ Error boundaries for error handling
- ✅ API configuration with environment variables
- ✅ SEO optimization with meta tags
- ✅ Security headers
- ✅ Image optimization
- ✅ Code splitting and lazy loading
- ✅ Compression enabled
- ✅ Standalone output for deployment

## Deployment

The application is configured for production deployment with:
- Standalone output mode
- Optimized builds
- Security headers
- Error boundaries

Deploy to platforms like Vercel, Netlify, or any Node.js hosting service.
