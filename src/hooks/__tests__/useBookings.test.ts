import { renderHook, waitFor } from '@testing-library/react';
import { useHotelBookings, useParentBookings, useSitterBookings } from '../booking/useBookings';

// In test mode, DEMO_MODE is true (from setup.ts)

describe('useHotelBookings', () => {
    it('loads demo bookings', async () => {
        const { result } = renderHook(() => useHotelBookings('hotel-1'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.bookings.length).toBeGreaterThan(0);
        expect(result.current.stats.todayBookings).toBeGreaterThan(0);
    });

    it('has expected booking fields', async () => {
        const { result } = renderHook(() => useHotelBookings('hotel-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const booking = result.current.bookings[0];
        expect(booking).toHaveProperty('id');
        expect(booking).toHaveProperty('confirmationCode');
        expect(booking).toHaveProperty('parent');
        expect(booking).toHaveProperty('status');
    });
});

describe('useParentBookings', () => {
    it('loads demo parent data', async () => {
        const { result } = renderHook(() => useParentBookings('parent-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.upcomingBooking).toBeTruthy();
        expect(result.current.history.length).toBeGreaterThan(0);
        expect(result.current.recentSessions.length).toBeGreaterThan(0);
    });

    it('returns null upcoming when no parent', async () => {
        const { result } = renderHook(() => useParentBookings(undefined));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });
});

describe('useSitterBookings', () => {
    it('loads demo sitter sessions', async () => {
        const { result } = renderHook(() => useSitterBookings('sitter-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.todaySessions.length).toBeGreaterThan(0);
        expect(result.current.weekSchedule.length).toBe(7);
    });
});
