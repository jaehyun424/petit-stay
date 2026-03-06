// ============================================
// Petit Stay - Notification Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp, writeBatch,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Notification } from '../../types';

export const notificationService = {
    async getUserNotifications(userId: string): Promise<Notification[]> {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Notification[];
    },

    async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
        const notifRef = doc(collection(db, COLLECTIONS.notifications));
        await setDoc(notifRef, {
            ...notification,
            createdAt: serverTimestamp(),
        });
        return notifRef.id;
    },

    async markAsRead(notificationId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
            read: true,
        });
    },

    async markAllAsRead(userId: string): Promise<void> {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs;

        for (let i = 0; i < docs.length; i += 500) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + 500);
            chunk.forEach((d) => {
                batch.update(doc(db, COLLECTIONS.notifications, d.id), { read: true });
            });
            await batch.commit();
        }
    },

    subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as Notification[];
            callback(notifications);
        }, (error) => {
            console.error('Firestore subscription error (notifications):', error);
            onError?.(error);
        });
    },

    async deleteNotification(notificationId: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTIONS.notifications, notificationId));
    },

    async getUnreadCount(userId: string): Promise<number> {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    },
};
