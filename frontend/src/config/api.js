// API Configuration
// 
// Behavior:
// - If NEXT_PUBLIC_API_URL is explicitly set, it will be used
// - In local development (localhost), defaults to http://127.0.0.1:8000
// - In production (deployed), uses relative URLs (same origin) which works with nginx reverse proxy
// - Relative URLs ensure requests go through the same domain, avoiding CORS issues

const getApiBaseUrl = () => {
  // Production backend URL (hardcoded)
  const PRODUCTION_API_URL = 'https://job-tracker-dnai.onrender.com';
  
  // Check if NEXT_PUBLIC_API_URL is explicitly set (for override)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrlIsSet = apiUrl !== undefined && apiUrl !== null;
  
  // During build time or server-side rendering
  if (typeof window === 'undefined') {
    // If API URL is explicitly set, use it
    if (apiUrlIsSet) {
      return apiUrl;
    }
    // Otherwise use production URL for build time
    return PRODUCTION_API_URL;
  }
  
  // Client-side - determine the API URL based on environment
  if (apiUrlIsSet) {
    // Explicitly set API URL - use it (allows override)
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
    return 'http://127.0.0.1:8000';
  } else {
    // Production/deployed environment - use hardcoded production URL
    return PRODUCTION_API_URL;
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

// Create API_ENDPOINTS with getters that ALWAYS evaluate at runtime
// Using Object.defineProperty to ensure getters are not optimized away
const endpointDescriptors = {
  REGISTER: { get: () => `${getBaseUrl()}/api/auth/register/`, enumerable: true, configurable: true },
  LOGIN: { get: () => `${getBaseUrl()}/api/auth/login/`, enumerable: true, configurable: true },
  LOGOUT: { get: () => `${getBaseUrl()}/api/auth/logout/`, enumerable: true, configurable: true },
  GET_USER: { get: () => `${getBaseUrl()}/api/auth/user/`, enumerable: true, configurable: true },
  REFRESH_TOKEN: { get: () => `${getBaseUrl()}/api/auth/refresh/`, enumerable: true, configurable: true },
  JOB_STATS: { get: () => `${getBaseUrl()}/api/job-stats/`, enumerable: true, configurable: true },
  RECENT_APPLICATIONS: { get: () => `${getBaseUrl()}/api/recent-applications/`, enumerable: true, configurable: true },
  UPCOMING_INTERVIEWS: { get: () => `${getBaseUrl()}/api/upcoming-interviews/`, enumerable: true, configurable: true },
  INTERVIEW_STATS: { get: () => `${getBaseUrl()}/api/interview-stats/`, enumerable: true, configurable: true },
  ADD_JOB_APPLICATION: { get: () => `${getBaseUrl()}/api/add-job-application/`, enumerable: true, configurable: true },
  MEDIA_BASE: { get: () => getBaseUrl(), enumerable: true, configurable: true },
  SUBMIT_SUPPORT: { get: () => `${getBaseUrl()}/api/support/`, enumerable: true, configurable: true },
};

// Create the object with getters
export const API_ENDPOINTS = Object.create(null);
Object.defineProperties(API_ENDPOINTS, endpointDescriptors);

// Add function-based endpoints
API_ENDPOINTS.GET_JOB_APPLICATION = (id) => `${getBaseUrl()}/api/applications/${id}/`;
API_ENDPOINTS.UPDATE_JOB_APPLICATION = (id) => `${getBaseUrl()}/api/applications/${id}/update/`;
API_ENDPOINTS.DELETE_JOB_APPLICATION = (id) => `${getBaseUrl()}/api/applications/${id}/delete/`;

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
