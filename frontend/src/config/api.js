// API Configuration
// In production, these should be set via environment variables

const getApiBaseUrl = () => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Use the same origin in production, or localhost in development
    const hostname = window.location.hostname;
    
    // If running on localhost or 127.0.0.1, use localhost:8000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    }
    
    // In production, use the same origin or configured API URL
    return process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${hostname}:8000`;
  }
  
  // Server-side fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  JOB_STATS: `${API_BASE_URL}/api/job-stats/`,
  RECENT_APPLICATIONS: `${API_BASE_URL}/api/recent-applications/`,
  UPCOMING_INTERVIEWS: `${API_BASE_URL}/api/upcoming-interviews/`,
  ADD_JOB_APPLICATION: `${API_BASE_URL}/api/add-job-application/`,
  GET_JOB_APPLICATION: (id) => `${API_BASE_URL}/api/applications/${id}/`,
  UPDATE_JOB_APPLICATION: (id) => `${API_BASE_URL}/api/applications/${id}/update/`,
  DELETE_JOB_APPLICATION: (id) => `${API_BASE_URL}/api/applications/${id}/delete/`,
  MEDIA_BASE: API_BASE_URL,
};

// Helper function to handle API errors
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  return error.message || defaultMessage;
};
