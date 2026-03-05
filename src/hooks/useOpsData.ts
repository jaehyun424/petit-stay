// ============================================
// Petit Stay - Ops Data Hook
// Transparently switches between demo and Firestore data
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import {
  DEMO_HOTEL_BOOKINGS,
  DEMO_SITTERS,
  DEMO_ACTIVE_SESSIONS,
  DEMO_INCIDENTS,
  DEMO_OPS_STATS,
  DEMO_OPS_HOTELS,
} from '../data/demo';
import type { DemoBooking, DemoSitter, DemoActiveSession, DemoIncident, DemoOpsStats, DemoOpsHotel } from '../data/demo';
import { bookingService, sessionService, incidentService, hotelService } from '../services/firestore';
import type { Hotel } from '../types';

interface UseOpsDataReturn {
  bookings: DemoBooking[];
  sitters: DemoSitter[];
  sessions: DemoActiveSession[];
  incidents: DemoIncident[];
  stats: DemoOpsStats;
  hotels: DemoOpsHotel[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useOpsData(): UseOpsDataReturn {
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [sitters, setSitters] = useState<DemoSitter[]>([]);
  const [sessions, setSessions] = useState<DemoActiveSession[]>([]);
  const [incidents, setIncidents] = useState<DemoIncident[]>([]);
  const [stats, setStats] = useState<DemoOpsStats>(DEMO_OPS_STATS);
  const [hotels, setHotels] = useState<DemoOpsHotel[]>([]);
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
        setSitters(DEMO_SITTERS);
        setSessions(DEMO_ACTIVE_SESSIONS);
        setIncidents(DEMO_INCIDENTS);
        setStats(DEMO_OPS_STATS);
        setHotels(DEMO_OPS_HOTELS);
        setIsLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    setIsLoading(true);

    async function load() {
      try {
        // Load all hotels first to iterate
        const fbHotels = await hotelService.getAllHotels();
        if (cancelled) return;

        // Aggregate bookings, sitters, incidents across all hotels
        const allBookingsP = fbHotels.map((h: Hotel) => bookingService.getHotelBookings(h.id));
        const allIncidentsP = fbHotels.map((h: Hotel) => incidentService.getHotelIncidents(h.id));
        const [allBookingsArr, allIncidentsArr] = await Promise.all([
          Promise.all(allBookingsP),
          Promise.all(allIncidentsP),
        ]);
        if (cancelled) return;

        const flatBookings = allBookingsArr.flat();
        const flatIncidents = allIncidentsArr.flat();

        // Map bookings to DemoBooking shape
        const mappedBookings: DemoBooking[] = flatBookings.map((b) => ({
          id: b.id,
          confirmationCode: b.confirmationCode,
          date: b.schedule.date instanceof Date
            ? b.schedule.date.toISOString().split('T')[0]
            : String(b.schedule.date),
          time: `${b.schedule.startTime} - ${b.schedule.endTime}`,
          room: b.location.roomNumber || '',
          parent: { name: b.parentId, phone: '' },
          children: b.children.map((c) => ({ name: c.firstName, age: c.age })),
          sitter: null,
          status: b.status as DemoBooking['status'],
          totalAmount: b.pricing.total,
        }));
        setBookings(mappedBookings);

        // Map incidents to DemoIncident shape
        const mappedIncidents: DemoIncident[] = flatIncidents.map((i) => ({
          id: i.id,
          severity: i.severity,
          category: i.category,
          summary: i.report.summary,
          status: i.resolution.status,
          reportedAt: i.report.reportedAt instanceof Date ? i.report.reportedAt : new Date(),
          sitterName: i.sitterId,
          childName: '',
        }));
        setIncidents(mappedIncidents);

        // Map hotels to DemoOpsHotel shape
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const mappedHotels: DemoOpsHotel[] = fbHotels.map((h: Hotel, idx: number) => {
          const hotelBookings = allBookingsArr[idx] || [];
          const monthBookings = hotelBookings.filter((b) => {
            const d = b.schedule?.date instanceof Date ? b.schedule.date : new Date(b.schedule?.date);
            return d >= thisMonth;
          });
          const revenue = monthBookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
          return {
            id: h.id,
            name: h.name,
            tier: h.tier,
            bookingsThisMonth: monthBookings.length,
            revenue,
            commission: revenue * ((h.commission || 15) / 100),
          };
        });
        setHotels(mappedHotels);

        // Build stats
        const openIncidents = flatIncidents.filter((i) => i.resolution.status === 'open').length;
        const totalRevenue = flatBookings
          .filter((b) => {
            const d = b.schedule?.date instanceof Date ? b.schedule.date : new Date(b.schedule?.date);
            return d >= thisMonth;
          })
          .reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
        const totalMonthBookings = flatBookings.filter((b) => {
          const d = b.schedule?.date instanceof Date ? b.schedule.date : new Date(b.schedule?.date);
          return d >= thisMonth;
        }).length;

        setStats({
          totalHotels: fbHotels.length,
          totalActiveSitters: 0, // Will be updated when sitters load
          totalBookingsThisMonth: totalMonthBookings,
          totalRevenueThisMonth: totalRevenue,
          avgSatisfaction: 0,
          openIssues: openIncidents,
          pendingSettlements: 0,
          slaCompliance: 0,
        });

        // Load active sessions across hotels
        const sessionsP = fbHotels.map((h: Hotel) => sessionService.getHotelActiveSessions(h.id));
        const allSessionsArr = await Promise.all(sessionsP);
        if (cancelled) return;
        const flatSessions = allSessionsArr.flat();
        const mappedSessions: DemoActiveSession[] = flatSessions.map((s) => ({
          id: s.id,
          sitter: { name: s.sitterId || '', avatar: null, tier: 'silver' as const },
          room: '',
          children: [],
          childrenText: '',
          startTime: s.actualTimes?.startedAt instanceof Date
            ? s.actualTimes.startedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            : '',
          endTime: '',
          elapsed: '',
          lastUpdate: '',
          lastActivity: '',
          activities: [],
          vitals: { mood: 'happy', energy: 'high' },
          status: 'active' as const,
        }));
        setSessions(mappedSessions);

        setStats((prev) => ({ ...prev, totalActiveSitters: mappedSessions.length }));

        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load ops data:', err);
        if (!cancelled) {
          setError('Failed to load operations data');
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [retryCount]);

  return { bookings, sitters, sessions, incidents, stats, hotels, isLoading, error, retry };
}
