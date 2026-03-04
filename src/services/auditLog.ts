// ============================================
// Petit Stay - Audit Log Service
// Tracks all booking state changes
// ============================================

import {
    collection,
    doc,
    getDocs,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

// ----------------------------------------
// Types
// ----------------------------------------
export type AuditAction =
    | 'booking_created'
    | 'sitter_assigned'
    | 'sitter_confirmed'
    | 'status_changed'
    | 'payment_received'
    | 'payment_refunded'
    | 'incident_reported'
    | 'guest_consent_given'
    | 'check_in_completed'
    | 'check_out_completed'
    | 'booking_cancelled'
    | 'booking_extended'
    | 'insurance_activated'
    | 'insurance_claimed';

export interface AuditLogEntry {
    id: string;
    bookingId: string;
    action: AuditAction;
    details: string;
    userId: string;
    userName: string;
    timestamp: Date;
}

// ----------------------------------------
// Helper
// ----------------------------------------
interface FirestoreTimestamp { toDate: () => Date }

function convertTimestamp(value: unknown): Date {
    if (value && typeof value === 'object' && 'toDate' in value) {
        return (value as FirestoreTimestamp).toDate();
    }
    return value instanceof Date ? value : new Date();
}

// ----------------------------------------
// Audit Log Service
// ----------------------------------------
export const auditLogService = {
    /** Write an audit log entry to bookings/{bookingId}/auditLog subcollection */
    async logAudit(
        bookingId: string,
        action: AuditAction,
        details: string,
        userId: string,
        userName: string
    ): Promise<string> {
        const subcollectionRef = collection(db, 'bookings', bookingId, 'auditLog');
        const docRef = await addDoc(subcollectionRef, {
            bookingId,
            action,
            details,
            userId,
            userName,
            timestamp: serverTimestamp(),
        });
        return docRef.id;
    },

    /** Read the full audit trail for a booking */
    async getAuditLog(bookingId: string): Promise<AuditLogEntry[]> {
        const q = query(
            collection(db, 'bookings', bookingId, 'auditLog'),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            bookingId,
            action: d.data().action,
            details: d.data().details,
            userId: d.data().userId,
            userName: d.data().userName,
            timestamp: convertTimestamp(d.data().timestamp),
        })) as AuditLogEntry[];
    },

    /** Subscribe to audit log changes (real-time) */
    subscribeToAuditLog(
        bookingId: string,
        callback: (entries: AuditLogEntry[]) => void
    ) {
        const q = query(
            collection(db, 'bookings', bookingId, 'auditLog'),
            orderBy('timestamp', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map((d) => ({
                id: d.id,
                bookingId,
                action: d.data().action,
                details: d.data().details,
                userId: d.data().userId,
                userName: d.data().userName,
                timestamp: convertTimestamp(d.data().timestamp),
            })) as AuditLogEntry[];
            callback(entries);
        });
    },
};
