import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import ActiveSession from '../ActiveSession';

// Mock hooks used by ActiveSession
vi.mock('../../../hooks/useSessions', () => ({
    useActiveSession: () => ({
        sessionInfo: {
            room: '1102',
            children: 'Sota (3), Yui (6)',
            parent: 'Tanaka Yuki',
            endTime: '23:00',
            elapsedTime: '1h 23m 0s',
        },
        checklist: [
            { id: '1', label: 'Pre-session: Wash hands', completed: true },
            { id: '2', label: 'Verify child identity with photo', completed: true },
            { id: '3', label: 'Review allergies & medical info', completed: false },
        ],
        toggleChecklistItem: vi.fn(),
        sessionId: 'demo-session-1',
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/useDemo', () => ({
    DEMO_MODE: true,
}));

vi.mock('../../../services/firestore', () => ({
    activityService: { logActivity: vi.fn(() => Promise.resolve()) },
    sessionService: { endSession: vi.fn(() => Promise.resolve()) },
    bookingService: { updateBookingStatus: vi.fn(() => Promise.resolve()) },
}));

vi.mock('../../../services/storage', () => ({
    storageService: { uploadActivityPhoto: vi.fn(() => Promise.resolve('url')) },
}));

describe('Sitter ActiveSession', () => {
    it('renders session active banner', () => {
        render(<ActiveSession />);
        expect(screen.getByText('activeSession.title')).toBeInTheDocument();
    });

    it('shows elapsed time', () => {
        render(<ActiveSession />);
        // Timer starts 2h15m ago, format is "${h}h ${m}m"
        expect(screen.getByText(/\d+h \d+m/)).toBeInTheDocument();
    });

    it('renders session info', () => {
        render(<ActiveSession />);
        expect(screen.getByText('1102')).toBeInTheDocument();
        expect(screen.getByText('Sota (3), Yui (6)')).toBeInTheDocument();
        expect(screen.getByText('Tanaka Yuki')).toBeInTheDocument();
        expect(screen.getByText('23:00')).toBeInTheDocument();
    });

    it('renders quick action buttons', () => {
        render(<ActiveSession />);
        expect(screen.getByRole('button', { name: /activeSession\.logActivity/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /activeSession\.addPhoto/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /activeSession\.logSnack/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /activeSession\.reportIssue/ })).toBeInTheDocument();
    });

    it('renders checklist items', () => {
        render(<ActiveSession />);
        expect(screen.getByText('Pre-session: Wash hands')).toBeInTheDocument();
        expect(screen.getByText('Verify child identity with photo')).toBeInTheDocument();
        expect(screen.getByText('Review allergies & medical info')).toBeInTheDocument();
    });

    it('renders complete session button', () => {
        render(<ActiveSession />);
        expect(screen.getByRole('button', { name: 'activeSession.completeSession' })).toBeInTheDocument();
    });

    it('opens report issue modal when button clicked', async () => {
        render(<ActiveSession />);
        fireEvent.click(screen.getByRole('button', { name: /activeSession\.reportIssue/ }));
        await waitFor(() => {
            expect(screen.getByText('activeSession.reportIssue')).toBeInTheDocument();
        });
    });

    it('has checked checkboxes for completed items', () => {
        render(<ActiveSession />);
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked(); // Pre-session: Wash hands
        expect(checkboxes[1]).toBeChecked(); // Verify child identity
        expect(checkboxes[2]).not.toBeChecked(); // Review allergies
    });
});
