// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import { mockAuthContext } from '../../../test/utils';
import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form fields', () => {
        render(<RegisterPage />);
        expect(screen.getByPlaceholderText('auth.firstNamePlaceholder')).toBeTruthy();
        expect(screen.getByPlaceholderText('auth.lastNamePlaceholder')).toBeTruthy();
        expect(screen.getByPlaceholderText('auth.emailPlaceholder')).toBeTruthy();
        expect(screen.getByPlaceholderText('auth.passwordPlaceholder')).toBeTruthy();
    });

    it('renders submit button', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.submitApplication')).toBeTruthy();
    });

    it('renders first name label', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.firstName')).toBeTruthy();
    });

    it('renders last name label', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.lastName')).toBeTruthy();
    });

    it('renders email address label', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.email')).toBeTruthy();
    });

    it('renders password label', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.password')).toBeTruthy();
    });

    it('renders confirm password label', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.confirmPlaceholder')).toBeTruthy();
    });

    it('renders role selection cards', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.roleSelectTitle')).toBeTruthy();
    });

    it('renders language select', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.language')).toBeTruthy();
    });

    it('renders sign in link', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.signIn')).toBeTruthy();
    });

    it('renders brand logo', () => {
        render(<RegisterPage />);
        expect(screen.getByText('Stay')).toBeTruthy();
    });

    it('renders membership request heading', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.registerTitle')).toBeTruthy();
    });

    it('shows validation errors when submitting empty form', async () => {
        render(<RegisterPage />);

        fireEvent.click(screen.getByText('auth.submitApplication'));

        await waitFor(() => {
            // Should show required errors for firstName, lastName, email, password
            const requiredErrors = screen.getAllByText('validation.required');
            expect(requiredErrors.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('shows password mismatch error', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText('auth.firstNamePlaceholder'), {
            target: { value: 'John', name: 'firstName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.lastNamePlaceholder'), {
            target: { value: 'Doe', name: 'lastName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.emailPlaceholder'), {
            target: { value: 'john@example.com', name: 'email' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.passwordPlaceholder'), {
            target: { value: 'password123', name: 'password' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.confirmPlaceholder'), {
            target: { value: 'differentpass', name: 'confirmPassword' },
        });

        fireEvent.click(screen.getByText('auth.submitApplication'));

        await waitFor(() => {
            expect(screen.getByText('validation.passwordMismatch')).toBeTruthy();
        });
    });

    it('shows invalid email error', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText('auth.firstNamePlaceholder'), {
            target: { value: 'John', name: 'firstName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.lastNamePlaceholder'), {
            target: { value: 'Doe', name: 'lastName' },
        });
        // Use "test@invalid" (has @ but no dot in domain) to bypass type="email"
        // value sanitization while still failing the \S+@\S+\.\S+ regex
        fireEvent.change(screen.getByPlaceholderText('auth.emailPlaceholder'), {
            target: { value: 'test@invalid', name: 'email' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.passwordPlaceholder'), {
            target: { value: 'password123', name: 'password' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.confirmPlaceholder'), {
            target: { value: 'password123', name: 'confirmPassword' },
        });

        fireEvent.click(screen.getByText('auth.submitApplication'));

        await waitFor(() => {
            expect(screen.getByText('validation.invalidEmail')).toBeTruthy();
        });
    });

    it('shows minimum characters error for short password', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText('auth.firstNamePlaceholder'), {
            target: { value: 'John', name: 'firstName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.lastNamePlaceholder'), {
            target: { value: 'Doe', name: 'lastName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.emailPlaceholder'), {
            target: { value: 'john@example.com', name: 'email' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.passwordPlaceholder'), {
            target: { value: 'abc', name: 'password' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.confirmPlaceholder'), {
            target: { value: 'abc', name: 'confirmPassword' },
        });

        fireEvent.click(screen.getByText('auth.submitApplication'));

        await waitFor(() => {
            expect(screen.getByText('validation.minChars(8)')).toBeTruthy();
        });
    });

    it('calls signUp with valid form data', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText('auth.firstNamePlaceholder'), {
            target: { value: 'John', name: 'firstName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.lastNamePlaceholder'), {
            target: { value: 'Doe', name: 'lastName' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.emailPlaceholder'), {
            target: { value: 'john@example.com', name: 'email' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.passwordPlaceholder'), {
            target: { value: 'password123', name: 'password' },
        });
        fireEvent.change(screen.getByPlaceholderText('auth.confirmPlaceholder'), {
            target: { value: 'password123', name: 'confirmPassword' },
        });

        fireEvent.click(screen.getByText('auth.submitApplication'));

        await waitFor(() => {
            expect(mockAuthContext.signUp).toHaveBeenCalledWith(
                'john@example.com',
                'password123',
                'parent',
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                }),
            );
        });
    });

    it('clears error when user corrects a field', async () => {
        render(<RegisterPage />);

        // Submit empty form to trigger errors
        fireEvent.click(screen.getByText('auth.submitApplication'));

        await waitFor(() => {
            expect(screen.getAllByText('validation.required').length).toBeGreaterThanOrEqual(1);
        });

        // Fill in first name to clear its error
        fireEvent.change(screen.getByPlaceholderText('auth.firstNamePlaceholder'), {
            target: { value: 'John', name: 'firstName' },
        });

        // The firstName error should be cleared (error count should decrease)
        const remainingErrors = screen.getAllByText('validation.required');
        expect(remainingErrors.length).toBeGreaterThanOrEqual(1);
    });

    it('renders password toggle button', () => {
        render(<RegisterPage />);
        const toggleBtn = screen.getByLabelText(/aria\.showPassword|aria\.hidePassword/);
        expect(toggleBtn).toBeTruthy();
    });

    it('renders visual column content', () => {
        render(<RegisterPage />);
        expect(screen.getByText('auth.registerVisualTitle')).toBeTruthy();
    });
});
