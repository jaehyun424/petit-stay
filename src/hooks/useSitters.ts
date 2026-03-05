// ============================================
// Petit Stay - Sitter Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import {
    DEMO_SITTERS,
    DEMO_SITTER_STATS,
    DEMO_SITTER_PROFILE,
    type DemoSitter,
    type DemoSitterStats,
    type DemoSitterProfile,
} from '../data/demo';
import { sitterService } from '../services/firestore';

// ----------------------------------------
// Hotel Sitters Hook (for SitterManagement)
// ----------------------------------------
export function useHotelSitters(hotelId?: string) {
    const [sitters, setSitters] = useState<DemoSitter[]>([]);
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
                setSitters(DEMO_SITTERS);
                setError(null);
                setIsLoading(false);
            }, 600);
            return () => clearTimeout(timer);
        }

        if (!hotelId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = sitterService.subscribeToHotelSitters(
                hotelId,
                (fbSitters) => {
                    const mapped: DemoSitter[] = fbSitters.map((s) => ({
                        id: s.id,
                        name: s.profile.displayName,
                        tier: s.tier,
                        rating: s.stats.averageRating,
                        sessionsCompleted: s.stats.totalSessions,
                        languages: s.profile.languages,
                        certifications: s.certifications.map((c) => c.name),
                        availability: s.status === 'active' ? 'Available' : 'Inactive',
                        hourlyRate: s.pricing.hourlyRate,
                        safetyDays: s.stats.safetyRecord,
                    }));
                    setSitters(mapped);
                    setError(null);
                    setIsLoading(false);
                }
            );
        } catch {
            setError('Failed to load sitters');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [hotelId, retryCount]);

    return { sitters, isLoading, error, retry };
}

// ----------------------------------------
// Sitter Stats Hook (for Schedule + Profile)
// ----------------------------------------
export function useSitterStats(sitterId?: string) {
    const [stats, setStats] = useState<DemoSitterStats>(DEMO_SITTER_STATS);
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
                setStats(DEMO_SITTER_STATS);
                setError(null);
                setIsLoading(false);
            }, 400);
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
                const sitter = await sitterService.getSitter(sitterId!);
                if (cancelled) return;

                if (sitter) {
                    setStats({
                        totalSessions: sitter.stats.totalSessions,
                        avgRating: sitter.stats.averageRating,
                        safetyDays: sitter.stats.safetyRecord,
                        onTimeRate: `${Math.round((1 - sitter.stats.noShowCount / Math.max(sitter.stats.totalSessions, 1)) * 100)}%`,
                        tier: sitter.tier,
                    });
                }
                setError(null);
                setIsLoading(false);
            } catch {
                if (!cancelled) {
                    setError('Failed to load sitter stats');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [sitterId, retryCount]);

    return { stats, isLoading, error, retry };
}

// ----------------------------------------
// Sitter Profile Hook (for Profile page)
// ----------------------------------------
export function useSitterProfile(sitterId?: string) {
    const [profile, setProfile] = useState<DemoSitterProfile>(DEMO_SITTER_PROFILE);
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
                setProfile(DEMO_SITTER_PROFILE);
                setError(null);
                setIsLoading(false);
            }, 400);
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
                const sitter = await sitterService.getSitter(sitterId!);
                if (cancelled) return;

                if (sitter) {
                    setProfile({
                        name: sitter.profile.displayName,
                        tier: sitter.tier,
                        rating: sitter.stats.averageRating,
                        reviewCount: sitter.stats.ratingCount,
                        totalSessions: sitter.stats.totalSessions,
                        safetyDays: sitter.stats.safetyRecord,
                        onTimeRate: `${Math.round((1 - sitter.stats.noShowCount / Math.max(sitter.stats.totalSessions, 1)) * 100)}%`,
                        certifications: sitter.certifications.map((c) => c.name),
                        languages: sitter.profile.languages.map((lang) => ({
                            flag: '',
                            name: lang,
                            level: '',
                        })),
                    });
                }
                setError(null);
                setIsLoading(false);
            } catch {
                if (!cancelled) {
                    setError('Failed to load sitter profile');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [sitterId, retryCount]);

    return { profile, isLoading, error, retry };
}
