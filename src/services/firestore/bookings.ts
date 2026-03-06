// ============================================
// Petit Stay - Booking Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc, updateDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Booking, DashboardStats } from '../../types';

export const bookingService = {
    async getHotelBookings(hotelId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('hotelId', '==', hotelId),
            orderBy('schedule.date', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Booking[];
    },

    async getParentBookings(parentId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('parentId', '==', parentId),
            orderBy('schedule.date', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Booking[];
    },

    async getSitterBookings(sitterId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('sitterId', '==', sitterId),
            orderBy('schedule.date', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Booking[];
    },

    async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const bookingRef = doc(collection(db, COLLECTIONS.bookings));
        await setDoc(bookingRef, {
            ...booking,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return bookingRef.id;
    },

    async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            status,
            updatedAt: serverTimestamp(),
        });
    },

    subscribeToBooking(bookingId: string, callback: (booking: Booking | null) => void, onError?: (error: Error) => void) {
        return onSnapshot(doc(db, COLLECTIONS.bookings, bookingId), (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...convertTimestamps(doc.data()) } as Booking);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Firestore subscription error (booking):', error);
            onError?.(error);
        });
    },

    async getTodayBookings(hotelId: string): Promise<Booking[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('hotelId', '==', hotelId),
            where('schedule.date', '>=', today),
            where('schedule.date', '<', tomorrow),
            orderBy('schedule.date', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Booking[];
    },

    async getBookingStats(hotelId: string): Promise<DashboardStats> {
        const allBookings = await bookingService.getHotelBookings(hotelId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayBookings = allBookings.filter(b => {
            const d = b.schedule?.date instanceof Date ? b.schedule.date : new Date(b.schedule?.date);
            return d >= today;
        });

        return {
            todayBookings: todayBookings.length,
            activeNow: allBookings.filter(b => b.status === 'in_progress').length,
            completedToday: todayBookings.filter(b => b.status === 'completed').length,
            todayRevenue: todayBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.pricing?.total || 0), 0),
            safetyDays: 0,
            pendingBookings: allBookings.filter(b => b.status === 'pending').length,
        };
    },

    subscribeToHotelBookings(hotelId: string, callback: (bookings: Booking[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('hotelId', '==', hotelId),
            orderBy('createdAt', 'desc'),
            limit(100)
        );
        return onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as Booking[];
            callback(bookings);
        }, (error) => {
            console.error('Firestore subscription error (hotel bookings):', error);
            onError?.(error);
        });
    },

    async getByConfirmationCode(code: string): Promise<Booking | null> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('confirmationCode', '==', code),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const d = snapshot.docs[0];
        return { id: d.id, ...convertTimestamps(d.data()) } as Booking;
    },

    async updateBooking(bookingId: string, data: Partial<Booking>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    async getBookingsByDateRange(hotelId: string, start: Date, end: Date): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('hotelId', '==', hotelId),
            where('schedule.date', '>=', start),
            where('schedule.date', '<=', end),
            orderBy('schedule.date', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Booking[];
    },

    async searchBookings(hotelId: string, searchQuery: string): Promise<Booking[]> {
        const allBookings = await bookingService.getHotelBookings(hotelId);
        const q = searchQuery.toLowerCase().trim();
        if (!q) return allBookings;

        return allBookings.filter((b) => {
            const code = (b.confirmationCode || '').toLowerCase();
            const name = (b.guestInfo?.name || '').toLowerCase();
            const room = (b.location?.roomNumber || '').toLowerCase();
            return code.includes(q) || name.includes(q) || room.includes(q);
        });
    },
};
