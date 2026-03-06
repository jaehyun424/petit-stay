// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/booking/useBookings', () => ({
    useParentBookings: () => ({
        upcomingBooking: null,
        recentSessions: [],
        history: [
            { id: 'h1', date: 'Feb 25, 2026', time: '18:00-22:00', status: 'completed', hotel: 'Grand Hyatt Seoul', sitter: 'Kim Minjung', rating: 5, amount: 280000 },
            { id: 'h2', date: 'Feb 20, 2026', time: '19:00-23:00', status: 'completed', hotel: 'Park Hyatt Busan', sitter: 'Park Sooyeon', rating: 0, amount: 350000 },
            { id: 'h3', date: 'Feb 15, 2026', time: '17:00-21:00', status: 'completed', hotel: 'Four Seasons Seoul', sitter: 'Lee Jihye', rating: 4, amount: 240000 },
        ],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../hooks/children/useReviews', () => ({
    useReviews: () => ({
        reviews: [],
        averageRating: 0,
        isLoading: false,
        submitReview: vi.fn(),
    }),
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import History from '../History';
import * as useBookingsModule from '../../../hooks/booking/useBookings';

describe('Parent History', () => {
    it('renders booking history title', () => {
        render(<History />);
        expect(screen.getByText('parent.bookingHistory')).toBeTruthy();
    });

    it('renders completed sessions count', () => {
        render(<History />);
        expect(screen.getByText(/3.*sitter\.completedSessions/i)).toBeTruthy();
    });

    it('renders past booking entries', () => {
        render(<History />);
        expect(screen.getByText('Grand Hyatt Seoul')).toBeTruthy();
        expect(screen.getByText('Park Hyatt Busan')).toBeTruthy();
        expect(screen.getByText('Four Seasons Seoul')).toBeTruthy();
    });

    it('renders sitter names', () => {
        render(<History />);
        expect(screen.getByText(/Kim Minjung/)).toBeTruthy();
        expect(screen.getByText(/Park Sooyeon/)).toBeTruthy();
        expect(screen.getByText(/Lee Jihye/)).toBeTruthy();
    });

    it('renders booking dates', () => {
        render(<History />);
        expect(screen.getByText('Feb 25, 2026')).toBeTruthy();
        expect(screen.getByText('Feb 20, 2026')).toBeTruthy();
    });

    it('renders booking times', () => {
        render(<History />);
        expect(screen.getByText('18:00-22:00')).toBeTruthy();
        expect(screen.getByText('19:00-23:00')).toBeTruthy();
    });

    it('renders status badges', () => {
        render(<History />);
        // StatusBadge renders the status
        const badges = document.querySelectorAll('.badge');
        expect(badges.length).toBeGreaterThanOrEqual(3);
    });

    it('renders formatted amounts', () => {
        render(<History />);
        expect(screen.getByText(/280,000/)).toBeTruthy();
        expect(screen.getByText(/350,000/)).toBeTruthy();
    });

    it('shows star ratings for rated sessions', () => {
        render(<History />);
        // h1 has rating 5, h3 has rating 4
        const ratingElements = document.querySelectorAll('[aria-label*="star rating"]');
        expect(ratingElements.length).toBeGreaterThanOrEqual(2);
    });

    it('shows leave review button for unrated sessions', () => {
        render(<History />);
        // h2 has rating 0, so should show review button
        expect(screen.getByText('profile.leaveReview')).toBeTruthy();
    });
});

describe('Parent History - Empty state', () => {
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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows empty state when no history', () => {
        render(<History />);
        expect(screen.getByText('parent.noSessionHistory')).toBeTruthy();
    });

    it('shows empty state description', () => {
        render(<History />);
        expect(screen.getByText('parent.noSessionHistoryDesc')).toBeTruthy();
    });
});
