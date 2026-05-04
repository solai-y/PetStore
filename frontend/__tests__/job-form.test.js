import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('@/lib/api', () => ({
  api: {
    pets: { list: jest.fn() },
    bookings: { create: jest.fn() },
  },
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
  Toaster: () => null,
}));

jest.mock('@/components/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-skeleton" />,
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

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, ...rest }) => <textarea id={id} {...rest} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }) => (
    <div>
      <button type="button" role="combobox" onClick={() => onValueChange && onValueChange('pet-1')}>
        Select a pet
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));

const { default: NewJobPage } = require('@/app/jobs/new/page');

describe('New job form', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush, back: mockBack });
    useAuth.mockReturnValue({
      user: { id: 'owner-id', role: 'owner' },
      isLoading: false,
    });
    api.pets.list.mockResolvedValue([
      { id: 'pet-1', name: 'Buddy', species: 'dog' },
    ]);
  });

  it('renders the form after loading pets', async () => {
    render(<NewJobPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /post job/i })).toBeInTheDocument();
    });
  });

  it('shows validation errors on empty submit', async () => {
    render(<NewJobPage />);
    await waitFor(() => screen.getByRole('button', { name: /post job/i }));

    await userEvent.click(screen.getByRole('button', { name: /post job/i }));
    await waitFor(() => {
      expect(screen.getByText(/please select a pet/i)).toBeInTheDocument();
    });
  });

  it('calls api.bookings.create when form is filled and submitted', async () => {
    api.bookings.create.mockResolvedValue({ id: 'booking-1' });
    render(<NewJobPage />);
    await waitFor(() => screen.getByRole('button', { name: /post job/i }));

    // Select a pet via the mock combobox
    await userEvent.click(screen.getByRole('combobox'));

    await userEvent.type(screen.getByLabelText(/start date/i), '2024-06-01');
    await userEvent.type(screen.getByLabelText(/end date/i), '2024-06-03');
    await userEvent.type(screen.getByLabelText(/description/i), 'Walk my dog twice a day please');

    await userEvent.click(screen.getByRole('button', { name: /post job/i }));

    await waitFor(() => {
      expect(api.bookings.create).toHaveBeenCalled();
    });
  });
});
