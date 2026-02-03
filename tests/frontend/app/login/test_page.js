/**
 * Tests for Login Page
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/app/login/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginPage', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  const mockLogin = jest.fn();
  const mockUseAuth = {
    login: mockLogin,
    isAuthenticated: false,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show loading state when auth is loading', () => {
    useAuth.mockReturnValue({
      ...mockUseAuth,
      loading: true,
    });

    render(<LoginPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to dashboard if already authenticated', () => {
    useAuth.mockReturnValue({
      ...mockUseAuth,
      isAuthenticated: true,
      loading: false,
    });

    render(<LoginPage />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle form submission with valid credentials', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on login failure', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Invalid username or password',
    });

    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('should have link to register page', () => {
    render(<LoginPage />);
    
    const registerLink = screen.getByText('Sign up').closest('a');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should require username and password fields', () => {
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
