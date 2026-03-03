import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import { mockAuthContext } from '../../../test/utils';

// Need to import LoginPage after mocks are set up
import LoginPage from '../LoginPage';

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        render(<LoginPage />);
        expect(screen.getByText('auth.signInButton')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.emailAccessId')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.securePassword')).toBeInTheDocument();
    });

    it('shows demo account buttons', () => {
        render(<LoginPage />);
        expect(screen.getByText('auth.conciergeLabel')).toBeInTheDocument();
        expect(screen.getByText('auth.guestLabel')).toBeInTheDocument();
        expect(screen.getByText('auth.specialistLabel')).toBeInTheDocument();
    });

    it('validates empty email', async () => {
        render(<LoginPage />);

        // Need to submit the form
        const form = screen.getByText('auth.signInButton').closest('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getAllByText('validation.fieldRequired').length).toBeGreaterThanOrEqual(1);
        });
    });

    it('validates invalid email format', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('auth.emailAccessId'), {
            target: { value: 'notanemail' },
        });
        fireEvent.change(screen.getByLabelText('auth.securePassword'), {
            target: { value: 'password123' },
        });

        const form = screen.getByText('auth.signInButton').closest('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('errors.invalidEmail')).toBeInTheDocument();
        });
    });

    it('validates short password', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('auth.emailAccessId'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.change(screen.getByLabelText('auth.securePassword'), {
            target: { value: '123' },
        });
        fireEvent.click(screen.getByText('auth.signInButton'));

        await waitFor(() => {
            expect(screen.getByText('errors.passwordTooShort')).toBeInTheDocument();
        });
    });

    it('calls signIn with valid credentials', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('auth.emailAccessId'), {
            target: { value: 'parent@demo.com' },
        });
        fireEvent.change(screen.getByLabelText('auth.securePassword'), {
            target: { value: 'demo1234' },
        });
        fireEvent.click(screen.getByText('auth.signInButton'));

        await waitFor(() => {
            expect(mockAuthContext.signIn).toHaveBeenCalledWith('parent@demo.com', 'demo1234');
        });
    });

    it('fills credentials when demo button clicked', () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText('auth.guestLabel'));

        expect(screen.getByLabelText('auth.emailAccessId')).toHaveValue('parent@demo.com');
        expect(screen.getByLabelText('auth.securePassword')).toHaveValue('demo1234');
    });

    it('fills hotel credentials when concierge demo clicked', () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText('auth.conciergeLabel'));

        expect(screen.getByLabelText('auth.emailAccessId')).toHaveValue('hotel@demo.com');
    });
});
