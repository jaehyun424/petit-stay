// ============================================
// Petit Stay - Firestore Service
// Database operations for all entities
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

import { db } from './firebase';
import type {
    Booking,
    CareSession,
    Sitter,
    Child,
    Hotel,
    Incident,
    Notification,
    TimelineEvent,
    ReviewData,
    DashboardStats,
    Settlement,
    GuestConsent,
} from '../types';

// Activity log shape in Firestore (activityLogs collection)
interface ActivityLog {
    id: string;
    sessionId: string;
    type: string;
    description: string;
    timestamp: Date;
    mediaUrl?: string;
}

// ----------------------------------------
// Collection References
// ----------------------------------------
const COLLECTIONS = {
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
// Helper Functions
// ----------------------------------------
interface FirestoreTimestamp { toDate: () => Date }
const convertTimestamps = <T extends Record<string, unknown>>(data: T): T => {
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

// ----------------------------------------
// Booking Service
// ----------------------------------------
export const bookingService = {
    // Get all bookings for a hotel
    async getHotelBookings(hotelId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('hotelId', '==', hotelId),
            orderBy('scheduledStart', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Booking[];
    },

    // Get bookings for a parent
    async getParentBookings(parentId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('parentId', '==', parentId),
            orderBy('scheduledStart', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Booking[];
    },

    // Get bookings for a sitter
    async getSitterBookings(sitterId: string): Promise<Booking[]> {
        const q = query(
            collection(db, COLLECTIONS.bookings),
            where('sitterId', '==', sitterId),
            orderBy('scheduledStart', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Booking[];
    },

    // Create a new booking
    async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const bookingRef = doc(collection(db, COLLECTIONS.bookings));
        await setDoc(bookingRef, {
            ...booking,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return bookingRef.id;
    },

    // Update booking status
    async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            status,
            updatedAt: serverTimestamp(),
        });
    },

    // Listen to booking changes (real-time)
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

    // Get today's bookings for a hotel
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

    // Get booking stats for dashboard
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

    // Subscribe to hotel bookings (real-time)
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

    // Get booking by confirmation code
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

    // Update booking (generic)
    async updateBooking(bookingId: string, data: Partial<Booking>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    // Get bookings by date range for a hotel
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

    // Search bookings by confirmation code, guest name, or room number (client-side filter)
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

// ----------------------------------------
// Session Service
// ----------------------------------------
export const sessionService = {
    // Get active session for a booking
    async getActiveSession(bookingId: string): Promise<CareSession | null> {
        const q = query(
            collection(db, COLLECTIONS.sessions),
            where('bookingId', '==', bookingId),
            where('status', '==', 'in_progress')
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...convertTimestamps(doc.data()) } as CareSession;
    },

    // Start a session
    async startSession(session: Omit<CareSession, 'id'>): Promise<string> {
        const sessionRef = doc(collection(db, COLLECTIONS.sessions));
        await setDoc(sessionRef, {
            ...session,
            startTime: serverTimestamp(),
        });
        return sessionRef.id;
    },

    // End a session
    async endSession(sessionId: string, notes?: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.sessions, sessionId), {
            status: 'completed',
            endTime: serverTimestamp(),
            notes: notes || '',
        });
    },

    // Subscribe to session updates (real-time)
    subscribeToSession(sessionId: string, callback: (session: CareSession | null) => void, onError?: (error: Error) => void) {
        return onSnapshot(doc(db, COLLECTIONS.sessions, sessionId), (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...convertTimestamps(doc.data()) } as CareSession);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Firestore subscription error (session):', error);
            onError?.(error);
        });
    },

    // Get active sessions for a hotel
    async getHotelActiveSessions(hotelId: string): Promise<CareSession[]> {
        const q = query(
            collection(db, COLLECTIONS.sessions),
            where('hotelId', '==', hotelId),
            where('status', 'in', ['preparing', 'checked_in', 'active'])
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as CareSession[];
    },

    // Subscribe to hotel active sessions (real-time)
    subscribeToHotelSessions(hotelId: string, callback: (sessions: CareSession[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.sessions),
            where('hotelId', '==', hotelId),
            where('status', 'in', ['preparing', 'checked_in', 'active'])
        );
        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as CareSession[];
            callback(sessions);
        }, (error) => {
            console.error('Firestore subscription error (hotel sessions):', error);
            onError?.(error);
        });
    },

    // Update session
    async updateSession(sessionId: string, data: Partial<CareSession>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.sessions, sessionId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    // Add timeline event to session
    async addTimelineEvent(sessionId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>): Promise<void> {
        const sessionRef = doc(db, COLLECTIONS.sessions, sessionId);
        const sessionDoc = await getDoc(sessionRef);
        if (sessionDoc.exists()) {
            const session = sessionDoc.data();
            const timeline = session.timeline || [];
            timeline.push({
                ...event,
                id: `evt_${Date.now()}`,
                timestamp: new Date(),
            });
            await updateDoc(sessionRef, { timeline, updatedAt: serverTimestamp() });
        }
    },
};

// ----------------------------------------
// Activity Log Service
// ----------------------------------------
export const activityService = {
    // Get activity logs for a session
    async getSessionActivities(sessionId: string): Promise<ActivityLog[]> {
        const q = query(
            collection(db, COLLECTIONS.activityLogs),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as ActivityLog[];
    },

    // Log an activity
    async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> {
        const activityRef = doc(collection(db, COLLECTIONS.activityLogs));
        await setDoc(activityRef, {
            ...activity,
            timestamp: serverTimestamp(),
        });
        return activityRef.id;
    },

    // Subscribe to activity updates (real-time)
    subscribeToActivities(sessionId: string, callback: (activities: ActivityLog[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.activityLogs),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...convertTimestamps(doc.data()),
            })) as ActivityLog[];
            callback(activities);
        }, (error) => {
            console.error('Firestore subscription error (activities):', error);
            onError?.(error);
        });
    },
};

// ----------------------------------------
// Sitter Service
// ----------------------------------------
export const sitterService = {
    // Get all sitters for a hotel
    async getHotelSitters(hotelId: string): Promise<Sitter[]> {
        const q = query(
            collection(db, COLLECTIONS.users),
            where('role', '==', 'sitter'),
            where('hotelId', '==', hotelId)
        );
        const snapshot = await getDocs(q);
        // Cast: users collection docs have a superset of Sitter fields; safe structural overlap
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as unknown as Sitter[];
    },

    // Get sitter by ID
    async getSitter(sitterId: string): Promise<Sitter | null> {
        const docSnap = await getDoc(doc(db, COLLECTIONS.sitters, sitterId));
        if (!docSnap.exists()) {
            // Fallback: try users collection
            const userSnap = await getDoc(doc(db, COLLECTIONS.users, sitterId));
            if (!userSnap.exists()) return null;
            // Cast: users collection doc mapped to Sitter shape
            return { id: userSnap.id, ...convertTimestamps(userSnap.data()) } as unknown as Sitter;
        }
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Sitter;
    },

    // Update sitter profile
    async updateSitterProfile(sitterId: string, data: Partial<Sitter>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.sitters, sitterId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    // Get sitter completed sessions for earnings
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

    // Get sitter earnings filtered by date period
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

    // Subscribe to hotel sitters (real-time)
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

// ----------------------------------------
// Children Service
// ----------------------------------------
export const childrenService = {
    // Get children for a parent
    async getParentChildren(parentId: string): Promise<Child[]> {
        const q = query(
            collection(db, COLLECTIONS.children),
            where('parentId', '==', parentId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Child[];
    },

    // Add a child
    async addChild(child: Omit<Child, 'id'>): Promise<string> {
        const childRef = doc(collection(db, COLLECTIONS.children));
        await setDoc(childRef, child);
        return childRef.id;
    },

    // Update child info
    async updateChild(childId: string, data: Partial<Child>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.children, childId), data);
    },

    // Delete a child
    async deleteChild(childId: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTIONS.children, childId));
    },
};

// ----------------------------------------
// Review Service
// ----------------------------------------
export const reviewService = {
    // Get reviews for a sitter
    async getSitterReviews(sitterId: string): Promise<ReviewData[]> {
        const q = query(
            collection(db, COLLECTIONS.reviews),
            where('sitterId', '==', sitterId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        // Cast: Firestore review docs include id + ReviewData fields
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as unknown as ReviewData[];
    },

    // Create a review
    async createReview(review: Omit<ReviewData, 'createdAt'> & { bookingId: string; sitterId: string; parentId?: string }): Promise<string> {
        const reviewRef = doc(collection(db, COLLECTIONS.reviews));
        await setDoc(reviewRef, {
            ...review,
            createdAt: serverTimestamp(),
        });
        return reviewRef.id;
    },
};

// ----------------------------------------
// Hotel Service
// ----------------------------------------
export const hotelService = {
    // Get hotel by ID
    async getHotel(hotelId: string): Promise<Hotel | null> {
        const docSnap = await getDoc(doc(db, COLLECTIONS.hotels, hotelId));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Hotel;
    },

    // Update hotel settings
    async updateHotelSettings(hotelId: string, settings: Partial<Hotel>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.hotels, hotelId), {
            ...settings,
            updatedAt: serverTimestamp(),
        });
    },

    // Get all hotels
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

    // Subscribe to hotel (real-time)
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

// ----------------------------------------
// Incident Service
// ----------------------------------------
export const incidentService = {
    // Get incidents for a hotel
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

    // Create incident
    async createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const incidentRef = doc(collection(db, COLLECTIONS.incidents));
        await setDoc(incidentRef, {
            ...incident,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return incidentRef.id;
    },

    // Update incident
    async updateIncident(incidentId: string, data: Partial<Incident>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.incidents, incidentId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    // Subscribe to hotel incidents (real-time)
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

// ----------------------------------------
// Notification Service
// ----------------------------------------
export const notificationService = {
    // Get notifications for a user
    async getUserNotifications(userId: string): Promise<Notification[]> {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...convertTimestamps(d.data()),
        })) as Notification[];
    },

    // Create notification
    async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
        const notifRef = doc(collection(db, COLLECTIONS.notifications));
        await setDoc(notifRef, {
            ...notification,
            createdAt: serverTimestamp(),
        });
        return notifRef.id;
    },

    // Mark notification as read
    async markAsRead(notificationId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
            read: true,
        });
    },

    // Mark all as read (batched writes, max 500 per batch)
    async markAllAsRead(userId: string): Promise<void> {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs;

        for (let i = 0; i < docs.length; i += 500) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + 500);
            chunk.forEach((d) => {
                batch.update(doc(db, COLLECTIONS.notifications, d.id), { read: true });
            });
            await batch.commit();
        }
    },

    // Subscribe to user notifications (real-time)
    subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void, onError?: (error: Error) => void) {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map((d) => ({
                id: d.id,
                ...convertTimestamps(d.data()),
            })) as Notification[];
            callback(notifications);
        }, (error) => {
            console.error('Firestore subscription error (notifications):', error);
            onError?.(error);
        });
    },

    // Delete a notification
    async deleteNotification(notificationId: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTIONS.notifications, notificationId));
    },

    // Get unread count
    async getUnreadCount(userId: string): Promise<number> {
        const q = query(
            collection(db, COLLECTIONS.notifications),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    },
};

// ----------------------------------------
// Guest Token Service
// ----------------------------------------
export const guestService = {
    // Validate a guest token
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

    // Submit guest consent
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

    // Submit guest payment (dummy)
    async submitPayment(bookingId: string, paymentData: { method?: string; transactionId?: string }): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.bookings, bookingId), {
            'payment.status': 'authorized',
            'payment.method': paymentData.method || 'card',
            updatedAt: serverTimestamp(),
        });
    },

    // Submit guest feedback
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

// ----------------------------------------
// Settlement Service
// ----------------------------------------
export const settlementService = {
    // Get settlements (optionally filtered by hotel)
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

    // Create a settlement
    async createSettlement(data: Omit<Settlement, 'id' | 'status' | 'createdAt'>): Promise<string> {
        const ref = doc(collection(db, COLLECTIONS.settlements));
        await setDoc(ref, {
            ...data,
            status: 'draft',
            createdAt: serverTimestamp(),
        });
        return ref.id;
    },

    // Approve a settlement
    async approveSettlement(settlementId: string, approvedBy: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.settlements, settlementId), {
            status: 'approved',
            approvedBy,
            approvedAt: serverTimestamp(),
        });
    },

    // Mark settlement as paid
    async markAsPaid(settlementId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.settlements, settlementId), {
            status: 'paid',
            paidAt: serverTimestamp(),
        });
    },
};
