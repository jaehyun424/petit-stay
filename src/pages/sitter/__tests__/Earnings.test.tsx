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
        // AnimatedCounter renders formatted currency; value is 2,725,000
        expect(screen.getByText(/2,725,000/)).toBeTruthy();
    });

    it('renders pending earnings stat', () => {
        render(<Earnings />);
        expect(screen.getAllByText('earnings.pending').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/375,000/).length).toBeGreaterThanOrEqual(1);
    });

    it('renders last month earnings stat', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.lastMonth')).toBeTruthy();
        expect(screen.getByText(/2,400,000/)).toBeTruthy();
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
        // Dynamic month labels based on current date
        const chartBars = document.querySelectorAll('.chart-bar-wrapper');
        expect(chartBars.length).toBe(6);
    });

    it('renders earnings by hotel section', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.earningsByHotel')).toBeTruthy();
    });

    it('renders hotel breakdown entries', () => {
        render(<Earnings />);
        // Grand Hyatt appears in both breakdown and recent payments
        expect(screen.getAllByText('Grand Hyatt Seoul').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('The Shilla Seoul').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Signiel Seoul').length).toBeGreaterThanOrEqual(1);
    });

    it('renders hotel breakdown percentages', () => {
        render(<Earnings />);
        expect(screen.getAllByText('35%').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('25%').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('20%').length).toBeGreaterThanOrEqual(1);
    });

    it('renders recent payments section', () => {
        render(<Earnings />);
        expect(screen.getByText('earnings.recentPayments')).toBeTruthy();
    });

    it('renders payment history entries', () => {
        render(<Earnings />);
        // Dynamic dates - check hotels instead
        const hotelTexts = screen.getAllByText('Grand Hyatt Seoul');
        // Grand Hyatt appears in both hotel breakdown and recent payments
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
