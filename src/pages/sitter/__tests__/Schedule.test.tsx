// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/useSitters', () => ({
    useSitterStats: () => ({
        stats: {
            totalSessions: 247,
            avgRating: 4.9,
            tier: 'gold',
            safetyDays: 365,
        },
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/useBookings', () => ({
    useSitterBookings: () => ({
        todaySessions: [
            {
                id: 'ts-1',
                time: '18:00-22:00',
                status: 'confirmed',
                hotel: 'Grand Hyatt Seoul',
                room: '2301',
                children: ['Emma (5)', 'Liam (3)'],
            },
            {
                id: 'ts-2',
                time: '14:00-17:00',
                status: 'pending',
                hotel: 'Park Hyatt Busan',
                room: '1105',
                children: ['Sota (4)'],
            },
        ],
        weekSchedule: [
            { date: 'Mon', sessions: 2 },
            { date: 'Tue', sessions: 1 },
            { date: 'Wed', sessions: 0 },
            { date: 'Thu', sessions: 3 },
            { date: 'Fri', sessions: 2 },
            { date: 'Sat', sessions: 4 },
            { date: 'Sun', sessions: 1 },
        ],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

import { render, screen } from '../../../test/utils';
import Schedule from '../Schedule';

describe('Sitter Schedule', () => {
    it('renders today schedule heading', () => {
        render(<Schedule />);
        expect(screen.getByText('sitter.todaySchedule')).toBeTruthy();
    });

    it('renders this week heading', () => {
        render(<Schedule />);
        expect(screen.getByText('sitter.thisWeek')).toBeTruthy();
    });

    it('renders today session list', () => {
        render(<Schedule />);
        expect(screen.getByText(/Grand Hyatt Seoul/)).toBeTruthy();
        expect(screen.getByText(/Park Hyatt Busan/)).toBeTruthy();
    });

    it('renders session times', () => {
        render(<Schedule />);
        expect(screen.getByText('18:00-22:00')).toBeTruthy();
        expect(screen.getByText('14:00-17:00')).toBeTruthy();
    });

    it('renders room numbers', () => {
        render(<Schedule />);
        expect(screen.getByText(/2301/)).toBeTruthy();
        expect(screen.getByText(/1105/)).toBeTruthy();
    });

    it('renders children names', () => {
        render(<Schedule />);
        expect(screen.getByText(/Emma \(5\), Liam \(3\)/)).toBeTruthy();
        expect(screen.getByText(/Sota \(4\)/)).toBeTruthy();
    });

    it('renders start session button for confirmed sessions', () => {
        render(<Schedule />);
        expect(screen.getByText('sitter.startSession')).toBeTruthy();
    });

    it('renders pending button for pending sessions', () => {
        render(<Schedule />);
        const allPending = screen.getAllByText('status.pending');
        const pendingBtn = allPending.find((el) => el.closest('button'));
        expect(pendingBtn).toBeTruthy();
    });

    it('pending session button is disabled', () => {
        render(<Schedule />);
        const allPending = screen.getAllByText('status.pending');
        const pendingBtn = allPending.find((el) => el.closest('button'))?.closest('button');
        expect(pendingBtn).toBeDisabled();
    });

    it('renders stats - total sessions', () => {
        render(<Schedule />);
        expect(screen.getByText('247')).toBeTruthy();
        expect(screen.getByText('hotel.sessions')).toBeTruthy();
    });

    it('renders stats - average rating', () => {
        render(<Schedule />);
        expect(screen.getByText('4.9')).toBeTruthy();
        expect(screen.getByText('common.rating')).toBeTruthy();
    });

    it('renders weekly schedule grid', () => {
        render(<Schedule />);
        expect(screen.getByRole('group', { name: 'Weekly schedule overview' })).toBeTruthy();
    });

    it('renders all week days', () => {
        render(<Schedule />);
        expect(screen.getByText('Mon')).toBeTruthy();
        expect(screen.getByText('Tue')).toBeTruthy();
        expect(screen.getByText('Wed')).toBeTruthy();
        expect(screen.getByText('Thu')).toBeTruthy();
        expect(screen.getByText('Fri')).toBeTruthy();
        expect(screen.getByText('Sat')).toBeTruthy();
        expect(screen.getByText('Sun')).toBeTruthy();
    });

    it('shows dash for days with no sessions', () => {
        render(<Schedule />);
        // Wed has 0 sessions, should show '-'
        const wedItem = screen.getByLabelText('Wed: no sessions');
        expect(wedItem).toBeTruthy();
    });

    it('shows session count for days with sessions', () => {
        render(<Schedule />);
        const satItem = screen.getByLabelText('Sat: 4 sessions');
        expect(satItem).toBeTruthy();
    });
});
