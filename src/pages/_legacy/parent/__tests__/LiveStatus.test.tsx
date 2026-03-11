// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ id: 'test-booking-1' }) };
});

vi.mock('../../../hooks/session/useSessions', () => ({
    useLiveStatus: () => ({
        logs: [
            { id: 'log-1', timestamp: new Date(), type: 'status', content: 'Started arts & crafts' },
            { id: 'log-2', timestamp: new Date(), type: 'meal', content: 'Snack time - apple slices' },
        ],
        sessionInfo: {
            sitterName: 'Kim Minjung',
            sitterId: 'sitter-1',
            sitterTier: 'gold',
            sitterLanguages: 'English/Korean',
            elapsedTime: '1h 32m',
        },
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/booking/useBookings', () => ({
    useParentBookings: () => ({
        upcomingBooking: null,
        recentSessions: [],
        history: [],
        isLoading: false,
    }),
}));

vi.mock('../../../components/parent/ActivityFeed', () => ({
    ActivityFeed: ({ logs }: { logs: unknown[] }) => (
        <div data-testid="activity-feed">{logs.length} logs</div>
    ),
}));

vi.mock('../../../hooks/common/useMessaging', () => ({
    useMessaging: () => ({
        messages: [],
        sendMessage: vi.fn(),
        isLoading: false,
        typingUsers: [],
        setTyping: vi.fn(),
        markAsRead: vi.fn(),
        openConversation: vi.fn(),
        activeConversationId: null,
    }),
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import LiveStatus from '../LiveStatus';

describe('LiveStatus', () => {
    it('renders page title', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.liveSession')).toBeTruthy();
    });

    it('renders subtitle', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.updatesFromPlayroom')).toBeTruthy();
    });

    it('renders sitter name', () => {
        render(<LiveStatus />);
        expect(screen.getByText('Kim Minjung')).toBeTruthy();
    });

    it('renders elapsed time', () => {
        render(<LiveStatus />);
        expect(screen.getByText('1h 32m')).toBeTruthy();
    });

    it('renders active care label', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.activeCare')).toBeTruthy();
    });

    it('renders activity timeline section', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.activityTimeline')).toBeTruthy();
    });

    it('renders activity feed with correct log count', () => {
        render(<LiveStatus />);
        expect(screen.getByTestId('activity-feed')).toBeTruthy();
        expect(screen.getByText('2 logs')).toBeTruthy();
    });

    it('renders contact sitter button', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.contactSitter')).toBeTruthy();
    });

    it('renders emergency call button', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.emergencyCall119')).toBeTruthy();
    });

    it('renders return home button', () => {
        render(<LiveStatus />);
        expect(screen.getByText('parent.returnHome')).toBeTruthy();
    });

    it('renders message sitter icon button', () => {
        render(<LiveStatus />);
        expect(screen.getByLabelText('aria.messageSitter')).toBeTruthy();
    });

    it('renders certified specialist text', () => {
        render(<LiveStatus />);
        expect(screen.getByText(/parent\.certifiedSpecialist/)).toBeTruthy();
    });

    it('opens chat panel when contact sitter is clicked', async () => {
        render(<LiveStatus />);
        fireEvent.click(screen.getByText('parent.contactSitter'));

        await waitFor(() => {
            // ChatPanel should open - check for the panel element
            const chatPanels = document.querySelectorAll('.chat-panel');
            expect(chatPanels.length).toBeGreaterThan(0);
        });
    });
});
