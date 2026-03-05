// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/useChildren', () => ({
    useChildren: () => ({
        children: [
            { id: 'child-1', name: 'Emma', age: 5, gender: 'female', allergies: ['peanuts'] },
            { id: 'child-2', name: 'Liam', age: 3, gender: 'male', allergies: [] },
        ],
        isLoading: false,
        addChild: vi.fn(),
        updateChild: vi.fn(),
        removeChild: vi.fn(),
    }),
}));

vi.mock('../../../contexts/ThemeContext', () => ({
    useTheme: () => ({ theme: 'light', isDark: false, toggleTheme: vi.fn(), setTheme: vi.fn() }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../data/demo', () => ({
    DEMO_PAYMENT_METHODS: [
        { id: 'pm1', brand: 'visa', last4: '4242', expiryMonth: 12, expiryYear: 2027, holderName: 'Sarah Johnson', isDefault: true },
    ],
}));

vi.mock('../../../components/common/PaymentMethodCard', () => ({
    PaymentMethodCardDisplay: ({ card }: { card: { last4: string } }) => <div>Card ending {card.last4}</div>,
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import Profile from '../Profile';

describe('Parent Profile', () => {
    it('renders user first name', () => {
        render(<Profile />);
        expect(screen.getByText(/Sarah/)).toBeTruthy();
    });

    it('renders user last name', () => {
        render(<Profile />);
        expect(screen.getByText(/Johnson/)).toBeTruthy();
    });

    it('renders user email', () => {
        render(<Profile />);
        expect(screen.getByText('parent@demo.com')).toBeTruthy();
    });

    it('renders my children section title', () => {
        render(<Profile />);
        expect(screen.getByText('parent.myChildren')).toBeTruthy();
    });

    it('renders children list', () => {
        render(<Profile />);
        expect(screen.getByText('Emma')).toBeTruthy();
        expect(screen.getByText('Liam')).toBeTruthy();
    });

    it('displays child allergies', () => {
        render(<Profile />);
        expect(screen.getByText(/peanuts/)).toBeTruthy();
    });

    it('renders edit buttons for children', () => {
        render(<Profile />);
        const editButtons = screen.getAllByText('common.edit');
        expect(editButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders remove buttons for children', () => {
        render(<Profile />);
        const removeButtons = screen.getAllByText('common.remove');
        expect(removeButtons.length).toBe(2);
    });

    it('renders add child button', () => {
        render(<Profile />);
        expect(screen.getByText(/parent\.addChild/)).toBeTruthy();
    });

    it('renders settings menu', () => {
        render(<Profile />);
        expect(screen.getByRole('navigation', { name: 'Settings' })).toBeTruthy();
    });

    it('renders notifications menu item', () => {
        render(<Profile />);
        expect(screen.getByText('parent.notifications')).toBeTruthy();
    });

    it('renders language preference menu item', () => {
        render(<Profile />);
        expect(screen.getByText('auth.preferredLanguage')).toBeTruthy();
    });

    it('renders theme menu item', () => {
        render(<Profile />);
        expect(screen.getByText('common.theme')).toBeTruthy();
    });

    it('renders payment methods menu item', () => {
        render(<Profile />);
        expect(screen.getByText('parent.paymentMethods')).toBeTruthy();
    });

    it('renders terms of service menu item', () => {
        render(<Profile />);
        expect(screen.getByText('parent.termsOfService')).toBeTruthy();
    });

    it('renders privacy policy menu item', () => {
        render(<Profile />);
        expect(screen.getByText('parent.privacyPolicy')).toBeTruthy();
    });

    it('renders help menu item', () => {
        render(<Profile />);
        expect(screen.getByText('parent.help')).toBeTruthy();
    });

    it('renders sign out button', () => {
        render(<Profile />);
        expect(screen.getByText('auth.signOut')).toBeTruthy();
    });

    it('opens add child modal when add child button clicked', async () => {
        render(<Profile />);
        fireEvent.click(screen.getByText(/parent\.addChild/));

        await waitFor(() => {
            expect(screen.getByText('common.name')).toBeTruthy();
            expect(screen.getByText('common.age')).toBeTruthy();
        });
    });

    it('opens edit child modal when edit button clicked', async () => {
        render(<Profile />);
        const editButtons = screen.getAllByText('common.edit');
        // Click the first edit button (for Emma)
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Emma')).toBeTruthy();
        });
    });
});
