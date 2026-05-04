import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => children,
}));

jest.mock('@/lib/api', () => ({
  api: {
    bookings: {
      get: jest.fn(),
      confirm: jest.fn(),
      apply: jest.fn(),
    },
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

// Mock shadcn components to avoid ESM/JSX compilation issues
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...rest }) => (
    <button onClick={onClick} disabled={disabled} {...rest}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, ...rest }) => <textarea id={id} {...rest} />,
}));

const ownerBooking = {
  id: 'booking-1',
  status: 'open',
  description: 'Walk my dog',
  start_date: '2024-06-01',
  end_date: '2024-06-03',
  budget: 150,
  pets: { name: 'Buddy', species: 'dog' },
  applications: [
    {
      id: 'app-1',
      caretaker_id: 'caretaker-1',
      status: 'pending',
      message: 'I love dogs!',
      proposed_rate: 25,
      profiles: { email: 'caretaker@example.com' },
    },
  ],
};

const { default: JobDetailPage } = require('@/app/jobs/[id]/page');

describe('Job detail page — owner view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: jest.fn() });
    useParams.mockReturnValue({ id: 'booking-1' });
    useAuth.mockReturnValue({
      user: { id: 'owner-id', role: 'owner' },
      isLoading: false,
    });
    api.bookings.get.mockResolvedValue(ownerBooking);
  });

  it('renders applicant list with Confirm button', async () => {
    render(<JobDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('caretaker@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm this caretaker/i })).toBeInTheDocument();
    });
  });

  it('calls api.bookings.confirm when owner clicks Confirm', async () => {
    api.bookings.confirm.mockResolvedValue({ message: 'Confirmed' });
    api.bookings.get
      .mockResolvedValueOnce(ownerBooking)
      .mockResolvedValueOnce({ ...ownerBooking, status: 'confirmed' });

    render(<JobDetailPage />);
    await waitFor(() => screen.getByRole('button', { name: /confirm this caretaker/i }));

    await userEvent.click(screen.getByRole('button', { name: /confirm this caretaker/i }));

    await waitFor(() => {
      expect(api.bookings.confirm).toHaveBeenCalledWith('booking-1', { application_id: 'app-1' });
    });
  });
});

describe('Job detail page — caretaker view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: jest.fn() });
    useParams.mockReturnValue({ id: 'booking-1' });
    useAuth.mockReturnValue({
      user: { id: 'caretaker-2', role: 'caretaker' },
      isLoading: false,
    });
    api.bookings.get.mockResolvedValue({
      ...ownerBooking,
      applications: [],
    });
  });

  it('shows apply form for caretakers on open bookings', async () => {
    render(<JobDetailPage />);
    await waitFor(() => {
      expect(screen.getByText(/apply for this job/i)).toBeInTheDocument();
    });
  });

  it('calls api.bookings.apply when caretaker submits', async () => {
    api.bookings.apply.mockResolvedValue({ id: 'app-new' });
    api.bookings.get
      .mockResolvedValueOnce({ ...ownerBooking, applications: [] })
      .mockResolvedValueOnce(ownerBooking);

    render(<JobDetailPage />);
    await waitFor(() => screen.getByText(/apply for this job/i));

    await userEvent.type(
      screen.getByLabelText(/message/i),
      'I would love to help with this job!'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(api.bookings.apply).toHaveBeenCalledWith(
        'booking-1',
        expect.objectContaining({ message: 'I would love to help with this job!' })
      );
    });
  });
});
