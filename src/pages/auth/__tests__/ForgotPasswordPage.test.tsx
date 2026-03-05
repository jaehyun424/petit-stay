import { render, screen, fireEvent, waitFor } from '../../../test/utils';

import ForgotPasswordPage from '../ForgotPasswordPage';

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    sendPasswordResetEmail: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders forgot password form', () => {
        render(<ForgotPasswordPage />);
        expect(screen.getByText('auth.sendResetLink')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.emailAccessId')).toBeInTheDocument();
    });

    it('shows back to login link', () => {
        render(<ForgotPasswordPage />);
        expect(screen.getByText('auth.backToLogin')).toBeInTheDocument();
    });

    it('validates empty email', async () => {
        render(<ForgotPasswordPage />);

        const form = screen.getByText('auth.sendResetLink').closest('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('validation.fieldRequired')).toBeInTheDocument();
        });
    });

    it('validates invalid email format', async () => {
        render(<ForgotPasswordPage />);

        fireEvent.change(screen.getByLabelText('auth.emailAccessId'), {
            target: { value: 'notanemail' },
        });

        const form = screen.getByText('auth.sendResetLink').closest('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('errors.invalidEmail')).toBeInTheDocument();
        });
    });

    it('shows success message after sending reset link in demo mode', async () => {
        render(<ForgotPasswordPage />);

        fireEvent.change(screen.getByLabelText('auth.emailAccessId'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.click(screen.getByText('auth.sendResetLink'));

        await waitFor(() => {
            expect(screen.getByText('auth.checkYourEmail')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('displays the success description after sending reset link', async () => {
        render(<ForgotPasswordPage />);

        fireEvent.change(screen.getByLabelText('auth.emailAccessId'), {
            target: { value: 'test@hotel.com' },
        });
        fireEvent.click(screen.getByText('auth.sendResetLink'));

        await waitFor(() => {
            expect(screen.getByText('auth.resetSuccessDesc')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
