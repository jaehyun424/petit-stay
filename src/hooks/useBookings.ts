// ============================================
// Petit Stay - Booking Hooks
// Transparently switches between demo and Firestore data
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import {
    DEMO_HOTEL_BOOKINGS,
    DEMO_DASHBOARD_STATS,
    DEMO_UPCOMING_BOOKING,
    DEMO_HISTORY,
    DEMO_RECENT_SESSIONS,
    DEMO_TODAY_SESSIONS,
    DEMO_WEEK_SCHEDULE,
    type DemoBooking,
    type DemoUpcomingBooking,
    type DemoHistoryItem,
    type DemoRecentSession,
    type DemoSitterSession,
    type DemoWeekDay,
} from '../data/demo';
import { bookingService, sitterService } from '../services/firestore';
import type { DashboardStats } from '../types';

// LRU cache for sitter name lookups (capped at 100 entries)
const CACHE_LIMIT = 100;
const sitterNameCache = new Map<string, string>();

function cachePut(key: string, value: string) {
    if (sitterNameCache.size >= CACHE_LIMIT) {
        // Evict oldest entry (first key in Map iteration order)
        const oldest = sitterNameCache.keys().next().value;
        if (oldest !== undefined) sitterNameCache.delete(oldest);
    }
    sitterNameCache.set(key, value);
}

async function resolveSitterName(sitterId: string): Promise<string> {
    if (!sitterId) return '';
    if (sitterNameCache.has(sitterId)) {
        // Move to end (most recently used)
        const val = sitterNameCache.get(sitterId)!;
        sitterNameCache.delete(sitterId);
        sitterNameCache.set(sitterId, val);
        return val;
    }
    try {
        const sitter = await sitterService.getSitter(sitterId);
        const name = sitter?.profile?.displayName || sitterId;
        cachePut(sitterId, name);
        return name;
    } catch {
        return sitterId;
    }
}

async function resolveSitterNames(sitterIds: string[]): Promise<Map<string, string>> {
    const unique = [...new Set(sitterIds.filter(Boolean))];
    const results = new Map<string, string>();
    await Promise.all(unique.map(async (id) => {
        results.set(id, await resolveSitterName(id));
    }));
    return results;
}

// ----------------------------------------
// Hotel Bookings Hook
// ----------------------------------------
export function useHotelBookings(hotelId?: string) {
    const [bookings, setBookings] = useState<DemoBooking[]>([]);
    const [stats, setStats] = useState<DashboardStats>(DEMO_DASHBOARD_STATS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                setBookings(DEMO_HOTEL_BOOKINGS);
                setStats(DEMO_DASHBOARD_STATS);
                setError(null);
                setIsLoading(false);
            }, 600);
            return () => clearTimeout(timer);
        }

        if (!hotelId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function load() {
            try {
                const [fbBookings, fbStats] = await Promise.all([
                    bookingService.getHotelBookings(hotelId!),
                    bookingService.getBookingStats(hotelId!),
                ]);
                if (!cancelled) {
                    // Resolve sitter names
                    const sitterIds = fbBookings.map((b) => b.sitterId).filter(Boolean) as string[];
                    const nameMap = await resolveSitterNames(sitterIds);

                    // Transform Firestore bookings to DemoBooking shape
                    const mapped: DemoBooking[] = fbBookings.map((b) => ({
                        id: b.id,
                        confirmationCode: b.confirmationCode,
                        date: b.schedule.date instanceof Date
                            ? b.schedule.date.toISOString().split('T')[0]
                            : String(b.schedule.date),
                        time: `${b.schedule.startTime} - ${b.schedule.endTime}`,
                        room: b.location.roomNumber || '',
                        parent: { name: b.parentId, phone: '' },
                        children: b.children.map((c) => ({ name: c.firstName, age: c.age })),
                        sitter: b.sitterId ? { name: nameMap.get(b.sitterId) || b.sitterId, tier: 'silver' as const } : null,
                        status: b.status as DemoBooking['status'],
                        totalAmount: b.pricing.total,
                    }));
                    setBookings(mapped);
                    setStats(fbStats);
                    setError(null);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to load hotel bookings:', err);
                if (!cancelled) {
                    setError('Failed to load bookings');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [hotelId, retryCount]);

    return { bookings, stats, isLoading, error, retry };
}

// ----------------------------------------
// Parent Bookings Hook
// ----------------------------------------
export function useParentBookings(parentId?: string) {
    const [upcomingBooking, setUpcomingBooking] = useState<DemoUpcomingBooking | null>(null);
    const [history, setHistory] = useState<DemoHistoryItem[]>([]);
    const [recentSessions, setRecentSessions] = useState<DemoRecentSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                setUpcomingBooking(DEMO_UPCOMING_BOOKING);
                setHistory(DEMO_HISTORY);
                setRecentSessions(DEMO_RECENT_SESSIONS);
                setError(null);
                setIsLoading(false);
            }, 600);
            return () => clearTimeout(timer);
        }

        if (!parentId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function load() {
            try {
                const fbBookings = await bookingService.getParentBookings(parentId!);
                if (cancelled) return;

                // Resolve sitter names
                const sitterIds = fbBookings.map((b) => b.sitterId).filter(Boolean) as string[];
                const nameMap = await resolveSitterNames(sitterIds);

                // Find upcoming (confirmed, future)
                const upcoming = fbBookings.find((b) =>
                    b.status === 'confirmed' || b.status === 'pending'
                );

                if (upcoming) {
                    const sitterName = upcoming.sitterId ? (nameMap.get(upcoming.sitterId) || upcoming.sitterId) : '';
                    setUpcomingBooking({
                        id: upcoming.id,
                        confirmationCode: upcoming.confirmationCode,
                        dateKey: 'tonight',
                        time: `${upcoming.schedule.startTime} - ${upcoming.schedule.endTime}`,
                        hotel: upcoming.hotelId,
                        room: upcoming.location.roomNumber || '',
                        sitter: { name: sitterName, rating: 0 },
                        childrenIds: upcoming.children.map((c) => c.childId),
                        status: upcoming.status as 'confirmed' | 'pending',
                    });
                }

                // Completed bookings → history
                const completed = fbBookings.filter((b) => b.status === 'completed');
                setHistory(completed.map((b) => ({
                    id: b.id,
                    date: b.schedule.date instanceof Date
                        ? b.schedule.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : String(b.schedule.date),
                    time: `${b.schedule.startTime}-${b.schedule.endTime}`,
                    hotel: b.hotelId,
                    sitter: b.sitterId ? (nameMap.get(b.sitterId) || b.sitterId) : '',
                    duration: `${b.schedule.duration}h`,
                    amount: b.pricing.total,
                    rating: b.review?.rating || 0,
                    status: 'completed',
                })));

                setRecentSessions(completed.slice(0, 3).map((b) => ({
                    id: b.id,
                    date: b.schedule.date instanceof Date ? b.schedule.date : new Date(),
                    hotel: b.hotelId,
                    durationHours: b.schedule.duration,
                    rating: b.review?.rating || 0,
                })));

                setError(null);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load parent bookings:', err);
                if (!cancelled) {
                    setError('Failed to load bookings');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [parentId, retryCount]);

    return { upcomingBooking, history, recentSessions, isLoading, error, retry };
}

// ----------------------------------------
// Sitter Bookings Hook
// ----------------------------------------
export function useSitterBookings(sitterId?: string) {
    const [todaySessions, setTodaySessions] = useState<DemoSitterSession[]>([]);
    const [weekSchedule, setWeekSchedule] = useState<DemoWeekDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                setTodaySessions(DEMO_TODAY_SESSIONS);
                setWeekSchedule(DEMO_WEEK_SCHEDULE);
                setError(null);
                setIsLoading(false);
            }, 600);
            return () => clearTimeout(timer);
        }

        if (!sitterId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function load() {
            try {
                const fbBookings = await bookingService.getSitterBookings(sitterId!);
                if (cancelled) return;

                const today = new Date().toISOString().split('T')[0];
                const todayBookings = fbBookings.filter((b) => {
                    const d = b.schedule.date instanceof Date
                        ? b.schedule.date.toISOString().split('T')[0]
                        : String(b.schedule.date);
                    return d === today;
                });

                setTodaySessions(todayBookings.map((b) => ({
                    id: b.id,
                    time: `${b.schedule.startTime} - ${b.schedule.endTime}`,
                    room: b.location.roomNumber || '',
                    hotel: b.hotelId,
                    children: b.children.map((c) => `${c.firstName} (${c.age})`),
                    status: b.status as 'confirmed' | 'pending' | 'in_progress',
                })));

                // Build week schedule from actual booking data
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0=Sun
                const monday = new Date(now);
                monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
                monday.setHours(0, 0, 0, 0);

                const weekDays: DemoWeekDay[] = [];
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                for (let i = 0; i < 7; i++) {
                    const dayDate = new Date(monday);
                    dayDate.setDate(monday.getDate() + i);
                    const dayStr = dayDate.toISOString().split('T')[0];
                    const count = fbBookings.filter((b) => {
                        const d = b.schedule.date instanceof Date
                            ? b.schedule.date.toISOString().split('T')[0]
                            : String(b.schedule.date);
                        return d === dayStr;
                    }).length;
                    weekDays.push({ date: `${dayNames[i]} ${dayDate.getDate()}`, sessions: count });
                }
                setWeekSchedule(weekDays);
                setError(null);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load sitter bookings:', err);
                if (!cancelled) {
                    setError('Failed to load schedule');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [sitterId, retryCount]);

    const createBooking = useCallback(async (data: Omit<import('../types').Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (DEMO_MODE) {
            await new Promise((r) => setTimeout(r, 1000));
            return 'demo-booking-' + Date.now();
        }
        const booking = await bookingService.createBooking(data);
        return booking;
    }, []);

    return { todaySessions, weekSchedule, isLoading, createBooking, error, retry };
}
