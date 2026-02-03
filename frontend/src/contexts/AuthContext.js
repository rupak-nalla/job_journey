"use client"
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Prevent infinite recursion if already refreshing
    if (isRefreshing) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Clear auth state when no token
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.GET_USER, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token might be expired, try to refresh
        await refreshAccessToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    // Prevent infinite recursion
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logout();
        return;
      }

      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        
        // Directly fetch user instead of calling checkAuth to avoid recursion
        try {
          const userResponse = await fetch(API_ENDPOINTS.GET_USER, {
            headers: getAuthHeaders(),
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // If user fetch fails after refresh, logout
            logout();
          }
        } catch (userError) {
          console.error('Failed to fetch user after token refresh:', userError);
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (username, email, password, first_name = '', last_name = '') => {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, first_name, last_name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/login');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
