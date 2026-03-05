// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ bookingId: 'test-booking-1' }), useNavigate: () => vi.fn() };
});

vi.mock('../../../hooks/useBookings', () => ({
    useParentBookings: () => ({
        upcomingBooking: null,
        recentSessions: [],
        history: [],
        isLoading: false,
        error: null,
        retry: vi.fn(),
    }),
}));

vi.mock('../../../components/common/SignaturePad', () => ({
    SignaturePad: vi.fn(() => <div data-testid="signature-pad">Signature Pad Mock</div>),
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import TrustCheckIn from '../TrustCheckIn';

describe('TrustCheckIn', () => {
    it('renders trust protocol title', () => {
        render(<TrustCheckIn />);
        expect(screen.getByText('trustCheckin.careHandover')).toBeTruthy();
    });

    it('renders step indicators', () => {
        render(<TrustCheckIn />);
        const indicators = document.querySelectorAll('.step-indicator-icon');
        expect(indicators.length).toBe(3);
    });

    it('renders first step - medical wellbeing heading', () => {
        render(<TrustCheckIn />);
        expect(screen.getByText('trustCheckin.medicalWellbeing')).toBeTruthy();
    });

    it('renders health status subtitle on step 1', () => {
        render(<TrustCheckIn />);
        expect(screen.getByText('trustCheckin.confirmHealthStatus')).toBeTruthy();
    });

    it('renders allergies input on step 1', () => {
        render(<TrustCheckIn />);
        const noneInputs = screen.getAllByDisplayValue('None');
        expect(noneInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders next step button on step 1', () => {
        render(<TrustCheckIn />);
        expect(screen.getByText('trustCheckin.nextStep')).toBeTruthy();
    });

    it('advances to step 2 when next is clicked', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByText('trustCheckin.emergencyProtocol')).toBeTruthy();
        });
    });

    it('shows emergency protocol fields on step 2', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByText('trustCheckin.emergencyContactName')).toBeTruthy();
            expect(screen.getByText('trustCheckin.emergencyPhone')).toBeTruthy();
        });
    });

    it('shows back button on step 2', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByText('common.back')).toBeTruthy();
        });
    });

    it('can navigate back from step 2 to step 1', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByText('trustCheckin.emergencyProtocol')).toBeTruthy();
        });

        fireEvent.click(screen.getByText('common.back'));

        await waitFor(() => {
            expect(screen.getByText('trustCheckin.medicalWellbeing')).toBeTruthy();
        });
    });

    it('advances to step 3 when next is clicked twice', async () => {
        render(<TrustCheckIn />);
        // Step 1 -> 2
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));
        await waitFor(() => {
            expect(screen.getByText('trustCheckin.emergencyProtocol')).toBeTruthy();
        });

        // Step 2 -> 3
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));
        await waitFor(() => {
            expect(screen.getByText('trustCheckin.safetyProtocols')).toBeTruthy();
        });
    });

    it('shows confirm handover button on step 3', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));
        await waitFor(() => expect(screen.getByText('trustCheckin.emergencyProtocol')).toBeTruthy());
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByText('trustCheckin.confirmHandover')).toBeTruthy();
        });
    });

    it('shows first aid consent checkbox on step 3', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));
        await waitFor(() => expect(screen.getByText('trustCheckin.emergencyProtocol')).toBeTruthy());
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByText('trustCheckin.firstAidConsent')).toBeTruthy();
        });
    });

    it('shows signature pad on step 3', async () => {
        render(<TrustCheckIn />);
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));
        await waitFor(() => expect(screen.getByText('trustCheckin.emergencyProtocol')).toBeTruthy());
        fireEvent.click(screen.getByText('trustCheckin.nextStep'));

        await waitFor(() => {
            expect(screen.getByTestId('signature-pad')).toBeTruthy();
        });
    });
});
