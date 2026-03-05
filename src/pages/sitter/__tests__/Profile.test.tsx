// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/useSitters', () => ({
    useSitterProfile: () => ({
        profile: {
            name: 'Kim Minjung',
            tier: 'gold',
            rating: 4.9,
            reviewCount: 247,
            totalSessions: 247,
            safetyDays: 365,
            onTimeRate: '98%',
            certifications: ['CPR Certified', 'First Aid', 'Child Psychology'],
            languages: [
                { flag: '\u{1F1F0}\u{1F1F7}', name: 'Korean', level: 'Native' },
                { flag: '\u{1F1FA}\u{1F1F8}', name: 'English', level: 'Advanced' },
            ],
        },
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/useReviews', () => ({
    useReviews: () => ({
        reviews: [
            { id: 'r1', rating: 5, comment: 'Excellent care for our children', createdAt: new Date('2026-02-20'), parentName: 'Sarah Johnson' },
            { id: 'r2', rating: 4, comment: 'Very professional', createdAt: new Date('2026-02-15'), parentName: 'Michael Chen' },
        ],
        averageRating: 4.5,
        isLoading: false,
    }),
}));

vi.mock('../../../contexts/ThemeContext', () => ({
    useTheme: () => ({ theme: 'light', isDark: false, toggleTheme: vi.fn(), setTheme: vi.fn() }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../data/demo', () => ({
    DEMO_SITTER_AVAILABILITY: {
        monday: [{ start: '09:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '18:00' }],
        wednesday: [{ start: '09:00', end: '18:00' }],
        thursday: [{ start: '09:00', end: '18:00' }],
        friday: [{ start: '09:00', end: '22:00' }],
        saturday: [{ start: '10:00', end: '22:00' }],
        sunday: [{ start: '10:00', end: '18:00' }],
        nightShift: true,
        holidayAvailable: true,
    },
    DEMO_SITTER_DOCUMENTS: [],
}));

vi.mock('../../../components/common/ReviewForm', () => ({
    StarRating: ({ rating }: { rating: number }) => <span data-testid="star-rating">{rating}</span>,
}));

vi.mock('../../../components/sitter/WeeklyScheduleGrid', () => ({
    WeeklyScheduleGrid: () => <div data-testid="weekly-schedule" />,
}));

vi.mock('../../../components/sitter/DocumentUploader', () => ({
    DocumentUploader: () => <div data-testid="doc-uploader" />,
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import Profile from '../Profile';

describe('Sitter Profile', () => {
    it('renders profile header with name', () => {
        render(<Profile />);
        expect(screen.getByText('Kim Minjung')).toBeTruthy();
    });

    it('renders profile rating and review count', () => {
        render(<Profile />);
        expect(screen.getByText(/4\.9/)).toBeTruthy();
        expect(screen.getByText(/247 sitterProfile\.reviewsCount/)).toBeTruthy();
    });

    it('renders profile stats - total sessions', () => {
        render(<Profile />);
        expect(screen.getByText('247')).toBeTruthy();
        expect(screen.getByText('sitterProfile.sessions')).toBeTruthy();
    });

    it('renders profile stats - safety days', () => {
        render(<Profile />);
        expect(screen.getByText('365')).toBeTruthy();
        expect(screen.getByText('sitterProfile.safeDays')).toBeTruthy();
    });

    it('renders profile stats - on-time rate', () => {
        render(<Profile />);
        expect(screen.getByText('98%')).toBeTruthy();
        expect(screen.getByText('sitterProfile.onTime')).toBeTruthy();
    });

    it('renders certifications section', () => {
        render(<Profile />);
        expect(screen.getByText('sitterProfile.certifications')).toBeTruthy();
    });

    it('renders all certifications', () => {
        render(<Profile />);
        expect(screen.getByText(/CPR Certified/)).toBeTruthy();
        expect(screen.getByText(/First Aid/)).toBeTruthy();
        expect(screen.getByText(/Child Psychology/)).toBeTruthy();
    });

    it('renders reviews section', () => {
        render(<Profile />);
        expect(screen.getByText('sitterProfile.reviews')).toBeTruthy();
    });

    it('renders review comments', () => {
        render(<Profile />);
        expect(screen.getByText('Excellent care for our children')).toBeTruthy();
        expect(screen.getByText('Very professional')).toBeTruthy();
    });

    it('renders review authors', () => {
        render(<Profile />);
        expect(screen.getByText('Sarah Johnson')).toBeTruthy();
        expect(screen.getByText('Michael Chen')).toBeTruthy();
    });

    it('renders reviews count text', () => {
        render(<Profile />);
        expect(screen.getByText('sitterProfile.reviewCount(2)')).toBeTruthy();
    });

    it('renders languages section', () => {
        render(<Profile />);
        expect(screen.getByText('sitterProfile.languages')).toBeTruthy();
    });

    it('renders language details', () => {
        render(<Profile />);
        // Language name and level may be in separate elements
        expect(screen.getByText(/Korean/)).toBeTruthy();
        expect(screen.getByText(/Native/)).toBeTruthy();
        expect(screen.getByText(/English/)).toBeTruthy();
        expect(screen.getByText(/Advanced/)).toBeTruthy();
    });

    it('renders identity verification section', () => {
        render(<Profile />);
        expect(screen.getByText('profile.identityVerification')).toBeTruthy();
    });

    it('renders verification items', () => {
        render(<Profile />);
        expect(screen.getByText('profile.hotelPartnerVerified')).toBeTruthy();
        expect(screen.getByText('profile.govIdChecked')).toBeTruthy();
        expect(screen.getByText('profile.backgroundClear')).toBeTruthy();
    });

    it('renders settings menu', () => {
        render(<Profile />);
        expect(screen.getByRole('navigation', { name: 'profile.settings' })).toBeTruthy();
    });

    it('renders theme toggle in settings', () => {
        render(<Profile />);
        expect(screen.getByText('common.theme')).toBeTruthy();
    });

    it('renders availability setting', () => {
        render(<Profile />);
        expect(screen.getByText('profile.availability')).toBeTruthy();
    });

    it('renders bank account setting', () => {
        render(<Profile />);
        expect(screen.getByText('profile.bankAccount')).toBeTruthy();
    });

    it('renders documents setting', () => {
        render(<Profile />);
        expect(screen.getByText('profile.documents')).toBeTruthy();
    });

    it('renders help setting', () => {
        render(<Profile />);
        expect(screen.getByText('profile.helpLabel')).toBeTruthy();
    });

    it('renders sign out button', () => {
        render(<Profile />);
        expect(screen.getByText('profile.signOut')).toBeTruthy();
    });

    it('renders edit profile button', () => {
        render(<Profile />);
        expect(screen.getByText(/sitterProfile\.editProfile/)).toBeTruthy();
    });

    it('opens edit profile modal when edit clicked', async () => {
        render(<Profile />);
        const editButtons = screen.getAllByText(/sitterProfile\.editProfile/);
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Kim Minjung')).toBeTruthy();
        });
    });
});
