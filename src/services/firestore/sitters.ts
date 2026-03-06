// ============================================
// Petit Stay - Sitter Firestore Service
// ============================================

import {
    collection, doc, getDoc, getDocs, updateDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Sitter, Booking } from '../../types';

export const sitterService = {
    async getHotelSitters(hotelId: string): Promise<Sitter[]> {
        const q = query(
            collection(db, COLLECTIONS.users),
            where('role', '==', 'sitter'),
            where('hotelId', '==', hotelId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as unknown as Sitter[];
    },

    async getSitter(sitterId: string): Promise<Sitter | null> {
        const docSnap = await getDoc(doc(db, COLLECTIONS.sitters, sitterId));
        if (!docSnap.exists()) {
            const userSnap = await getDoc(doc(db, COLLECTIONS.users, sitterId));
            if (!userSnap.exists()) return null;
            return { id: userSnap.id, ...convertTimestamps(userSnap.data()) } as unknown as Sitter;
        }
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Sitter;
    },

    async updateSitterProfile(sitterId: string, data: Partial<Sitter>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.sitters, sitterId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    async getSitterEarnings(sitterId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('sitterId', '==', sitterId),
            where('status', '==', 'completed'),
            orderBy('completedAt', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Booking[];
    },

    async getSitterEarningsByPeriod(sitterId: string, start: Date, end: Date): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('sitterId', '==', sitterId),
            where('status', '==', 'completed'),
            where('completedAt', '>=', start),
            where('completedAt', '<=', end),
            orderBy('completedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Booking[];
    },

    subscribeToHotelSitters(hotelId: string, callback: (sitters: Sitter[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.sitters),
            where('partnerHotels', 'array-contains', hotelId)
        );
        return onSnapshot(q, (snapshot) => {
            const sitters = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as Sitter[];
            callback(sitters);
        }, (error) => {
            console.error('Firestore subscription error (sitters):', error);
            onError?.(error);
        });
    },
};
