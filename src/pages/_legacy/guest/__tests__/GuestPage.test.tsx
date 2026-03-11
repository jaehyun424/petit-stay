// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../../test/utils';

// Mock useGuestToken
const mockUseGuestToken = vi.fn();
vi.mock('../../../hooks/guest/useGuestToken', () => ({
  useGuestToken: (...args: unknown[]) => mockUseGuestToken(...args),
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ reservationId: 'res-1' }),
    useSearchParams: () => [new URLSearchParams('token=demo-token'), vi.fn()],
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock sub-components to isolate GuestPage logic
vi.mock('../components/StepIndicator', () => ({
  StepIndicator: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div data-testid="step-indicator">Step {currentStep} of {totalSteps}</div>
  ),
}));

vi.mock('../components/ReservationInfo', () => ({
  ReservationInfo: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="step-1">
      <h3>Reservation Info</h3>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('../components/ConsentForm', () => ({
  ConsentForm: ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
    <div data-testid="step-2">
      <h3>Consent Form</h3>
      <button onClick={onBack}>Back</button>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('../components/PaymentStep', () => ({
  PaymentStep: ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
    <div data-testid="step-3">
      <h3>Payment</h3>
      <button onClick={onBack}>Back</button>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('../components/ConfirmationStep', () => ({
  ConfirmationStep: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="step-4">
      <h3>Confirmation</h3>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('../components/FeedbackStep', () => ({
  FeedbackStep: () => (
    <div data-testid="step-5">
      <h3>Feedback</h3>
    </div>
  ),
}));

vi.mock('../../../components/common/BrandLogo', () => ({
  BrandLogo: () => <div data-testid="brand-logo">Logo</div>,
}));

vi.mock('../../../components/common/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher">Lang</div>,
}));

import GuestPage from '../GuestPage';

const validReservation = {
  id: 'res-1',
  hotelName: 'Grand Hyatt Seoul',
  roomNumber: '2305',
  guestName: 'Sarah Johnson',
  date: '2026-03-05',
  time: '18:00 - 22:00',
  children: [{ name: 'Emma', age: 5 }],
  sitterName: 'Kim Minjung',
  sitterTier: 'gold' as const,
  totalAmount: 280000,
  confirmationCode: 'KCP-2026-0042',
  status: 'pending_guest_consent',
};

describe('GuestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseGuestToken.mockReturnValue({
      reservation: null,
      isLoading: true,
      isValid: false,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);
    expect(screen.getByText('guest.loading')).toBeTruthy();
  });

  it('shows expired token error', () => {
    mockUseGuestToken.mockReturnValue({
      reservation: null,
      isLoading: false,
      isValid: false,
      isExpired: true,
      error: null,
    });

    render(<GuestPage />);
    expect(screen.getByText('guest.tokenExpired')).toBeTruthy();
  });

  it('shows invalid token error', () => {
    mockUseGuestToken.mockReturnValue({
      reservation: null,
      isLoading: false,
      isValid: false,
      isExpired: false,
      error: 'invalid',
    });

    render(<GuestPage />);
    expect(screen.getByText('guest.tokenInvalid')).toBeTruthy();
  });

  it('renders step 1 (ReservationInfo) by default', () => {
    mockUseGuestToken.mockReturnValue({
      reservation: validReservation,
      isLoading: false,
      isValid: true,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);
    expect(screen.getByTestId('step-1')).toBeTruthy();
    expect(screen.getByTestId('step-indicator')).toBeTruthy();
    expect(screen.getByText('Step 1 of 5')).toBeTruthy();
  });

  it('navigates to step 2 when Next is clicked', async () => {
    mockUseGuestToken.mockReturnValue({
      reservation: validReservation,
      isLoading: false,
      isValid: true,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);
    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeTruthy();
    });
  });

  it('navigates back from step 2 to step 1', async () => {
    mockUseGuestToken.mockReturnValue({
      reservation: validReservation,
      isLoading: false,
      isValid: true,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);
    // Go to step 2
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeTruthy();
    });

    // Go back to step 1
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => {
      expect(screen.getByTestId('step-1')).toBeTruthy();
    });
  });

  it('navigates through all 5 steps', async () => {
    mockUseGuestToken.mockReturnValue({
      reservation: validReservation,
      isLoading: false,
      isValid: true,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);

    // Step 1 → 2
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-2')).toBeTruthy());

    // Step 2 → 3
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-3')).toBeTruthy());

    // Step 3 → 4
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-4')).toBeTruthy());

    // Step 4 → 5
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-5')).toBeTruthy());
  });

  it('renders page title when valid', () => {
    mockUseGuestToken.mockReturnValue({
      reservation: validReservation,
      isLoading: false,
      isValid: true,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);
    expect(screen.getByText('guest.pageTitle')).toBeTruthy();
  });

  it('renders language switcher', () => {
    mockUseGuestToken.mockReturnValue({
      reservation: validReservation,
      isLoading: false,
      isValid: true,
      isExpired: false,
      error: null,
    });

    render(<GuestPage />);
    expect(screen.getByTestId('lang-switcher')).toBeTruthy();
  });
});
