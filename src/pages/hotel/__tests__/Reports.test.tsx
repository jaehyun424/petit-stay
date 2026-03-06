// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/booking/useBookings', () => ({
    useHotelBookings: () => ({
        bookings: [
            { id: 'b1', status: 'completed', confirmationCode: 'KCP-001' },
            { id: 'b2', status: 'pending', confirmationCode: 'KCP-002' },
        ],
        stats: { todayBookings: 12, activeNow: 3, completedToday: 8, todayRevenue: 4200000, safetyDays: 127, pendingBookings: 4 },
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/session/useSessions', () => ({
    useHotelSessions: () => ({
        sessions: [],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/sitter/useSitters', () => ({
    useHotelSitters: () => ({
        sitters: [
            { id: 's1', name: 'Kim Minjung', tier: 'gold', rating: 4.9, sessionsCompleted: 247, safetyDays: 365 },
        ],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

import { render, screen } from '../../../test/utils';
import Reports from '../Reports';

describe('Reports', () => {
    it('renders title', () => {
        render(<Reports />);
        expect(screen.getByText('reports.title')).toBeTruthy();
    });

    it('renders stat cards', () => {
        render(<Reports />);
        expect(screen.getByText('reports.totalBookings')).toBeTruthy();
        expect(screen.getByText('reports.activeSessions')).toBeTruthy();
        expect(screen.getByText('reports.completionRate')).toBeTruthy();
    });
});
