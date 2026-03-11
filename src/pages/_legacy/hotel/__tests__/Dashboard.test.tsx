import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// Mock AnimatedCounter to render target value directly
vi.mock('../../../components/common/AnimatedCounter', () => ({
    AnimatedCounter: ({ target, prefix, suffix }: { target: number; prefix?: string; suffix?: string }) => (
        <span>{prefix}{target.toLocaleString()}{suffix}</span>
    ),
}));

import Dashboard from '../Dashboard';

// Mock hooks used by Dashboard
vi.mock('../../../hooks/booking/useBookings', () => ({
    useHotelBookings: () => ({
        bookings: [
            {
                id: '1',
                confirmationCode: 'KCP-TEST-001',
                date: '2025-01-15',
                time: '18:00 - 22:00',
                room: '2305',
                parent: { name: 'Sarah Johnson', phone: '+1 555-0123' },
                children: [{ name: 'Emma', age: 5 }],
                sitter: { name: 'Kim Minjung', tier: 'gold' },
                status: 'confirmed',
                totalAmount: 280000,
            },
            {
                id: '2',
                confirmationCode: 'KCP-TEST-002',
                date: '2025-01-15',
                time: '20:00 - 24:00',
                room: '3501',
                parent: { name: 'Michael Chen', phone: '+86 138-0000' },
                children: [{ name: 'Lucas', age: 4 }],
                sitter: null,
                status: 'pending',
                totalAmount: 280000,
            },
        ],
        stats: {
            todayBookings: 12,
            activeNow: 3,
            completedToday: 8,
            todayRevenue: 4850000,
            safetyDays: 127,
            pendingBookings: 4,
        },
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/session/useSessions', () => ({
    useHotelSessions: () => ({
        sessions: [
            {
                id: '1',
                sitter: { name: 'Park Sooyeon', avatar: null, tier: 'gold' },
                room: '1102',
                children: [{ name: 'Sota', age: 3 }],
                elapsed: '2h 15m',
                startTime: '19:00',
                lastUpdate: '2 min ago',
                lastActivity: 'Playing with blocks',
                activities: [],
                vitals: { mood: 'happy', energy: 'high' },
                status: 'active',
            },
        ],
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/sitter/useSitters', () => ({
    useHotelSitters: () => ({
        sitters: [
            { id: '1', name: 'Kim Minjung', tier: 'gold', rating: 4.9, sessionsCompleted: 247, languages: ['Korean', 'English'], certifications: ['CPR'], availability: 'Available', hourlyRate: 45000, safetyDays: 365 },
        ],
        isLoading: false,
    }),
}));

describe('Hotel Dashboard', () => {
    it('renders the dashboard title', () => {
        render(<Dashboard />);
        expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
    });

    it('renders stat cards', () => {
        render(<Dashboard />);
        expect(screen.getByText('12')).toBeInTheDocument(); // todayBookings
        expect(screen.getByText('3')).toBeInTheDocument(); // activeNow
        expect(screen.getByText('8')).toBeInTheDocument(); // completedToday
    });

    it('renders booking list with confirmation codes', () => {
        render(<Dashboard />);
        expect(screen.getByText('KCP-TEST-001')).toBeInTheDocument();
        expect(screen.getByText('KCP-TEST-002')).toBeInTheDocument();
    });

    it('shows "New Booking" button', () => {
        render(<Dashboard />);
        expect(screen.getByText('hotel.newBooking')).toBeInTheDocument();
    });

    it('opens new booking modal when button clicked', async () => {
        render(<Dashboard />);
        fireEvent.click(screen.getByText('hotel.newBooking'));
        await waitFor(() => {
            expect(screen.getByText('hotel.guestInfo')).toBeInTheDocument();
        });
    });

    it('shows assign button for unassigned bookings', () => {
        render(<Dashboard />);
        expect(screen.getByText('hotel.assign')).toBeInTheDocument();
    });

    it('assign button is clickable', () => {
        render(<Dashboard />);
        const assignBtn = screen.getByRole('button', { name: 'hotel.assign' });
        expect(assignBtn).toBeEnabled();
    });

    it('renders activity timeline in dashboard', () => {
        render(<Dashboard />);
        // Dashboard now shows activity timeline instead of direct session details
        expect(screen.getByText('hotel.recentActivity')).toBeInTheDocument();
    });

    it('renders safety record banner', () => {
        render(<Dashboard />);
        expect(screen.getByText('hotel.safetyRecordCongrats')).toBeInTheDocument();
    });
});
