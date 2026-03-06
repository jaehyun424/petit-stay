// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import NotificationInbox from '../NotificationInbox';

// We need to re-mock useNotifications AFTER test/utils sets its mock
// Use vi.mocked approach
import * as useNotificationsModule from '../../../hooks/common/useNotifications';

const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

const mockNotifications = [
    { id: 'n1', type: 'booking_confirmed', title: 'Booking Confirmed', body: 'Your booking KCP-001 has been confirmed', read: false, createdAt: new Date() },
    { id: 'n2', type: 'care_started', title: 'Care Session Started', body: 'Kim Minjung has started the session', read: true, createdAt: new Date(Date.now() - 3600000) },
    { id: 'n3', type: 'emergency', title: 'Emergency Alert', body: 'Emergency protocol activated in Room 2301', read: false, createdAt: new Date(Date.now() - 7200000) },
    { id: 'n4', type: 'booking_cancelled', title: 'Booking Cancelled', body: 'Your booking KCP-002 has been cancelled', read: true, createdAt: new Date(Date.now() - 86400000) },
];

describe('NotificationInbox', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
            notifications: mockNotifications,
            unreadCount: 2,
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead,
            deleteNotification: mockDeleteNotification,
            isLoading: false,
            error: null,
            retry: vi.fn(),
        } as any);
    });

    it('renders inbox title', () => {
        render(<NotificationInbox />);
        expect(screen.getByText('notifications.inbox')).toBeTruthy();
    });

    it('renders mark all read button', () => {
        render(<NotificationInbox />);
        expect(screen.getByText('notifications.markAllRead')).toBeTruthy();
    });

    it('renders all filter tabs', () => {
        render(<NotificationInbox />);
        expect(screen.getByText('notifications.filterAll')).toBeTruthy();
        expect(screen.getByText('notifications.filterBookings')).toBeTruthy();
        expect(screen.getByText('notifications.filterSessions')).toBeTruthy();
        expect(screen.getByText('notifications.filterEmergency')).toBeTruthy();
    });

    it('renders all notification items', () => {
        render(<NotificationInbox />);
        expect(screen.getByText('Booking Confirmed')).toBeTruthy();
        expect(screen.getByText('Care Session Started')).toBeTruthy();
        expect(screen.getByText('Emergency Alert')).toBeTruthy();
        expect(screen.getByText('Booking Cancelled')).toBeTruthy();
    });

    it('renders notification bodies', () => {
        render(<NotificationInbox />);
        expect(screen.getByText(/Your booking KCP-001 has been confirmed/)).toBeTruthy();
        expect(screen.getByText(/Kim Minjung has started the session/)).toBeTruthy();
        expect(screen.getByText(/Emergency protocol activated/)).toBeTruthy();
    });

    it('renders time ago for notifications', () => {
        render(<NotificationInbox />);
        // timeAgo uses t() which returns translation keys in test
        expect(screen.getByText('time.justNow')).toBeTruthy();
        expect(screen.getByText('time.hoursAgo(1)')).toBeTruthy();
        expect(screen.getByText('time.hoursAgo(2)')).toBeTruthy();
        expect(screen.getByText('time.daysAgo(1)')).toBeTruthy();
    });

    it('shows unread styling for unread notifications', () => {
        render(<NotificationInbox />);
        const unreadItems = document.querySelectorAll('.notification-inbox-item.unread');
        expect(unreadItems.length).toBe(2);
    });

    it('renders delete buttons for all notifications', () => {
        render(<NotificationInbox />);
        const deleteButtons = screen.getAllByText('common.delete');
        expect(deleteButtons.length).toBe(4);
    });

    it('renders mark as read buttons for unread notifications', () => {
        render(<NotificationInbox />);
        const markReadButtons = screen.getAllByText('common.markAllRead');
        // 2 unread notifications + 1 header mark all read
        expect(markReadButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('calls markAllAsRead when mark all read button is clicked', () => {
        render(<NotificationInbox />);
        fireEvent.click(screen.getByText('notifications.markAllRead'));
        expect(mockMarkAllAsRead).toHaveBeenCalled();
    });

    it('calls deleteNotification when delete button is clicked', () => {
        render(<NotificationInbox />);
        const deleteButtons = screen.getAllByText('common.delete');
        fireEvent.click(deleteButtons[0]);
        expect(mockDeleteNotification).toHaveBeenCalledWith('n1');
    });

    it('calls markAsRead when clicking on unread notification', () => {
        render(<NotificationInbox />);
        const contentItems = document.querySelectorAll('.notification-inbox-item-content');
        fireEvent.click(contentItems[0]); // n1 is unread
        expect(mockMarkAsRead).toHaveBeenCalledWith('n1');
    });

    it('does not call markAsRead when clicking on already read notification', () => {
        render(<NotificationInbox />);
        const contentItems = document.querySelectorAll('.notification-inbox-item-content');
        fireEvent.click(contentItems[1]); // n2 is already read
        expect(mockMarkAsRead).not.toHaveBeenCalledWith('n2');
    });

    it('filters to show only booking notifications', async () => {
        render(<NotificationInbox />);
        fireEvent.click(screen.getByText('notifications.filterBookings'));

        await waitFor(() => {
            expect(screen.getByText('Booking Confirmed')).toBeTruthy();
            expect(screen.getByText('Booking Cancelled')).toBeTruthy();
            expect(screen.queryByText('Care Session Started')).toBeNull();
            expect(screen.queryByText('Emergency Alert')).toBeNull();
        });
    });

    it('filters to show only session notifications', async () => {
        render(<NotificationInbox />);
        fireEvent.click(screen.getByText('notifications.filterSessions'));

        await waitFor(() => {
            expect(screen.getByText('Care Session Started')).toBeTruthy();
            expect(screen.queryByText('Booking Confirmed')).toBeNull();
            expect(screen.queryByText('Emergency Alert')).toBeNull();
        });
    });

    it('filters to show only emergency notifications', async () => {
        render(<NotificationInbox />);
        fireEvent.click(screen.getByText('notifications.filterEmergency'));

        await waitFor(() => {
            expect(screen.getByText('Emergency Alert')).toBeTruthy();
            expect(screen.queryByText('Booking Confirmed')).toBeNull();
            expect(screen.queryByText('Care Session Started')).toBeNull();
        });
    });

    it('shows all notifications when All filter is clicked', async () => {
        render(<NotificationInbox />);

        // First filter to bookings
        fireEvent.click(screen.getByText('notifications.filterBookings'));
        await waitFor(() => {
            expect(screen.queryByText('Care Session Started')).toBeNull();
        });

        // Then switch back to all
        fireEvent.click(screen.getByText('notifications.filterAll'));
        await waitFor(() => {
            expect(screen.getByText('Care Session Started')).toBeTruthy();
            expect(screen.getByText('Booking Confirmed')).toBeTruthy();
            expect(screen.getByText('Emergency Alert')).toBeTruthy();
        });
    });
});

describe('NotificationInbox - Empty state', () => {
    beforeEach(() => {
        vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
            notifications: [],
            unreadCount: 0,
            markAsRead: vi.fn(),
            markAllAsRead: vi.fn(),
            deleteNotification: vi.fn(),
            isLoading: false,
            error: null,
            retry: vi.fn(),
        } as any);
    });

    it('shows empty state when no notifications', () => {
        render(<NotificationInbox />);
        expect(screen.getByText('notifications.noNotifications')).toBeTruthy();
    });

    it('shows empty state description', () => {
        render(<NotificationInbox />);
        expect(screen.getByText('notifications.noNotificationsDesc')).toBeTruthy();
    });
});
