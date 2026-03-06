// ============================================
// Petit Stay - Infinite/Paginated Bookings Hook
// Cursor-based pagination for booking lists
// ============================================

import { useState, useCallback, useRef } from 'react';
import { DEMO_MODE } from '../common/useDemo';
import { DEMO_HOTEL_BOOKINGS, type DemoBooking } from '../../data/demo';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    type QueryDocumentSnapshot,
    type DocumentData,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

const PAGE_SIZE = 20;

export function useInfiniteBookings(hotelId?: string) {
    const [bookings, setBookings] = useState<DemoBooking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
    const demoOffsetRef = useRef(0);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            if (DEMO_MODE) {
                // Simulate paginated loading from demo data
                await new Promise((r) => setTimeout(r, 400));
                const offset = demoOffsetRef.current;
                const page = DEMO_HOTEL_BOOKINGS.slice(offset, offset + PAGE_SIZE);
                demoOffsetRef.current = offset + page.length;
                setBookings((prev) => [...prev, ...page]);
                setHasMore(offset + PAGE_SIZE < DEMO_HOTEL_BOOKINGS.length);
            } else {
                if (!hotelId) {
                    setHasMore(false);
                    return;
                }

                const q = lastDocRef.current
                    ? query(
                        collection(db, 'bookings'),
                        where('hotelId', '==', hotelId),
                        orderBy('schedule.date', 'desc'),
                        startAfter(lastDocRef.current),
                        limit(PAGE_SIZE),
                    )
                    : query(
                        collection(db, 'bookings'),
                        where('hotelId', '==', hotelId),
                        orderBy('schedule.date', 'desc'),
                        limit(PAGE_SIZE),
                    );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setHasMore(false);
                } else {
                    lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
                    const newBookings: DemoBooking[] = snapshot.docs.map((doc) => {
                        const d = doc.data();
                        return {
                            id: doc.id,
                            confirmationCode: d.confirmationCode || '',
                            date: d.schedule?.date || '',
                            time: `${d.schedule?.startTime || ''} - ${d.schedule?.endTime || ''}`,
                            room: d.location?.roomNumber || '',
                            parent: { name: d.parentId || '', phone: '' },
                            children: (d.children || []).map((c: { firstName: string; age: number }) => ({
                                name: c.firstName,
                                age: c.age,
                            })),
                            sitter: d.sitterId ? { name: d.sitterId, tier: 'silver' as const } : null,
                            status: d.status,
                            totalAmount: d.pricing?.total || 0,
                        };
                    });
                    setBookings((prev) => [...prev, ...newBookings]);
                    setHasMore(snapshot.docs.length === PAGE_SIZE);
                }
            }
        } catch {
            setError('Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    }, [hotelId, isLoading, hasMore]);

    const reset = useCallback(() => {
        setBookings([]);
        setHasMore(true);
        setError(null);
        lastDocRef.current = null;
        demoOffsetRef.current = 0;
    }, []);

    return { bookings, isLoading, hasMore, error, loadMore, reset };
}
