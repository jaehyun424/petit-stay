// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/ops/useIncidents', () => ({
    useHotelIncidents: () => ({
        incidents: [
            {
                id: 'inc-1',
                severity: 'low',
                category: 'safety_concern',
                summary: 'Minor bump during play',
                status: 'resolved',
                reportedAt: new Date('2026-02-20'),
                sitterName: 'Kim Minjung',
                childName: 'Emma',
            },
        ],
        isLoading: false,
        createIncident: vi.fn(),
        updateIncidentStatus: vi.fn(),
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/booking/useBookings', () => ({
    useHotelBookings: () => ({
        bookings: [],
        stats: { todayBookings: 5, activeNow: 2, completedToday: 3, todayRevenue: 1500000, safetyDays: 127, pendingBookings: 1 },
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/hotel/useHotel', () => ({
    useHotel: () => ({
        hotel: {
            id: 'hotel-grand-hyatt',
            name: 'Grand Hyatt Seoul',
            stats: { safetyDays: 127, totalBookings: 1247, averageRating: 4.8, thisMonthBookings: 89, thisMonthRevenue: 42500000 },
            settings: { autoAssign: true, requireGoldForInfant: true, maxAdvanceBookingDays: 30, minBookingHours: 2, cancellationPolicy: 'moderate' },
        },
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/ops/useAuditLog', () => ({
    useAllAuditLogs: () => ({
        entries: [],
        isLoading: false,
        error: null,
    }),
}));

import { render, screen } from '../../../test/utils';
import SafetyDashboard from '../SafetyDashboard';

describe('SafetyDashboard', () => {
    it('renders safety title', () => {
        render(<SafetyDashboard />);
        expect(screen.getByText('safety.title')).toBeTruthy();
    });

    it('shows days counter', () => {
        render(<SafetyDashboard />);
        expect(screen.getByText('127')).toBeTruthy();
    });

    it('shows report button', () => {
        render(<SafetyDashboard />);
        expect(screen.getByText('safety.reportIncident')).toBeTruthy();
    });
});
