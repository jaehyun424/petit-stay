// ============================================
// Petit Stay - Hotel Firestore Service
// ============================================

import {
    collection, doc, getDoc, getDocs, updateDoc,
    query, orderBy, limit, onSnapshot, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Hotel } from '../../types';

export const hotelService = {
    async getHotel(hotelId: string): Promise<Hotel | null> {
        const docSnap = await getDoc(doc(db, COLLECTIONS.hotels, hotelId));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Hotel;
    },

    async updateHotelSettings(hotelId: string, settings: Partial<Hotel>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.hotels, hotelId), {
            ...settings,
            updatedAt: serverTimestamp(),
        });
    },

    async getAllHotels(): Promise<Hotel[]> {
        const q = query(
            collection(db, COLLECTIONS.hotels),
            orderBy('name'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Hotel[];
    },

    subscribeToHotel(hotelId: string, callback: (hotel: Hotel | null) => void, onError?: (error: Error) => void) {
        return onSnapshot(doc(db, COLLECTIONS.hotels, hotelId), (d) => {
            if (d.exists()) {
                callback({ id: d.id, ...convertTimestamps(d.data()) } as Hotel);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Firestore subscription error (hotel):', error);
            onError?.(error);
        });
    },
};
