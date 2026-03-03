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
} from '../data/demo';
import type { DemoBooking, DemoSitter, DemoActiveSession, DemoIncident, DemoOpsStats } from '../data/demo';

interface UseOpsDataReturn {
  bookings: DemoBooking[];
  sitters: DemoSitter[];
  sessions: DemoActiveSession[];
  incidents: DemoIncident[];
  stats: DemoOpsStats;
  hotels: { id: string; name: string; tier: string; bookingsThisMonth: number; revenue: number; commission: number }[];
  isLoading: boolean;
}

export function useOpsData(): UseOpsDataReturn {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const hotels = [
    { id: 'hotel-grand-hyatt', name: 'Grand Hyatt Seoul', tier: 'luxury', bookingsThisMonth: 62, revenue: 18600000, commission: 2790000 },
    { id: 'hotel-park-hyatt', name: 'Park Hyatt Busan', tier: 'luxury', bookingsThisMonth: 34, revenue: 10200000, commission: 1530000 },
    { id: 'hotel-four-seasons', name: 'Four Seasons Seoul', tier: 'premium', bookingsThisMonth: 58, revenue: 17400000, commission: 2610000 },
  ];

  return {
    bookings: DEMO_HOTEL_BOOKINGS,
    sitters: DEMO_SITTERS,
    sessions: DEMO_ACTIVE_SESSIONS,
    incidents: DEMO_INCIDENTS,
    stats: DEMO_OPS_STATS,
    hotels,
    isLoading,
  };
}
