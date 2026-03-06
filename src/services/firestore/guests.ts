// ============================================
// Petit Stay - Guest Firestore Service
// ============================================

import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc,
    query, where, limit, serverTimestamp,
    db, COLLECTIONS,
} from './helpers';
import type { GuestConsent } from '../../types';

export const guestService = {
    async validateToken(token: string): Promise<{ bookingId: string; hotelId: string } | null> {
        const q = query(
            collection(db, COLLECTIONS.guestTokens),
            where('token', '==', token),
            where('used', '==', false),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const data = snapshot.docs[0].data();
        const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
        if (expiresAt < new Date()) return null;

        return { bookingId: data.bookingId, hotelId: data.hotelId };
    },

    async submitConsent(bookingId: string, consent: Omit<GuestConsent, 'consentedAt'>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            guestConsent: {
                ...consent,
                consentedAt: serverTimestamp(),
            },
            status: 'pending_assignment',
            updatedAt: serverTimestamp(),
        });
    },

    async submitPayment(bookingId: string, paymentData: { method?: string; transactionId?: string }): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            'payment.status': 'authorized',
            'payment.method': paymentData.method || 'card',
            updatedAt: serverTimestamp(),
        });
    },

    async submitFeedback(bookingId: string, rating: number, comment: string): Promise<void> {
        const bookingDoc = await getDoc(doc(db, COLLECTIONS.bookings, bookingId));
        if (!bookingDoc.exists()) return;

        const booking = bookingDoc.data();
        await setDoc(doc(collection(db, COLLECTIONS.reviews)), {
            bookingId,
            sitterId: booking.sitterId || '',
            rating,
            comment,
            tags: [],
            createdAt: serverTimestamp(),
        });
    },
};
