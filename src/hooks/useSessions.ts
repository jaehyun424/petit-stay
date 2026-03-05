// ============================================
// Petit Stay - Session Hooks
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { DEMO_MODE } from './useDemo';
import {
    DEMO_ACTIVE_SESSIONS,
    DEMO_LIVE_STATUS_LOGS,
    DEMO_LIVE_SESSION,
    DEMO_ACTIVE_SESSION_INFO,
    DEMO_CHECKLIST_ITEMS,
    type DemoActiveSession,
    type DemoActivityLog,
    type DemoLiveSession,
    type DemoActiveSessionInfo,
    type DemoChecklistItem,
} from '../data/demo';
import { sessionService, sitterService } from '../services/firestore';

// Helper: format elapsed time from a start Date
function formatElapsed(startTime: Date): string {
    const diff = Date.now() - startTime.getTime();
    if (diff < 0) return '0h 0m 0s';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// LRU cache for sitter name lookups (capped at 100 entries)
const CACHE_LIMIT = 100;
const sitterNameCache = new Map<string, string>();

function cachePut(key: string, value: string) {
    if (sitterNameCache.size >= CACHE_LIMIT) {
        const oldest = sitterNameCache.keys().next().value;
        if (oldest !== undefined) sitterNameCache.delete(oldest);
    }
    sitterNameCache.set(key, value);
}

async function resolveSitterName(sitterId: string): Promise<string> {
    if (!sitterId) return '';
    if (sitterNameCache.has(sitterId)) {
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

// ----------------------------------------
// Hotel Active Sessions Hook (for Dashboard + LiveMonitor)
// ----------------------------------------
export function useHotelSessions(hotelId?: string) {
    const [sessions, setSessions] = useState<DemoActiveSession[]>([]);
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
                setSessions(DEMO_ACTIVE_SESSIONS);
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

        // Use real-time subscription for live monitor
        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = sessionService.subscribeToHotelSessions(
                hotelId,
                async (fbSessions) => {
                    try {
                        // Resolve sitter names
                        const namePromises = fbSessions.map((s) => resolveSitterName(s.sitterId));
                        const names = await Promise.all(namePromises);

                        const mapped: DemoActiveSession[] = fbSessions.map((s, i) => ({
                            id: s.id,
                            sitter: { name: names[i] || s.sitterId, avatar: null, tier: 'silver' as const },
                            room: '',
                            children: [],
                            childrenText: '',
                            startTime: s.actualTimes.startedAt
                                ? new Date(s.actualTimes.startedAt as unknown as string).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                                : '',
                            endTime: '',
                            elapsed: '',
                            lastUpdate: '',
                            lastActivity: s.timeline.length > 0 ? s.timeline[s.timeline.length - 1].description : '',
                            activities: s.timeline.map((t) => ({
                                time: t.timestamp instanceof Date
                                    ? t.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                                    : '',
                                activity: t.description,
                                type: t.type,
                            })),
                            vitals: { mood: 'happy', energy: 'medium' },
                            status: 'active',
                        }));
                        setSessions(mapped);
                        setError(null);
                        setIsLoading(false);
                    } catch {
                        setError('Failed to load sessions');
                        setIsLoading(false);
                    }
                },
                () => {
                    setError('Failed to load sessions');
                    setIsLoading(false);
                }
            );
        } catch {
            setError('Failed to load sessions');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [hotelId, retryCount]);

    return { sessions, isLoading, error, retry };
}

// ----------------------------------------
// Parent Live Status Hook (for LiveStatus page)
// ----------------------------------------
export function useLiveStatus(sessionId?: string) {
    const [logs, setLogs] = useState<DemoActivityLog[]>([]);
    const [sessionInfo, setSessionInfo] = useState<DemoLiveSession>(DEMO_LIVE_SESSION);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);
    const liveStartTimeRef = useRef<Date | null>(null);

    useEffect(() => {
        if (DEMO_MODE) {
            // Synthetic start: 83 minutes ago
            const demoStart = new Date(Date.now() - 83 * 60 * 1000);
            liveStartTimeRef.current = demoStart;

            const timer = setTimeout(() => {
                setLogs(DEMO_LIVE_STATUS_LOGS);
                setSessionInfo({ ...DEMO_LIVE_SESSION, elapsedTime: formatElapsed(demoStart) });
                setError(null);
                setIsLoading(false);
            }, 400);
            return () => clearTimeout(timer);
        }

        if (!sessionId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = sessionService.subscribeToSession(sessionId, async (session) => {
                try {
                    if (!session) {
                        setIsLoading(false);
                        return;
                    }

                    setLogs(session.timeline.map((t: { id: string; type: string; timestamp: Date | unknown; description: string; mediaUrl?: string }) => ({
                        id: t.id,
                        timestamp: t.timestamp instanceof Date ? t.timestamp : new Date(),
                        type: t.type === 'check_in' ? 'checkin' as const
                            : t.type === 'meal' ? 'meal' as const
                            : t.type === 'photo' ? 'photo' as const
                            : 'status' as const,
                        content: t.description,
                        metadata: { photoUrl: t.mediaUrl },
                    })));

                    const startedAt = session.actualTimes?.startedAt;
                    if (startedAt) {
                        const start = startedAt instanceof Date ? startedAt : new Date(startedAt as unknown as string);
                        liveStartTimeRef.current = start;
                    }

                    const sitterName = await resolveSitterName(session.sitterId);
                    setSessionInfo({
                        sitterId: session.sitterId,
                        sitterName,
                        sitterTier: 'gold',
                        sitterLanguages: 'English/Korean',
                        elapsedTime: liveStartTimeRef.current ? formatElapsed(liveStartTimeRef.current) : '',
                    });

                    setError(null);
                    setIsLoading(false);
                } catch {
                    setError('Failed to load live status');
                    setIsLoading(false);
                }
            });
        } catch {
            setError('Failed to load live status');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [sessionId, retryCount]);

    // Live elapsed time counter — updates every second
    useEffect(() => {
        if (isLoading || !liveStartTimeRef.current) return;

        const interval = setInterval(() => {
            if (liveStartTimeRef.current) {
                setSessionInfo((prev) => ({ ...prev, elapsedTime: formatElapsed(liveStartTimeRef.current!) }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoading]);

    return { logs, sessionInfo, isLoading, error, retry };
}

// ----------------------------------------
// Sitter Active Session Hook
// ----------------------------------------
export function useActiveSession(userId?: string) {
    const [sessionInfo, setSessionInfo] = useState<DemoActiveSessionInfo>(DEMO_ACTIVE_SESSION_INFO);
    const [checklist, setChecklist] = useState<DemoChecklistItem[]>(DEMO_CHECKLIST_ITEMS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);
    const [sessionId, setSessionId] = useState<string | undefined>();
    const startTimeRef = useRef<Date | null>(null);

    useEffect(() => {
        if (DEMO_MODE) {
            // Synthetic start time: 83 minutes ago
            const demoStart = new Date(Date.now() - 83 * 60 * 1000);
            startTimeRef.current = demoStart;

            const timer = setTimeout(() => {
                setSessionInfo({ ...DEMO_ACTIVE_SESSION_INFO, elapsedTime: formatElapsed(demoStart) });
                setChecklist(DEMO_CHECKLIST_ITEMS);
                setSessionId('demo-session-1');
                setError(null);
                setIsLoading(false);
            }, 400);
            return () => clearTimeout(timer);
        }

        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let unsubscribe: (() => void) | undefined;
        // First, find the active session, then subscribe to it for real-time updates
        async function init() {
            try {
                const session = await sessionService.getActiveSession(userId!);
                if (!session) {
                    setIsLoading(false);
                    return;
                }

                setSessionId(session.id);

                // Subscribe for real-time timeline updates
                unsubscribe = sessionService.subscribeToSession(session.id, (liveSession) => {
                    if (!liveSession) return;

                    const startedAt = liveSession.actualTimes?.startedAt;
                    if (startedAt) {
                        const start = startedAt instanceof Date ? startedAt : new Date(startedAt as unknown as string);
                        startTimeRef.current = start;
                    }

                    setSessionInfo({
                        room: '',
                        children: '',
                        parent: liveSession.parentId,
                        endTime: '',
                        elapsedTime: startTimeRef.current ? formatElapsed(startTimeRef.current) : '',
                    });

                    const cl = liveSession.checklist;
                    setChecklist([
                        { id: '1', label: 'Pre-session: Wash hands', completed: true },
                        { id: '2', label: 'Verify child identity with photo', completed: cl.childInfo.allergiesConfirmed },
                        { id: '3', label: 'Review allergies & medical info', completed: cl.childInfo.allergiesConfirmed },
                        { id: '4', label: 'Check emergency contact info', completed: cl.roomSafety.emergencyExitKnown },
                        { id: '5', label: 'First activity started', completed: liveSession.timeline.length > 0 },
                        { id: '6', label: 'Snack served (if applicable)', completed: false },
                        { id: '7', label: 'Document any incidents', completed: false },
                    ]);

                    setError(null);
                    setIsLoading(false);
                });
            } catch {
                setError('Failed to load session');
                setIsLoading(false);
            }
        }

        init();
        return () => unsubscribe?.();
    }, [userId, retryCount]);

    // Live elapsed time counter — updates every second
    useEffect(() => {
        if (isLoading || !startTimeRef.current) return;

        const interval = setInterval(() => {
            if (startTimeRef.current) {
                setSessionInfo((prev) => ({ ...prev, elapsedTime: formatElapsed(startTimeRef.current!) }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoading]);

    const toggleChecklistItem = useCallback((id: string) => {
        setChecklist((prev) => {
            const updated = prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            );

            // Sync to Firestore in background (non-blocking)
            if (!DEMO_MODE && sessionId) {
                const checklistMap: Record<string, boolean> = {};
                updated.forEach((item) => { checklistMap[item.id] = item.completed; });
                sessionService.updateSession(sessionId, {
                    checklist: {
                        roomSafety: {
                            windowsSecured: checklistMap['1'] || false,
                            balconyLocked: false,
                            hazardsRemoved: false,
                            emergencyExitKnown: checklistMap['4'] || false,
                        },
                        childInfo: {
                            allergiesConfirmed: checklistMap['3'] || false,
                            medicationNoted: checklistMap['2'] || false,
                            sleepScheduleNoted: false,
                        },
                        supplies: {
                            diapersProvided: false,
                            snacksProvided: checklistMap['6'] || false,
                            toysAvailable: false,
                            emergencyKitReady: false,
                        },
                    },
                }).catch(() => { /* sync failure is non-critical */ });
            }

            return updated;
        });
    }, [sessionId]);

    return { sessionInfo, checklist, isLoading, toggleChecklistItem, sessionId, error, retry };
}
