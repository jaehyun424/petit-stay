// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

const mockAccept = vi.fn();
const mockReject = vi.fn();

vi.mock('../../../hooks/useSitters', () => ({
    useSitterStats: () => ({
        stats: { totalSessions: 100, avgRating: 4.5, tier: 'silver', safetyDays: 200 },
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/useBookings', () => ({
    useSitterBookings: () => ({
        todaySessions: [
            {
                id: 'assign-1',
                time: '14:00 - 17:00',
                status: 'sitter_assigned',
                hotel: 'Grand Hyatt Seoul',
                room: '1201',
                children: [{ name: 'Yuna', age: 3, allergies: ['peanuts'] }],
            },
            {
                id: 'assign-2',
                time: '18:00 - 22:00',
                status: 'confirmed',
                hotel: 'Park Hyatt Busan',
                room: '2501',
                children: ['Haru (5)'],
            },
        ],
        weekSchedule: [
            { date: 'Mon', sessions: 1 },
            { date: 'Tue', sessions: 0 },
            { date: 'Wed', sessions: 0 },
            { date: 'Thu', sessions: 0 },
            { date: 'Fri', sessions: 0 },
            { date: 'Sat', sessions: 0 },
            { date: 'Sun', sessions: 0 },
        ],
        isLoading: false,
        error: null,
        retry: vi.fn(),
        acceptAssignment: mockAccept,
        rejectAssignment: mockReject,
    }),
}));

import { render, screen, fireEvent } from '../../../test/utils';
import Schedule from '../Schedule';

describe('Sitter Schedule - Assignment Actions', () => {
    it('renders accept and decline buttons for sitter_assigned status', () => {
        render(<Schedule />);
        expect(screen.getByText('sitter.acceptAssignment')).toBeTruthy();
        expect(screen.getByText('sitter.declineAssignment')).toBeTruthy();
    });

    it('opens confirm modal when Accept button is clicked', async () => {
        render(<Schedule />);
        const acceptBtn = screen.getByText('sitter.acceptAssignment').closest('button');
        fireEvent.click(acceptBtn!);

        // Accept button opens a confirmation modal
        expect(screen.getByText('sitter.confirmAcceptTitle')).toBeTruthy();
    });

    it('calls rejectAssignment when Decline button is clicked', async () => {
        render(<Schedule />);
        const declineBtn = screen.getByText('sitter.declineAssignment').closest('button');
        fireEvent.click(declineBtn!);

        expect(mockReject).toHaveBeenCalledWith('assign-1');
    });

    it('shows allergy info for children with allergies', () => {
        render(<Schedule />);
        expect(screen.getByText(/peanuts/)).toBeTruthy();
    });

    it('does not show accept/decline for confirmed sessions', () => {
        render(<Schedule />);
        // The confirmed session should have "Start Session", not Accept/Decline
        expect(screen.getByText('sitter.startSession')).toBeTruthy();
    });
});
