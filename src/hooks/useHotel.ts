// ============================================
// Petit Stay - Hotel Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import { DEMO_HOTELS, type DemoHotelOption } from '../data/demo';
import { hotelService } from '../services/firestore';
import type { Hotel } from '../types';

// ----------------------------------------
// Hotel Detail Hook (for hotel staff)
// ----------------------------------------
export function useHotel(hotelId?: string) {
    const [hotel, setHotel] = useState<Hotel | null>(null);
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
                // Provide a demo hotel object
                setHotel({
                    id: 'hotel-grand-hyatt',
                    name: 'Grand Hyatt Seoul',
                    nameI18n: { en: 'Grand Hyatt Seoul', ko: '그랜드 하얏트 서울', ja: 'グランドハイアットソウル', zh: '首尔君悦酒店' },
                    tier: 'luxury',
                    address: '322 Sowol-ro, Yongsan-gu, Seoul',
                    coordinates: { lat: 37.5398, lng: 126.9977 },
                    logo: '',
                    contactEmail: 'concierge@grandhyatt.com',
                    contactPhone: '+82-2-797-1234',
                    timezone: 'Asia/Seoul',
                    currency: 'KRW',
                    commission: 15,
                    settings: {
                        autoAssign: true,
                        requireGoldForInfant: true,
                        maxAdvanceBookingDays: 30,
                        minBookingHours: 2,
                        cancellationPolicy: 'moderate',
                    },
                    stats: {
                        totalBookings: 1247,
                        safetyDays: 127,
                        averageRating: 4.8,
                        thisMonthBookings: 89,
                        thisMonthRevenue: 42500000,
                    },
                    slaMetrics: {
                        responseRate: 98,
                        replacementRate: 2,
                        satisfactionRate: 96,
                    },
                    createdAt: new Date('2024-01-01'),
                    updatedAt: new Date(),
                });
                setError(null);
                setIsLoading(false);
            }, 400);
            return () => clearTimeout(timer);
        }

        if (!hotelId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Real-time subscription
        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = hotelService.subscribeToHotel(hotelId, (data) => {
                setHotel(data);
                setError(null);
                setIsLoading(false);
            });
        } catch {
            setError('Failed to load hotel data');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [hotelId, retryCount]);

    const updateHotel = useCallback(async (data: Partial<Hotel>) => {
        if (!hotelId) return;
        if (DEMO_MODE) {
            setHotel((prev) => prev ? { ...prev, ...data } as Hotel : null);
            return;
        }
        await hotelService.updateHotelSettings(hotelId, data);
    }, [hotelId]);

    return { hotel, isLoading, updateHotel, error, retry };
}

// ----------------------------------------
// Hotel List Hook (for parent booking selection)
// ----------------------------------------
export function useHotels() {
    const [hotels, setHotels] = useState<DemoHotelOption[]>([]);
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
                setHotels(DEMO_HOTELS);
                setError(null);
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }

        let cancelled = false;
        setIsLoading(true);

        async function load() {
            try {
                const fbHotels = await hotelService.getAllHotels();
                if (cancelled) return;
                const mapped: DemoHotelOption[] = fbHotels.map((h: Hotel) => ({
                    value: h.id,
                    label: h.name,
                }));
                setHotels(mapped);
                setError(null);
            } catch {
                if (!cancelled) {
                    setError('Failed to load hotels');
                    // Fallback to demo data on error
                    setHotels(DEMO_HOTELS);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [retryCount]);

    return { hotels, isLoading, error, retry };
}
