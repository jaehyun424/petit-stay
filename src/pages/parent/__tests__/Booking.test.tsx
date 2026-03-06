import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// Mock hooks before importing the component
vi.mock('../../../hooks/children/useChildren', () => ({
    useChildren: () => ({
        children: [
            { id: 'child-1', name: 'Emma', age: 5, allergies: [], gender: 'female' },
            { id: 'child-2', name: 'Noah', age: 3, allergies: ['peanuts'], gender: 'male' },
        ],
        isLoading: false,
    }),
}));

vi.mock('../../../hooks/hotel/useHotel', () => ({
    useHotels: () => ({
        hotels: [
            { value: 'grand-hyatt', label: 'Grand Hyatt Seoul' },
            { value: 'four-seasons', label: 'Four Seasons Seoul' },
        ],
    }),
}));

import Booking from '../Booking';

describe('Booking Page', () => {
    it('renders step 1 by default', () => {
        render(<Booking />);
        expect(screen.getByText('booking.newBooking')).toBeInTheDocument();
        // Step 1 card heading
        expect(screen.getByRole('heading', { name: 'booking.bookingDetails' })).toBeInTheDocument();
    });

    it('shows date and time inputs in step 1', () => {
        render(<Booking />);
        expect(screen.getByLabelText('common.date')).toBeInTheDocument();
        expect(screen.getByLabelText('booking.startTime')).toBeInTheDocument();
        expect(screen.getByLabelText('booking.duration')).toBeInTheDocument();
    });

    it('validates required fields before advancing', async () => {
        render(<Booking />);

        // Click Next without filling date/time
        fireEvent.click(screen.getByText('common.next'));

        // Should show errors, stay on step 1
        expect(screen.getByText('validation.dateRequired')).toBeInTheDocument();
        expect(screen.getByText('validation.startTimeRequired')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'booking.bookingDetails' })).toBeInTheDocument();
    });

    it('prevents past date selection', async () => {
        render(<Booking />);

        // Set a past date
        const dateInput = screen.getByLabelText('common.date');
        fireEvent.change(dateInput, { target: { value: '2020-01-01', name: 'date' } });

        // Select a time
        const timeSelect = screen.getByLabelText('booking.startTime');
        fireEvent.change(timeSelect, { target: { value: '18:00', name: 'startTime' } });

        // Click Next
        fireEvent.click(screen.getByText('common.next'));

        expect(screen.getByText('validation.pastDate')).toBeInTheDocument();
    });

    it('advances to step 2 with valid data', async () => {
        render(<Booking />);

        // Fill date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        fireEvent.change(screen.getByLabelText('common.date'), {
            target: { value: dateStr, name: 'date' },
        });
        fireEvent.change(screen.getByLabelText('booking.startTime'), {
            target: { value: '19:00', name: 'startTime' },
        });

        fireEvent.click(screen.getByText('common.next'));

        // Should show step 2 - children selection
        await waitFor(() => {
            expect(screen.getByText('booking.selectChildren')).toBeInTheDocument();
        });
        expect(screen.getByText('Emma')).toBeInTheDocument();
        expect(screen.getByText('Noah')).toBeInTheDocument();
    });

    it('can navigate back from step 2 to step 1', async () => {
        render(<Booking />);

        // Advance to step 2
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        fireEvent.change(screen.getByLabelText('common.date'), {
            target: { value: tomorrow.toISOString().split('T')[0], name: 'date' },
        });
        fireEvent.change(screen.getByLabelText('booking.startTime'), {
            target: { value: '19:00', name: 'startTime' },
        });
        fireEvent.click(screen.getByText('common.next'));

        await waitFor(() => {
            expect(screen.getByText('booking.selectChildren')).toBeInTheDocument();
        });

        // Go back
        fireEvent.click(screen.getByText('common.back'));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'booking.bookingDetails' })).toBeInTheDocument();
        });
    });

    it('advances through all steps to review', async () => {
        render(<Booking />);

        // Step 1: Fill required fields and advance
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        fireEvent.change(screen.getByLabelText('common.date'), {
            target: { value: tomorrow.toISOString().split('T')[0], name: 'date' },
        });
        fireEvent.change(screen.getByLabelText('booking.startTime'), {
            target: { value: '20:00', name: 'startTime' },
        });
        fireEvent.click(screen.getByText('common.next'));

        // Step 2: Children are auto-selected, just advance
        await waitFor(() => {
            expect(screen.getByText('booking.selectChildren')).toBeInTheDocument();
        });
        // Children auto-selected by useEffect, click next
        fireEvent.click(screen.getAllByText('common.next')[0]);

        // Step 3: Sitter preference
        await waitFor(() => {
            expect(screen.getByText('booking.sitterPreference')).toBeInTheDocument();
        });
    });

    it('clears error when user corrects the field', () => {
        render(<Booking />);

        // Trigger validation error
        fireEvent.click(screen.getByText('common.next'));
        expect(screen.getByText('validation.dateRequired')).toBeInTheDocument();

        // Fix the date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        fireEvent.change(screen.getByLabelText('common.date'), {
            target: { value: tomorrow.toISOString().split('T')[0], name: 'date' },
        });

        // Error should clear
        expect(screen.queryByText('validation.dateRequired')).not.toBeInTheDocument();
    });
});
