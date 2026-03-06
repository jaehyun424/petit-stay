// ============================================
// Petit Stay - Incident Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../common/useDemo';
import { DEMO_INCIDENTS, type DemoIncident } from '../../data/demo';
import { incidentService } from '../../services/firestore';
import type { Incident } from '../../types';

// ----------------------------------------
// Hotel Incidents Hook (for SafetyDashboard)
// ----------------------------------------
export function useHotelIncidents(hotelId?: string) {
    const [incidents, setIncidents] = useState<DemoIncident[]>([]);
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
                setIncidents(DEMO_INCIDENTS);
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
            unsubscribe = incidentService.subscribeToHotelIncidents(
                hotelId,
                (fbIncidents) => {
                    const mapped: DemoIncident[] = fbIncidents.map((i) => ({
                        id: i.id,
                        severity: i.severity,
                        category: i.category,
                        summary: i.report.summary,
                        status: i.resolution.status,
                        reportedAt: i.report.reportedAt instanceof Date ? i.report.reportedAt : new Date(),
                        sitterName: i.sitterId,
                        childName: '',
                    }));
                    setIncidents(mapped);
                    setError(null);
                    setIsLoading(false);
                }
            );
        } catch {
            setError('Failed to load incidents');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [hotelId, retryCount]);

    const createIncident = useCallback(async (data: Partial<Incident>) => {
        if (DEMO_MODE) {
            const newIncident: DemoIncident = {
                id: 'demo-incident-' + Date.now(),
                severity: data.severity || 'low',
                category: data.category || 'other',
                summary: data.report?.summary || '',
                status: 'open',
                reportedAt: new Date(),
                sitterName: data.sitterId || '',
                childName: '',
            };
            setIncidents((prev) => [newIncident, ...prev]);
            return newIncident.id;
        }

        if (!hotelId) return '';
        return incidentService.createIncident(data as Incident);
    }, [hotelId]);

    const updateIncidentStatus = useCallback(async (
        incidentId: string,
        status: DemoIncident['status']
    ) => {
        if (DEMO_MODE) {
            setIncidents((prev) =>
                prev.map((i) => i.id === incidentId ? { ...i, status } : i)
            );
            return;
        }
        await incidentService.updateIncident(incidentId, {
            resolution: { status } as Incident['resolution'],
        });
    }, []);

    return { incidents, isLoading, createIncident, updateIncidentStatus, error, retry };
}
