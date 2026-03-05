// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../hooks/useSitters', () => ({
    useSitterStats: () => ({
        stats: {
            totalSessions: 14,
            avgRating: 4.9,
            tier: 'gold',
            safetyDays: 365,
        },
        isLoading: false,
    }),
}));

import { render, screen, fireEvent } from '../../../test/utils';
import Earnings from '../Earnings';

// Mock requestAnimationFrame for local AnimatedCounter in Earnings
beforeEach(() => {
    // performance.now() returns 0 so that elapsed = now - start = 1000 - 0 = 1000
    // which exceeds duration (800ms), completing animation in one frame
    vi.spyOn(performance, 'now').mockReturnValue(0);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(1000);
        return 0;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Sitter Earnings', () => {
    it('renders earnings page title', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.title')).toBeTruthy();
    });

    it('renders this month summary label', () => {
        render(<Earnings />);
        expect(screen.getAllByText('earnings.thisMonth').length).toBeGreaterThanOrEqual(1);
    });

    it('renders this month amount', () => {
        render(<Earnings />);
        // AnimatedCounter renders formatted currency; value is 3,420,000
        expect(screen.getAllByText(/3,420,000/).length).toBeGreaterThanOrEqual(1);
    });

    it('renders pending earnings stat', () => {
        render(<Earnings />);
        expect(screen.getAllByText('earnings.pending').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/540,000/).length).toBeGreaterThanOrEqual(1);
    });

    it('renders last month earnings stat', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.lastMonth')).toBeTruthy();
        expect(screen.getByText(/2,880,000/)).toBeTruthy();
    });

    it('renders sessions completed count', () => {
        render(<Earnings />);
        expect(screen.getByText(/earnings\.sessionsCompleted/)).toBeTruthy();
    });

    it('renders growth percentage vs last month', () => {
        render(<Earnings />);
        expect(screen.getByText(/earnings\.vsLastMonth/)).toBeTruthy();
    });

    it('renders monthly earnings chart section', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.monthlyEarnings')).toBeTruthy();
    });

    it('renders monthly chart with bar chart role', () => {
        render(<Earnings />);
        expect(screen.getByRole('img', { name: 'Monthly earnings bar chart' })).toBeTruthy();
    });

    it('renders chart month labels', () => {
        render(<Earnings />);
        // Default period is 'this_month' which shows last 1 bar
        const chartBars = document.querySelectorAll('.chart-bar-wrapper');
        expect(chartBars.length).toBe(1);
    });

    it('renders earnings by hotel section', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.earningsByHotel')).toBeTruthy();
    });

    it('renders hotel breakdown entries', () => {
        render(<Earnings />);
        expect(screen.getAllByText('Four Seasons Seoul').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('The Shilla Seoul').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Signiel Seoul').length).toBeGreaterThanOrEqual(1);
    });

    it('renders hotel breakdown percentages', () => {
        render(<Earnings />);
        expect(screen.getAllByText('32%').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('19%').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('15%').length).toBeGreaterThanOrEqual(1);
    });

    it('renders recent payments section', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.recentPayments')).toBeTruthy();
    });

    it('renders payment history entries', () => {
        render(<Earnings />);
        // Default 'this_month' filter shows 2 payments: Four Seasons + The Shilla
        // Four Seasons appears in both hotel breakdown and recent payments
        const hotelTexts = screen.getAllByText('Four Seasons Seoul');
        expect(hotelTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('renders payment status badges', () => {
        render(<Earnings />);
        const paidBadges = screen.getAllByText('earnings.paid');
        expect(paidBadges.length).toBeGreaterThanOrEqual(1);
        const pendingBadges = screen.getAllByText('earnings.pending');
        expect(pendingBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('renders period filter tabs', () => {
        render(<Earnings />);
        expect(screen.getByRole('tablist', { name: 'Earnings period filter' })).toBeTruthy();
    });

    it('renders all period filter options', () => {
        render(<Earnings />);
        expect(screen.getAllByText('earnings.thisMonth').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('earnings.last3Months')).toBeTruthy();
        expect(screen.getByText('earnings.allTime')).toBeTruthy();
    });

    it('this month filter is selected by default', () => {
        render(<Earnings />);
        const thisMonthTabs = screen.getAllByRole('tab', { selected: true });
        expect(thisMonthTabs.length).toBeGreaterThanOrEqual(1);
    });

    it('can switch period filter', () => {
        render(<Earnings />);
        fireEvent.click(screen.getByText('earnings.last3Months'));
        const selectedTabs = screen.getAllByRole('tab', { selected: true });
        expect(selectedTabs.length).toBeGreaterThanOrEqual(1);
    });
});
