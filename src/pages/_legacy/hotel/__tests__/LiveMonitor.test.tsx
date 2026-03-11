// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../hooks/session/useSessions', () => ({
    useHotelSessions: () => ({
        sessions: [
            {
                id: 'session-1',
                room: '2301',
                elapsed: '1h 32m',
                startTime: '18:00',
                lastUpdate: '5 min ago',
                sitter: { name: 'Kim Minjung', tier: 'gold' },
                children: [{ name: 'Emma', age: 5 }],
                vitals: { mood: 'Happy', energy: 'High' },
                activities: [
                    { time: '18:05', activity: 'Started arts & crafts' },
                    { time: '18:30', activity: 'Snack time' },
                ],
            },
        ],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

import { render, screen } from '../../../test/utils';
import LiveMonitor from '../LiveMonitor';

describe('LiveMonitor', () => {
    it('renders heading', () => {
        render(<LiveMonitor />);
        expect(screen.getByText('nav.liveMonitor')).toBeTruthy();
    });

    it('renders session cards', () => {
        render(<LiveMonitor />);
        expect(screen.getByText('Kim Minjung')).toBeTruthy();
    });
});
