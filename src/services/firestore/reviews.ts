// ============================================
// Petit Stay - Review Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc,
    query, where, orderBy, limit, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { ReviewData } from '../../types';

export const reviewService = {
    async getSitterReviews(sitterId: string): Promise<ReviewData[]> {
        const q = query(
            collection(db, COLLECTIONS.reviews),
            where('sitterId', '==', sitterId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as unknown as ReviewData[];
    },

    async createReview(review: Omit<ReviewData, 'createdAt'> & { bookingId: string; sitterId: string; parentId?: string }): Promise<string> {
        const reviewRef = doc(collection(db, COLLECTIONS.reviews));
        await setDoc(reviewRef, {
            ...review,
            createdAt: serverTimestamp(),
        });
        return reviewRef.id;
    },
};
