// ============================================
// Petit Stay - Audit Log Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import { auditLogService, type AuditLogEntry, type AuditAction } from '../services/auditLog';

// ----------------------------------------
// Demo Data
// ----------------------------------------
const now = new Date();
function hoursAgo(n: number): Date {
    const d = new Date(now);
    d.setHours(d.getHours() - n);
    return d;
}
function daysAgo(n: number): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
}

const DEMO_AUDIT_LOG: AuditLogEntry[] = [
    { id: 'al-1', bookingId: 'BK-001', action: 'booking_created', details: 'Booking created via concierge', userId: 'u-staff-1', userName: 'Kim Yuna', timestamp: daysAgo(3) },
    { id: 'al-2', bookingId: 'BK-001', action: 'guest_consent_given', details: 'Guest consent form signed digitally', userId: 'u-parent-1', userName: 'Sarah Chen', timestamp: daysAgo(3) },
    { id: 'al-3', bookingId: 'BK-001', action: 'sitter_assigned', details: 'Park Jiwon (Gold) assigned', userId: 'u-staff-1', userName: 'Kim Yuna', timestamp: daysAgo(2) },
    { id: 'al-4', bookingId: 'BK-001', action: 'sitter_confirmed', details: 'Sitter confirmed assignment', userId: 'u-sitter-1', userName: 'Park Jiwon', timestamp: daysAgo(2) },
    { id: 'al-5', bookingId: 'BK-001', action: 'payment_received', details: 'Payment of ₩180,000 captured', userId: 'system', userName: 'System', timestamp: daysAgo(1) },
    { id: 'al-6', bookingId: 'BK-001', action: 'check_in_completed', details: 'Safe word verified, room safety checked', userId: 'u-sitter-1', userName: 'Park Jiwon', timestamp: hoursAgo(6) },
    { id: 'al-7', bookingId: 'BK-001', action: 'status_changed', details: 'Status changed to in_progress', userId: 'system', userName: 'System', timestamp: hoursAgo(6) },
    { id: 'al-8', bookingId: 'BK-001', action: 'check_out_completed', details: 'Session completed, all items returned', userId: 'u-sitter-1', userName: 'Park Jiwon', timestamp: hoursAgo(2) },
    { id: 'al-9', bookingId: 'BK-002', action: 'booking_created', details: 'Booking created via parent app', userId: 'u-parent-2', userName: 'Tanaka Yuki', timestamp: daysAgo(1) },
    { id: 'al-10', bookingId: 'BK-002', action: 'sitter_assigned', details: 'Lee Minji (Silver) assigned', userId: 'u-staff-1', userName: 'Kim Yuna', timestamp: hoursAgo(18) },
    { id: 'al-11', bookingId: 'BK-002', action: 'insurance_activated', details: 'Session insurance policy activated', userId: 'system', userName: 'System', timestamp: hoursAgo(12) },
    { id: 'al-12', bookingId: 'BK-003', action: 'booking_created', details: 'Booking created via concierge', userId: 'u-staff-2', userName: 'Choi Sungho', timestamp: hoursAgo(4) },
    { id: 'al-13', bookingId: 'BK-003', action: 'incident_reported', details: 'Minor scratch reported during play', userId: 'u-sitter-3', userName: 'Sato Ayumi', timestamp: hoursAgo(1) },
    { id: 'al-14', bookingId: 'BK-003', action: 'insurance_claimed', details: 'Insurance claim filed for incident #INC-012', userId: 'u-staff-2', userName: 'Choi Sungho', timestamp: hoursAgo(0.5) },
];

// ----------------------------------------
// Hook
// ----------------------------------------
export function useAuditLog(bookingId?: string) {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                const filtered = bookingId
                    ? DEMO_AUDIT_LOG.filter((e) => e.bookingId === bookingId)
                    : DEMO_AUDIT_LOG;
                setEntries(filtered);
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }

        if (!bookingId) {
            setEntries([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = auditLogService.subscribeToAuditLog(bookingId, (data) => {
                setEntries(data);
                setError(null);
                setIsLoading(false);
            });
        } catch {
            setError('Failed to load audit log');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [bookingId]);

    const logEntry = useCallback(async (
        action: AuditAction,
        details: string,
        userId: string,
        userName: string
    ) => {
        if (!bookingId) return;

        if (DEMO_MODE) {
            const newEntry: AuditLogEntry = {
                id: `al-demo-${Date.now()}`,
                bookingId,
                action,
                details,
                userId,
                userName,
                timestamp: new Date(),
            };
            setEntries((prev) => [newEntry, ...prev]);
            return;
        }

        await auditLogService.logAudit(bookingId, action, details, userId, userName);
    }, [bookingId]);

    return { entries, isLoading, error, logEntry };
}

/** Hook that returns all audit entries (no booking filter) for dashboard views */
export function useAllAuditLogs() {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                setEntries(DEMO_AUDIT_LOG);
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }

        // In real mode, audit logs are per-booking subcollections.
        // For a cross-booking dashboard, we'd use a Cloud Function to aggregate.
        // For now, return empty in real mode (hotel-level audit would require
        // iterating bookings, which the Safety page already has access to).
        setEntries([]);
        setIsLoading(false);
    }, []);

    return { entries, isLoading };
}
