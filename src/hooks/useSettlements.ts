// ============================================
// Petit Stay - Settlements Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_SETTLEMENTS } from '../data/demo';
import type { DemoSettlement } from '../data/demo';

interface UseSettlementsReturn {
  settlements: DemoSettlement[];
  isLoading: boolean;
  approveSettlement: (id: string) => void;
  markAsPaid: (id: string) => void;
}

export function useSettlements(): UseSettlementsReturn {
  const [settlements, setSettlements] = useState<DemoSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettlements([...DEMO_SETTLEMENTS]);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const approveSettlement = useCallback((id: string) => {
    setSettlements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
    );
  }, []);

  const markAsPaid = useCallback((id: string) => {
    setSettlements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'paid' as const } : s))
    );
  }, []);

  return { settlements, isLoading, approveSettlement, markAsPaid };
}
