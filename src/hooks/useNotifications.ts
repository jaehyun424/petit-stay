// ============================================
// Petit Stay - Notification Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import { DEMO_NOTIFICATIONS, type DemoNotification } from '../data/demo';
import { notificationService } from '../services/firestore';

// ----------------------------------------
// User Notifications Hook
// ----------------------------------------
export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<DemoNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                setNotifications(DEMO_NOTIFICATIONS);
                setUnreadCount(DEMO_NOTIFICATIONS.filter((n) => !n.read).length);
                setIsLoading(false);
            }, 400);
            return () => clearTimeout(timer);
        }

        if (!userId) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = notificationService.subscribeToUserNotifications(
            userId,
            (fbNotifications) => {
                const mapped: DemoNotification[] = fbNotifications.map((n) => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    body: n.body,
                    read: n.read,
                    createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(),
                }));
                setNotifications(mapped);
                setUnreadCount(mapped.filter((n) => !n.read).length);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
        if (DEMO_MODE) {
            setNotifications((prev) =>
                prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
            return;
        }
        try {
            await notificationService.markAsRead(notificationId);
        } catch { /* non-critical */ }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (DEMO_MODE) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            return;
        }
        if (!userId) return;
        try {
            await notificationService.markAllAsRead(userId);
        } catch { /* non-critical */ }
    }, [userId]);

    const deleteNotification = useCallback(async (notificationId: string) => {
        if (DEMO_MODE) {
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            return;
        }
        try {
            await notificationService.deleteNotification(notificationId);
        } catch { /* non-critical */ }
    }, []);

    return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification };
}
