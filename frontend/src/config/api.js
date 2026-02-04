// API Configuration
// In production, these should be set via environment variables

const getApiBaseUrl = () => {
  // Always use environment variable - no hardcoded defaults for security
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // During build time or server-side rendering, always use a default
  // This prevents build failures and allows static generation
  if (typeof window === 'undefined') {
    // Server-side (build time or SSR) - use default or env var
    return apiUrl || 'http://127.0.0.1:8000';
  }
  
  // Client-side - check if we should use relative URLs (same origin)
  // If no API URL is set and we're in production, use relative URLs
  // This works when frontend and backend are served through the same proxy
  if (!apiUrl) {
    // In production, if no API URL is set, assume same origin (nginx proxy)
    // Check if we're running in production by checking the hostname
    // If it's not localhost/127.0.0.1, assume production
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.startsWith('192.168.');
    
    if (isProduction || process.env.NODE_ENV === 'production') {
      return ''; // Empty string = relative URLs (same origin)
    }
    
    // Development mode - use localhost
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'NEXT_PUBLIC_API_URL is not set. Using default http://127.0.0.1:8000 for local development. ' +
        'Please set NEXT_PUBLIC_API_URL in your .env.local file for production.'
      );
      return 'http://127.0.0.1:8000';
    }
    
    return 'http://127.0.0.1:8000';
  }
  
  return apiUrl;
};

// Helper to get base URL at runtime (evaluates each time)
const getBaseUrl = () => {
  return getApiBaseUrl();
};

// Create API_ENDPOINTS with getters that evaluate at runtime
export const API_ENDPOINTS = {
  // Authentication
  get REGISTER() { return `${getBaseUrl()}/api/auth/register/`; },
  get LOGIN() { return `${getBaseUrl()}/api/auth/login/`; },
  get LOGOUT() { return `${getBaseUrl()}/api/auth/logout/`; },
  get GET_USER() { return `${getBaseUrl()}/api/auth/user/`; },
  get REFRESH_TOKEN() { return `${getBaseUrl()}/api/auth/refresh/`; },
  
  // Job Applications
  get JOB_STATS() { return `${getBaseUrl()}/api/job-stats/`; },
  get RECENT_APPLICATIONS() { return `${getBaseUrl()}/api/recent-applications/`; },
  get UPCOMING_INTERVIEWS() { return `${getBaseUrl()}/api/upcoming-interviews/`; },
  get INTERVIEW_STATS() { return `${getBaseUrl()}/api/interview-stats/`; },
  get ADD_JOB_APPLICATION() { return `${getBaseUrl()}/api/add-job-application/`; },
  GET_JOB_APPLICATION: (id) => `${getBaseUrl()}/api/applications/${id}/`,
  UPDATE_JOB_APPLICATION: (id) => `${getBaseUrl()}/api/applications/${id}/update/`,
  DELETE_JOB_APPLICATION: (id) => `${getBaseUrl()}/api/applications/${id}/delete/`,
  get MEDIA_BASE() { return getBaseUrl(); },
  
  // Support
  get SUBMIT_SUPPORT() { return `${getBaseUrl()}/api/support/`; },
};

// Export API_BASE_URL as a getter function for backward compatibility
export const API_BASE_URL = getBaseUrl();

// Helper function to get auth headers
export const getAuthHeaders = (includeContentType = true) => {
  if (typeof window === 'undefined') return {};
  
  const headers = {};
  
  // Safely retrieve token from localStorage (may throw in restricted environments)
  let token = null;
  try {
    token = localStorage.getItem('access_token');
  } catch (error) {
    // Log error but continue execution
    console.warn('Failed to access localStorage:', error);
  }
  
  // Only set Authorization header if token was successfully retrieved
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Helper function to handle API errors
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  return error.message || defaultMessage;
};
