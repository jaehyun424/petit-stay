// ============================================
// Petit Stay - Settlement Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc, updateDoc,
    query, where, orderBy, limit, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Settlement } from '../../types';

export const settlementService = {
    async getSettlements(hotelId?: string): Promise<Settlement[]> {
        let q;
        if (hotelId) {
            q = query(
                collection(db, COLLECTIONS.settlements),
                where('hotelId', '==', hotelId),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, COLLECTIONS.settlements),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Settlement[];
    },

    async createSettlement(data: Omit<Settlement, 'id' | 'status' | 'createdAt'>): Promise<string> {
        const ref = doc(collection(db, COLLECTIONS.settlements));
        await setDoc(ref, {
            ...data,
            status: 'draft',
            createdAt: serverTimestamp(),
        });
        return ref.id;
    },

    async approveSettlement(settlementId: string, approvedBy: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.settlements, settlementId), {
            status: 'approved',
            approvedBy,
            approvedAt: serverTimestamp(),
        });
    },

    async markAsPaid(settlementId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.settlements, settlementId), {
            status: 'paid',
            paidAt: serverTimestamp(),
        });
    },
};
