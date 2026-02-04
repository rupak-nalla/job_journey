// API Configuration
// 
// Behavior:
// - If NEXT_PUBLIC_API_URL is explicitly set, it will be used
// - In local development (localhost), defaults to http://127.0.0.1:8000
// - In production (deployed), uses relative URLs (same origin) which works with nginx reverse proxy
// - Relative URLs ensure requests go through the same domain, avoiding CORS issues

const getApiBaseUrl = () => {
  // Always use environment variable if explicitly set
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // During build time or server-side rendering
  if (typeof window === 'undefined') {
    // If API URL is explicitly set, use it
    if (apiUrl) {
      return apiUrl;
    }
    // Otherwise use default for build time (prevents build failures)
    return 'http://127.0.0.1:8000';
  }
  
  // Client-side - determine the API URL based on environment
  if (apiUrl) {
    // Explicitly set API URL - use it
    return apiUrl;
  }
  
  // No explicit API URL set - determine based on current environment
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.startsWith('192.168.') ||
                      hostname.startsWith('10.') ||
                      hostname.startsWith('172.');
  
  if (isLocalhost) {
    // Local development - use localhost backend
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'NEXT_PUBLIC_API_URL is not set. Using default http://127.0.0.1:8000 for local development.'
      );
    }
    return 'http://127.0.0.1:8000';
  } else {
    // Production/deployed environment (any hostname that's not localhost)
    // Since we're using nginx reverse proxy, use relative URLs (same origin)
    // This ensures requests go through the same domain and nginx routes them correctly
    console.log('[API Config] Production detected, using relative URLs. Hostname:', hostname);
    return ''; // Empty string = relative URLs (same origin)
  }
};

// Helper to get base URL at runtime (evaluates each time)
// This ensures we always check window.location at runtime, not build time
const getBaseUrl = () => {
  // Force runtime evaluation - check if we're in browser
  if (typeof window === 'undefined') {
    // Server-side (SSR/build) - return default
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  }
  
  // Client-side - always evaluate fresh
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

// Export API_BASE_URL - this is evaluated at module load time for backward compatibility
// Note: For runtime evaluation, use getBaseUrl() directly or access API_ENDPOINTS getters
// In production, this will be the build-time default, but API_ENDPOINTS getters evaluate at runtime
export const API_BASE_URL = typeof window !== 'undefined' ? getBaseUrl() : 'http://127.0.0.1:8000';

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
