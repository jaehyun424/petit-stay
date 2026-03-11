// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ bookingId: 'booking-upcoming' }) };
});

import { render, screen } from '../../../test/utils';
import QRDisplay from '../QRDisplay';
import * as useBookingsModule from '../../../hooks/booking/useBookings';

describe('QRDisplay - No booking', () => {
    beforeEach(() => {
        vi.spyOn(useBookingsModule, 'useParentBookings').mockReturnValue({
            upcomingBooking: null,
            recentSessions: [],
            history: [],
            isLoading: false,
            error: null,
            retry: vi.fn(),
        } as any);
    });

    it('renders empty state when no booking found', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.noActiveBooking')).toBeTruthy();
    });

    it('renders no booking description', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.noBooking')).toBeTruthy();
    });

    it('renders go back button', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.goBack')).toBeTruthy();
    });
});

describe('QRDisplay - With booking', () => {
    beforeEach(() => {
        vi.spyOn(useBookingsModule, 'useParentBookings').mockReturnValue({
            upcomingBooking: {
                id: 'booking-upcoming',
                confirmationCode: 'KCP-TONIGHT-123',
                status: 'confirmed',
                time: '18:00-22:00',
                hotel: 'Grand Hyatt Seoul',
                room: '2301',
                sitter: { name: 'Kim Minjung', rating: 4.9 },
                childrenIds: ['child-1'],
            },
            recentSessions: [],
            history: [],
            isLoading: false,
            error: null,
            retry: vi.fn(),
        } as any);
    });

    it('renders QR display title', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.title')).toBeTruthy();
    });

    it('renders show to hotel instruction', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.showToHotel')).toBeTruthy();
    });

    it('renders booking confirmation code', () => {
        render(<QRDisplay />);
        const codes = screen.getAllByText('KCP-TONIGHT-123');
        expect(codes.length).toBeGreaterThanOrEqual(1);
    });

    it('renders hotel name', () => {
        render(<QRDisplay />);
        expect(screen.getByText('Grand Hyatt Seoul')).toBeTruthy();
    });

    it('renders room number', () => {
        render(<QRDisplay />);
        expect(screen.getByText('2301')).toBeTruthy();
    });

    it('renders time slot', () => {
        render(<QRDisplay />);
        expect(screen.getByText('18:00-22:00')).toBeTruthy();
    });

    it('renders booking detail labels', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.bookingLabel')).toBeTruthy();
        expect(screen.getByText('qr.hotelLabel')).toBeTruthy();
        expect(screen.getByText('qr.roomLabel')).toBeTruthy();
        expect(screen.getByText('qr.timeLabel')).toBeTruthy();
    });

    it('renders go back button', () => {
        render(<QRDisplay />);
        expect(screen.getByText('qr.goBack')).toBeTruthy();
    });
});
