// ============================================
// Petit Stay - Firestore Shared Helpers
// ============================================

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';

import { db } from '../firebase';

// Re-export everything consumers might need
export {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    writeBatch,
    db,
};

// ----------------------------------------
// Collection References
// ----------------------------------------
export const COLLECTIONS = {
    users: 'users',
    hotels: 'hotels',
    bookings: 'bookings',
    sessions: 'sessions',
    children: 'children',
    activityLogs: 'activityLogs',
    reviews: 'reviews',
    sitters: 'sitters',
    incidents: 'incidents',
    notifications: 'notifications',
    guestTokens: 'guestTokens',
    settlements: 'settlements',
} as const;

// ----------------------------------------
// Timestamp Conversion Helper
// ----------------------------------------
interface FirestoreTimestamp { toDate: () => Date }
export const convertTimestamps = <T extends Record<string, unknown>>(data: T): T => {
    const converted = { ...data } as Record<string, unknown>;
    for (const key in converted) {
        const value = converted[key];
        if (value && typeof value === 'object' && 'toDate' in value && typeof (value as FirestoreTimestamp).toDate === 'function') {
            converted[key] = (value as FirestoreTimestamp).toDate();
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            converted[key] = convertTimestamps(value as Record<string, unknown>);
        }
    }
    return converted as T;
};
