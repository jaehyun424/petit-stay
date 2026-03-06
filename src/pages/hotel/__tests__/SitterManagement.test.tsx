// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/sitter/useSitters', () => ({
    useHotelSitters: () => ({
        sitters: [
            {
                id: 'sitter-1',
                name: 'Kim Minjung',
                tier: 'gold',
                rating: 4.9,
                sessionsCompleted: 247,
                languages: ['Korean', 'English'],
                certifications: ['CPR', 'First Aid'],
                availability: 'Available',
                hourlyRate: 70000,
                safetyDays: 365,
            },
            {
                id: 'sitter-2',
                name: 'Park Sooyeon',
                tier: 'silver',
                rating: 4.7,
                sessionsCompleted: 89,
                languages: ['Korean', 'Japanese'],
                certifications: ['CPR'],
                availability: 'On Session',
                hourlyRate: 50000,
                safetyDays: 180,
            },
        ],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/booking/useBookings', () => ({
    useHotelBookings: () => ({
        bookings: [
            {
                id: 'booking-unassigned',
                confirmationCode: 'KCP-UNASSIGNED',
                status: 'pending',
                parent: { name: 'John Smith', phone: '+1-555-0000' },
                sitter: null,
                room: '1205',
                time: '19:00-23:00',
            },
        ],
        stats: { todayBookings: 0, activeNow: 0, completedToday: 0, todayRevenue: 0, safetyDays: 0, pendingBookings: 1 },
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import SitterManagement from '../SitterManagement';

describe('SitterManagement', () => {
    it('renders page title', () => {
        render(<SitterManagement />);
        expect(screen.getByText('sitterMgmt.title')).toBeTruthy();
    });

    it('renders sitter count subtitle', () => {
        render(<SitterManagement />);
        expect(screen.getByText('sitterMgmt.sittersRegistered(2)')).toBeTruthy();
    });

    it('renders sitter cards', () => {
        render(<SitterManagement />);
        expect(screen.getByText('Kim Minjung')).toBeTruthy();
        expect(screen.getByText('Park Sooyeon')).toBeTruthy();
    });

    it('renders add new sitter button', () => {
        render(<SitterManagement />);
        expect(screen.getByText('sitterMgmt.addNewSitter')).toBeTruthy();
    });

    it('shows sitter availability badges', () => {
        render(<SitterManagement />);
        expect(screen.getByText('Available')).toBeTruthy();
        expect(screen.getByText('On Session')).toBeTruthy();
    });

    it('shows sitter languages', () => {
        render(<SitterManagement />);
        expect(screen.getByText('Korean, English')).toBeTruthy();
        expect(screen.getByText('Korean, Japanese')).toBeTruthy();
    });

    it('shows sitter certifications', () => {
        render(<SitterManagement />);
        expect(screen.getByText('CPR, First Aid')).toBeTruthy();
    });

    it('shows view profile buttons for each sitter', () => {
        render(<SitterManagement />);
        const viewButtons = screen.getAllByText('sitterMgmt.viewProfile');
        expect(viewButtons.length).toBe(2);
    });

    it('shows assign to booking buttons', () => {
        render(<SitterManagement />);
        const assignButtons = screen.getAllByText('sitterMgmt.assignToBooking');
        expect(assignButtons.length).toBe(2);
    });

    it('disables assign button for unavailable sitters', () => {
        render(<SitterManagement />);
        const assignButtons = screen.getAllByText('sitterMgmt.assignToBooking');
        // Park Sooyeon (index 1) is "On Session" so should be disabled
        expect(assignButtons[1].closest('button')).toBeDisabled();
    });

    it('opens add new sitter modal when button clicked', async () => {
        render(<SitterManagement />);
        fireEvent.click(screen.getByText('sitterMgmt.addNewSitter'));

        await waitFor(() => {
            expect(screen.getByText('sitterMgmt.fullName')).toBeTruthy();
            expect(screen.getByText('sitterMgmt.addSitter')).toBeTruthy();
        });
    });

    it('renders form fields in add sitter modal', async () => {
        render(<SitterManagement />);
        fireEvent.click(screen.getByText('sitterMgmt.addNewSitter'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText('sitterMgmt.namePlaceholder')).toBeTruthy();
            expect(screen.getByPlaceholderText('sitterMgmt.languagesPlaceholder')).toBeTruthy();
            expect(screen.getByPlaceholderText('sitterMgmt.certificationsPlaceholder')).toBeTruthy();
            expect(screen.getByPlaceholderText('sitterMgmt.ratePlaceholder')).toBeTruthy();
        });
    });

    it('opens view profile modal when view profile clicked', async () => {
        render(<SitterManagement />);
        const viewButtons = screen.getAllByText('sitterMgmt.viewProfile');
        fireEvent.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('sitterMgmt.sitterRating')).toBeTruthy();
            expect(screen.getByText('sitterMgmt.sitterSessions')).toBeTruthy();
        });
    });

    it('renders aria labels on sitter cards', () => {
        render(<SitterManagement />);
        expect(screen.getByLabelText('Sitter: Kim Minjung')).toBeTruthy();
        expect(screen.getByLabelText('Sitter: Park Sooyeon')).toBeTruthy();
    });
});
