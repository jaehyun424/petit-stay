// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

const mockUpdateHotel = vi.fn(() => Promise.resolve());

vi.mock('../../../hooks/hotel/useHotel', () => ({
    useHotel: () => ({
        hotel: {
            id: 'hotel-grand-hyatt',
            name: 'Grand Hyatt Seoul',
            contactEmail: 'concierge@grandhyatt.com',
            contactPhone: '+82-2-797-1234',
            address: '322 Sowol-ro, Yongsan-gu, Seoul',
            commission: 15,
            currency: 'KRW',
            settings: {
                autoAssign: true,
                requireGoldForInfant: true,
                maxAdvanceBookingDays: 30,
                minBookingHours: 2,
                cancellationPolicy: 'moderate',
            },
            stats: { safetyDays: 127, totalBookings: 1247, averageRating: 4.8, thisMonthBookings: 89, thisMonthRevenue: 42500000 },
        },
        isLoading: false,
        updateHotel: mockUpdateHotel,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../contexts/ThemeContext', () => ({
    useTheme: () => ({ theme: 'dark', isDark: true, toggleTheme: vi.fn(), setTheme: vi.fn() }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import Settings from '../Settings';

describe('Settings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders page title', () => {
        render(<Settings />);
        expect(screen.getByText('hotel.hotelSettings')).toBeTruthy();
    });

    it('renders page subtitle', () => {
        render(<Settings />);
        expect(screen.getByText('hotel.hotelSettingsSubtitle')).toBeTruthy();
    });

    it('renders save button', () => {
        render(<Settings />);
        expect(screen.getByText('settings.saveChanges')).toBeTruthy();
    });

    it('renders cancel button', () => {
        render(<Settings />);
        expect(screen.getByText('common.cancel')).toBeTruthy();
    });

    it('renders hotel profile form fields with populated values', () => {
        render(<Settings />);
        expect(screen.getByDisplayValue('Grand Hyatt Seoul')).toBeTruthy();
        expect(screen.getByDisplayValue('concierge@grandhyatt.com')).toBeTruthy();
        expect(screen.getByDisplayValue('+82-2-797-1234')).toBeTruthy();
    });

    it('renders hotel profile section title', () => {
        render(<Settings />);
        expect(screen.getByText('hotel.hotelProfile')).toBeTruthy();
    });

    it('renders service settings section', () => {
        render(<Settings />);
        expect(screen.getByText('hotel.serviceSettings')).toBeTruthy();
    });

    it('renders pricing section', () => {
        render(<Settings />);
        expect(screen.getByText('hotel.pricingSettings')).toBeTruthy();
    });

    it('renders notification settings section', () => {
        render(<Settings />);
        expect(screen.getByText('hotel.notificationSettings')).toBeTruthy();
    });

    it('renders theme toggle', () => {
        render(<Settings />);
        expect(screen.getByText('common.theme')).toBeTruthy();
    });

    it('shows validation error when name is cleared and save clicked', async () => {
        render(<Settings />);

        const nameInput = screen.getByDisplayValue('Grand Hyatt Seoul');
        fireEvent.change(nameInput, { target: { value: '' } });

        fireEvent.click(screen.getByText('settings.saveChanges'));

        await waitFor(() => {
            expect(screen.getByText('settings.nameRequired')).toBeTruthy();
        });
    });

    it('shows validation error for invalid email', async () => {
        render(<Settings />);

        const emailInput = screen.getByDisplayValue('concierge@grandhyatt.com');
        fireEvent.change(emailInput, { target: { value: 'invalidemail' } });

        fireEvent.click(screen.getByText('settings.saveChanges'));

        await waitFor(() => {
            expect(screen.getByText('settings.emailRequired')).toBeTruthy();
        });
    });

    it('shows validation error when phone is cleared', async () => {
        render(<Settings />);

        const phoneInput = screen.getByDisplayValue('+82-2-797-1234');
        fireEvent.change(phoneInput, { target: { value: '' } });

        fireEvent.click(screen.getByText('settings.saveChanges'));

        await waitFor(() => {
            expect(screen.getByText('settings.phoneRequired')).toBeTruthy();
        });
    });

    it('calls updateHotel on valid save', async () => {
        render(<Settings />);

        fireEvent.click(screen.getByText('settings.saveChanges'));

        await waitFor(() => {
            expect(mockUpdateHotel).toHaveBeenCalled();
        });
    });

    it('renders form as accessible form element', () => {
        render(<Settings />);
        expect(screen.getByRole('form', { name: 'Hotel settings' })).toBeTruthy();
    });

    it('renders auto-assign checkbox', () => {
        render(<Settings />);
        expect(screen.getByText('settings.autoAssign')).toBeTruthy();
    });

    it('renders require gold tier checkbox', () => {
        render(<Settings />);
        expect(screen.getByText('settings.requireGoldTier')).toBeTruthy();
    });

    it('renders cancellation policy select', () => {
        render(<Settings />);
        expect(screen.getByText('Cancellation Policy')).toBeTruthy();
    });
});
