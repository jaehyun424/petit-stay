// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/useBookings', () => ({
    useHotelBookings: () => ({
        bookings: [
            {
                id: 'booking-1',
                confirmationCode: 'KCP-ABC123',
                status: 'confirmed',
                date: '2026-03-01',
                time: '18:00-22:00',
                room: '2301',
                totalAmount: 280000,
                parent: { name: 'Sarah Johnson', phone: '+82-10-1234-5678' },
                children: [{ name: 'Emma', age: 5 }],
                sitter: { name: 'Kim Minjung', tier: 'gold' },
            },
            {
                id: 'booking-2',
                confirmationCode: 'KCP-DEF456',
                status: 'pending',
                date: '2026-03-02',
                time: '19:00-23:00',
                room: '1205',
                totalAmount: 350000,
                parent: { name: 'John Smith', phone: '+1-555-000-0000' },
                children: [{ name: 'Liam', age: 3 }, { name: 'Noah', age: 6 }],
                sitter: null,
            },
        ],
        stats: { todayBookings: 5, activeNow: 2, completedToday: 3, todayRevenue: 1500000, safetyDays: 127, pendingBookings: 2 },
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/useSitters', () => ({
    useHotelSitters: () => ({
        sitters: [],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

import { render, screen } from '../../../test/utils';
import Bookings from '../Bookings';

describe('Bookings', () => {
    it('renders page title', () => {
        render(<Bookings />);
        expect(screen.getByText('nav.bookings')).toBeTruthy();
    });

    it('renders search input', () => {
        render(<Bookings />);
        expect(screen.getByPlaceholderText('hotel.searchByCodeNameRoom')).toBeTruthy();
    });

    it('renders booking items', () => {
        render(<Bookings />);
        expect(screen.getAllByText('KCP-ABC123').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('KCP-DEF456').length).toBeGreaterThanOrEqual(1);
    });
});
