// ============================================
// Petit Stay - Activity Log Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';

interface ActivityLog {
    id: string;
    sessionId: string;
    type: string;
    description: string;
    timestamp: Date;
    mediaUrl?: string;
}

export const activityService = {
    async getSessionActivities(sessionId: string): Promise<ActivityLog[]> {
        const q = query(
            collection(db, COLLECTIONS.activityLogs),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as ActivityLog[];
    },

    async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> {
        const activityRef = doc(collection(db, COLLECTIONS.activityLogs));
        await setDoc(activityRef, {
            ...activity,
            timestamp: serverTimestamp(),
        });
        return activityRef.id;
    },

    subscribeToActivities(sessionId: string, callback: (activities: ActivityLog[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.activityLogs),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...convertTimestamps(doc.data()),
            })) as ActivityLog[];
            callback(activities);
        }, (error) => {
            console.error('Firestore subscription error (activities):', error);
            onError?.(error);
        });
    },
};
