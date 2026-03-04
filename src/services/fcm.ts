// ============================================
// Petit Stay - Firebase Cloud Messaging Service
// FCM token registration for push notifications
// ============================================

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// ----------------------------------------
// FCM Service
// ----------------------------------------
export const fcmService = {
    // Register FCM token for a user (requests notification permission + saves token)
    async registerToken(userId: string): Promise<string | null> {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.warn('FCM: Push notifications not supported in this browser.');
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('FCM: Notification permission denied.');
            return null;
        }

        try {
            // Dynamically import firebase/messaging to avoid SSR issues
            const { getMessaging, getToken } = await import('firebase/messaging');
            const firebaseApp = (await import('./firebase')).default;
            if (!firebaseApp) {
                console.warn('FCM: Firebase app not initialized.');
                return null;
            }

            const messaging = getMessaging(firebaseApp);
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const token = await getToken(messaging, { vapidKey: vapidKey || undefined });

            if (token) {
                // Save token to Firestore under user's document
                await setDoc(
                    doc(db, 'users', userId, 'fcmTokens', token),
                    {
                        token,
                        platform: 'web',
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            }

            return token;
        } catch (err) {
            console.error('FCM: Failed to get token:', err);
            return null;
        }
    },

    // Remove FCM token (on logout)
    async removeToken(userId: string, token: string): Promise<void> {
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'users', userId, 'fcmTokens', token));
        } catch (err) {
            console.error('FCM: Failed to remove token:', err);
        }
    },
};
