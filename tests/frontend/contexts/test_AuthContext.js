/**
 * Tests for AuthContext
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('AuthContext', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    localStorageMock.getItem.mockReturnValue(null);
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
    });
  });

  describe('checkAuth', () => {
    it('should set loading to false when no token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBe(null);
      });
    });

    it('should authenticate user when valid token exists', async () => {
      const mockToken = 'valid_access_token';
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      localStorageMock.getItem.mockReturnValue(mockToken);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should try to refresh token when access token is invalid', async () => {
      const mockAccessToken = 'expired_token';
      const mockRefreshToken = 'valid_refresh_token';
      const newAccessToken = 'new_access_token';
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'access_token') return mockAccessToken;
        if (key === 'refresh_token') return mockRefreshToken;
        return null;
      });

      // First call fails (expired token)
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      // Refresh token call succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: newAccessToken }),
      });

      // Get user call succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', newAccessToken);
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      const mockTokens = {
        access: 'access_token',
        refresh: 'refresh_token',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          tokens: mockTokens,
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password123');
      });

      expect(loginResult.success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', mockTokens.access);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockTokens.refresh);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'wrongpassword');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Network error. Please try again.');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockUser = {
        id: 1,
        username: 'newuser',
        email: 'newuser@example.com',
      };
      const mockTokens = {
        access: 'access_token',
        refresh: 'refresh_token',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          tokens: mockTokens,
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register(
          'newuser',
          'newuser@example.com',
          'password123',
          'New',
          'User'
        );
      });

      expect(registerResult.success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', mockTokens.access);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockTokens.refresh);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle registration failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Username already exists' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register(
          'existinguser',
          'existing@example.com',
          'password123'
        );
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe('Username already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockRefreshToken = 'refresh_token';
      localStorageMock.getItem.mockReturnValue(mockRefreshToken);

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set initial state
      act(() => {
        result.current.user = { id: 1, username: 'testuser' };
        result.current.isAuthenticated = true;
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });

    it('should logout even if API call fails', async () => {
      const mockRefreshToken = 'refresh_token';
      localStorageMock.getItem.mockReturnValue(mockRefreshToken);

      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });
});
