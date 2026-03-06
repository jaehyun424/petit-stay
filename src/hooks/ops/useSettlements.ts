// ============================================
// Petit Stay - Settlements Hook
// Transparently switches between demo and Firestore data
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../common/useDemo';
import { DEMO_SETTLEMENTS } from '../../data/demo';
import type { DemoSettlement } from '../../data/demo';
import { settlementService } from '../../services/firestore';

interface UseSettlementsReturn {
  settlements: DemoSettlement[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  approveSettlement: (id: string) => void;
  markAsPaid: (id: string) => void;
}

export function useSettlements(hotelId?: string): UseSettlementsReturn {
  const [settlements, setSettlements] = useState<DemoSettlement[]>([]);
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
        setSettlements([...DEMO_SETTLEMENTS]);
        setError(null);
        setIsLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    setIsLoading(true);

    async function load() {
      try {
        const fbSettlements = await settlementService.getSettlements(hotelId);
        if (cancelled) return;

        const mapped: DemoSettlement[] = fbSettlements.map((s) => ({
          id: s.id,
          hotelId: s.hotelId,
          hotelName: s.hotelName,
          period: s.period.start instanceof Date && s.period.end instanceof Date
            ? `${s.period.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            : '',
          totalBookings: s.totalBookings,
          totalRevenue: s.totalRevenue,
          commission: s.commission,
          commissionRate: s.commissionRate,
          netPayout: s.netPayout,
          status: s.status,
          createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(),
        }));
        setSettlements(mapped);
        setError(null);
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setError('Failed to load settlements');
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [hotelId, retryCount]);

  const approveSettlement = useCallback(async (id: string) => {
    if (DEMO_MODE) {
      setSettlements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
      );
      return;
    }
    try {
      await settlementService.approveSettlement(id, 'ops-admin');
      setSettlements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
      );
    } catch {
      setError('Failed to approve settlement');
    }
  }, []);

  const markAsPaid = useCallback(async (id: string) => {
    if (DEMO_MODE) {
      setSettlements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'paid' as const } : s))
      );
      return;
    }
    try {
      await settlementService.markAsPaid(id);
      setSettlements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'paid' as const } : s))
      );
    } catch {
      setError('Failed to mark settlement as paid');
    }
  }, []);

  return { settlements, isLoading, error, retry, approveSettlement, markAsPaid };
}
