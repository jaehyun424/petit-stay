// ============================================
// Petit Stay - Ops Data Hook
// ============================================

import { useState, useEffect } from 'react';
import {
  DEMO_HOTEL_BOOKINGS,
  DEMO_SITTERS,
  DEMO_ACTIVE_SESSIONS,
  DEMO_INCIDENTS,
  DEMO_OPS_STATS,
  DEMO_OPS_HOTELS,
} from '../data/demo';
import type { DemoBooking, DemoSitter, DemoActiveSession, DemoIncident, DemoOpsStats, DemoOpsHotel } from '../data/demo';

interface UseOpsDataReturn {
  bookings: DemoBooking[];
  sitters: DemoSitter[];
  sessions: DemoActiveSession[];
  incidents: DemoIncident[];
  stats: DemoOpsStats;
  hotels: DemoOpsHotel[];
  isLoading: boolean;
}

export function useOpsData(): UseOpsDataReturn {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return {
    bookings: DEMO_HOTEL_BOOKINGS,
    sitters: DEMO_SITTERS,
    sessions: DEMO_ACTIVE_SESSIONS,
    incidents: DEMO_INCIDENTS,
    stats: DEMO_OPS_STATS,
    hotels: DEMO_OPS_HOTELS,
    isLoading,
  };
}
