import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => ({ get: () => null }),
  useParams: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }) => (
    <button onClick={onClick} disabled={disabled} type={type || 'button'}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, type, ...rest }) => <input id={id} type={type || 'text'} {...rest} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
  Toaster: () => null,
}));

const { default: LoginPage } = require('@/app/login/page');

describe('Login page', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
    useAuth.mockReturnValue({ login: mockLogin, user: null, isLoading: false });
  });

  it('renders email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('calls login and redirects on success', async () => {
    mockLogin.mockResolvedValue({ user: { role: 'owner' } });
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error toast on failed login', async () => {
    const { toast } = require('sonner');
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'bad@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
