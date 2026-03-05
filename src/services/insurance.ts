// ============================================
// Petit Stay - Insurance Service
// CRUD for insurance policies and booking insurance
// ============================================

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';
import type { InsurancePolicy, BookingInsurance } from '../types';

// ----------------------------------------
// Helper
// ----------------------------------------
interface FirestoreTimestamp { toDate: () => Date }
const convertTimestamps = <T extends Record<string, unknown>>(data: T): T => {
    const converted = { ...data } as Record<string, unknown>;
    for (const key in converted) {
        const value = converted[key];
        if (value && typeof value === 'object' && 'toDate' in value && typeof (value as FirestoreTimestamp).toDate === 'function') {
            converted[key] = (value as FirestoreTimestamp).toDate();
        }
    }
    return converted as T;
};

const COLLECTIONS = {
    insurancePolicies: 'insurancePolicies',
    bookingInsurance: 'bookingInsurance',
} as const;

// ----------------------------------------
// Insurance Policy Service
// ----------------------------------------
export const insuranceService = {
    /** Get all insurance policies */
    async getPolicies(): Promise<InsurancePolicy[]> {
        const q = query(
            collection(db, COLLECTIONS.insurancePolicies),
            orderBy('validTo', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as unknown as InsurancePolicy[];
    },

    /** Get a single policy */
    async getPolicy(policyId: string): Promise<InsurancePolicy | null> {
        const docSnap = await getDoc(doc(db, COLLECTIONS.insurancePolicies, policyId));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as unknown as InsurancePolicy;
    },

    /** Create a new policy */
    async createPolicy(policy: Omit<InsurancePolicy, 'id'>): Promise<string> {
        const ref = doc(collection(db, COLLECTIONS.insurancePolicies));
        await setDoc(ref, {
            ...policy,
            createdAt: serverTimestamp(),
        });
        return ref.id;
    },

    /** Update a policy */
    async updatePolicy(policyId: string, data: Partial<InsurancePolicy>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.insurancePolicies, policyId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    /** Subscribe to all policies (real-time) */
    subscribeToPolicies(callback: (policies: InsurancePolicy[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.insurancePolicies),
            orderBy('validTo', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const policies = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as unknown as InsurancePolicy[];
            callback(policies);
        }, (error) => {
            console.error('Firestore subscription error (insurance policies):', error);
            onError?.(error);
        });
    },

    // ---- Booking Insurance ----

    /** Get insurance for a specific booking */
    async getBookingInsurance(bookingId: string): Promise<BookingInsurance | null> {
        const q = query(
            collection(db, COLLECTIONS.bookingInsurance),
            where('bookingId', '==', bookingId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { ...convertTimestamps(snapshot.docs[0].data()) } as unknown as BookingInsurance;
    },

    /** Get all booking insurance entries */
    async getAllBookingInsurance(): Promise<BookingInsurance[]> {
        const q = query(
            collection(db, COLLECTIONS.bookingInsurance),
            orderBy('status', 'asc'),
            limit(200)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            ...convertTimestamps(d.data()),
        })) as unknown as BookingInsurance[];
    },

    /** Link insurance to a booking */
    async createBookingInsurance(data: BookingInsurance): Promise<void> {
        const ref = doc(collection(db, COLLECTIONS.bookingInsurance));
        await setDoc(ref, {
            ...data,
            createdAt: serverTimestamp(),
        });
    },

    /** Update booking insurance status */
    async updateBookingInsurance(bookingId: string, data: Partial<BookingInsurance>): Promise<void> {
        const q = query(
            collection(db, COLLECTIONS.bookingInsurance),
            where('bookingId', '==', bookingId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            await updateDoc(snapshot.docs[0].ref, {
                ...data,
                updatedAt: serverTimestamp(),
            });
        }
    },

    /** Subscribe to all booking insurance (real-time) */
    subscribeToBookingInsurance(callback: (entries: BookingInsurance[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.bookingInsurance),
            limit(200)
        );
        return onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map((d) => ({
                ...convertTimestamps(d.data()),
            })) as unknown as BookingInsurance[];
            callback(entries);
        }, (error) => {
            console.error('Firestore subscription error (booking insurance):', error);
            onError?.(error);
        });
    },
};
