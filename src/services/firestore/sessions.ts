// ============================================
// Petit Stay - Session Firestore Service
// ============================================

import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc,
    query, where, onSnapshot, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { CareSession, TimelineEvent } from '../../types';

export const sessionService = {
    async getActiveSession(bookingId: string): Promise<CareSession | null> {
        const q = query(
            collection(db, COLLECTIONS.sessions),
            where('bookingId', '==', bookingId),
            where('status', 'in', ['active', 'checked_in', 'preparing'])
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const d = snapshot.docs[0];
        return { id: d.id, ...convertTimestamps(d.data()) } as CareSession;
    },

    async startSession(session: Omit<CareSession, 'id'>): Promise<string> {
        const sessionRef = doc(collection(db, COLLECTIONS.sessions));
        await setDoc(sessionRef, {
            ...session,
            'actualTimes.startedAt': serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return sessionRef.id;
    },

    async endSession(sessionId: string, _notes?: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.sessions, sessionId), {
            status: 'completed',
            'actualTimes.completedAt': serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    },

    subscribeToSession(sessionId: string, callback: (session: CareSession | null) => void, onError?: (error: Error) => void) {
        return onSnapshot(doc(db, COLLECTIONS.sessions, sessionId), (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...convertTimestamps(doc.data()) } as CareSession);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Firestore subscription error (session):', error);
            onError?.(error);
        });
    },

    async getHotelActiveSessions(hotelId: string): Promise<CareSession[]> {
        const q = query(
            collection(db, COLLECTIONS.sessions),
            where('hotelId', '==', hotelId),
            where('status', 'in', ['preparing', 'checked_in', 'active'])
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as CareSession[];
    },

    subscribeToHotelSessions(hotelId: string, callback: (sessions: CareSession[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.sessions),
            where('hotelId', '==', hotelId),
            where('status', 'in', ['preparing', 'checked_in', 'active'])
        );
        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as CareSession[];
            callback(sessions);
        }, (error) => {
            console.error('Firestore subscription error (hotel sessions):', error);
            onError?.(error);
        });
    },

    async updateSession(sessionId: string, data: Partial<CareSession>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.sessions, sessionId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    async addTimelineEvent(sessionId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>): Promise<void> {
        const sessionRef = doc(db, COLLECTIONS.sessions, sessionId);
        const sessionDoc = await getDoc(sessionRef);
        if (sessionDoc.exists()) {
            const session = sessionDoc.data();
            const timeline = session.timeline || [];
            timeline.push({
                ...event,
                id: `evt_${Date.now()}`,
                timestamp: new Date(),
            });
            await updateDoc(sessionRef, { timeline, updatedAt: serverTimestamp() });
        }
    },
};
