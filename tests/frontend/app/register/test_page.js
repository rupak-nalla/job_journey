/**
 * Tests for Register Page
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RegisterPage from '@/app/register/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('RegisterPage', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  const mockRegister = jest.fn();
  const mockUseAuth = {
    register: mockRegister,
    isAuthenticated: false,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('should render registration form', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Sign up to start tracking your job applications')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show loading state when auth is loading', () => {
    useAuth.mockReturnValue({
      ...mockUseAuth,
      loading: true,
    });

    render(<RegisterPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to dashboard if already authenticated', () => {
    useAuth.mockReturnValue({
      ...mockUseAuth,
      isAuthenticated: true,
      loading: false,
    });

    render(<RegisterPage />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle form submission with valid data', async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(<RegisterPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'newuser',
        'newuser@example.com',
        'password123',
        '',
        ''
      );
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error when passwords do not match', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('should display error when password is too short', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('should display error message on registration failure', async () => {
    mockRegister.mockResolvedValue({
      success: false,
      error: 'Username already exists',
    });

    render(<RegisterPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('should handle optional first_name and last_name fields', async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(<RegisterPage />);
    
    const firstNameInput = screen.getByPlaceholderText('First name');
    const lastNameInput = screen.getByPlaceholderText('Last name');
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'newuser',
        'newuser@example.com',
        'password123',
        'John',
        'Doe'
      );
    });
  });

  it('should disable submit button while loading', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<RegisterPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('should have link to login page', () => {
    render(<RegisterPage />);
    
    const loginLink = screen.getByText('Sign in').closest('a');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should require username, email, and password fields', () => {
    render(<RegisterPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });
});
