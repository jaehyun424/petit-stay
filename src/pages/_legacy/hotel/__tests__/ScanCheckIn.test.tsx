// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('jsqr', () => ({
    default: vi.fn(() => null),
}));

import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import ScanCheckIn from '../ScanCheckIn';

function switchToManualTab() {
    fireEvent.click(screen.getByText('scan.manualCode'));
}

describe('ScanCheckIn', () => {
    it('renders page title', () => {
        render(<ScanCheckIn />);
        expect(screen.getByText('scan.title')).toBeTruthy();
    });

    it('renders subtitle', () => {
        render(<ScanCheckIn />);
        expect(screen.getByText('scan.subtitle')).toBeTruthy();
    });

    it('renders scanner and manual tabs', () => {
        render(<ScanCheckIn />);
        expect(screen.getByText('scan.qrScanner')).toBeTruthy();
        expect(screen.getByText('scan.manualCode')).toBeTruthy();
    });

    it('renders confirmation code input in manual tab', () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        expect(screen.getByPlaceholderText('scan.codePlaceholder')).toBeTruthy();
    });

    it('renders the manual check-in card title', () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        expect(screen.getByText('scan.manualCheckIn')).toBeTruthy();
    });

    it('renders the lookup booking button', () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        expect(screen.getByText('scan.lookUpBooking')).toBeTruthy();
    });

    it('lookup button is disabled when code input is empty', () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        const lookupBtn = screen.getByText('scan.lookUpBooking').closest('button');
        expect(lookupBtn).toBeDisabled();
    });

    it('enables lookup button when code is entered', () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        const input = screen.getByPlaceholderText('scan.codePlaceholder');
        fireEvent.change(input, { target: { value: 'KCP-TEST-001' } });
        const lookupBtn = screen.getByText('scan.lookUpBooking').closest('button');
        expect(lookupBtn).not.toBeDisabled();
    });

    it('can switch to scan tab', () => {
        render(<ScanCheckIn />);
        // Default is scan tab, so scanner should already be visible
        expect(screen.getByText('scan.scanner')).toBeTruthy();
    });

    it('renders start scanner button in scan tab', () => {
        render(<ScanCheckIn />);
        expect(screen.getByText('scan.startScanner')).toBeTruthy();
    });

    it('shows booking details after manual lookup', async () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        const input = screen.getByPlaceholderText('scan.codePlaceholder');
        fireEvent.change(input, { target: { value: 'KCP-TEST-001' } });

        const lookupBtn = screen.getByText('scan.lookUpBooking').closest('button')!;
        fireEvent.click(lookupBtn);

        await waitFor(() => {
            expect(screen.getByText('scan.bookingDetails')).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('shows confirm check-in button after successful lookup', async () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        const input = screen.getByPlaceholderText('scan.codePlaceholder');
        fireEvent.change(input, { target: { value: 'KCP-ABC' } });

        fireEvent.click(screen.getByText('scan.lookUpBooking').closest('button')!);

        await waitFor(() => {
            expect(screen.getByText('scan.confirmCheckIn')).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('shows scan another button after successful lookup', async () => {
        render(<ScanCheckIn />);
        switchToManualTab();
        const input = screen.getByPlaceholderText('scan.codePlaceholder');
        fireEvent.change(input, { target: { value: 'KCP-RESET' } });

        fireEvent.click(screen.getByText('scan.lookUpBooking').closest('button')!);

        await waitFor(() => {
            expect(screen.getByText('scan.scanAnother')).toBeTruthy();
        }, { timeout: 3000 });
    });
});
