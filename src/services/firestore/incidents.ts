// ============================================
// Petit Stay - Incident Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc, updateDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Incident } from '../../types';

export const incidentService = {
    async getHotelIncidents(hotelId: string): Promise<Incident[]> {
        const q = query(
            collection(db, COLLECTIONS.incidents),
            where('hotelId', '==', hotelId),
            orderBy('createdAt', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Incident[];
    },

    async createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const incidentRef = doc(collection(db, COLLECTIONS.incidents));
        await setDoc(incidentRef, {
            ...incident,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return incidentRef.id;
    },

    async updateIncident(incidentId: string, data: Partial<Incident>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.incidents, incidentId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    subscribeToHotelIncidents(hotelId: string, callback: (incidents: Incident[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.incidents),
            where('hotelId', '==', hotelId),
            orderBy('createdAt', 'desc'),
            limit(100)
        );
        return onSnapshot(q, (snapshot) => {
            const incidents = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as Incident[];
            callback(incidents);
        }, (error) => {
            console.error('Firestore subscription error (incidents):', error);
            onError?.(error);
        });
    },
};
