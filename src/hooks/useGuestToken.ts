// ============================================
// Petit Stay - Guest Token Hook
// ============================================

import { useState, useEffect } from 'react';
import { DEMO_GUEST_TOKENS } from '../data/demo';
import { DEMO_HOTEL_BOOKINGS } from '../data/demo';

interface GuestReservation {
  id: string;
  hotelName: string;
  roomNumber: string;
  guestName: string;
  date: string;
  time: string;
  children: { name: string; age: number }[];
  sitterName?: string;
  sitterTier?: 'gold' | 'silver';
  totalAmount: number;
  confirmationCode: string;
  status: string;
}

interface UseGuestTokenReturn {
  reservation: GuestReservation | null;
  isLoading: boolean;
  isValid: boolean;
  isExpired: boolean;
  error: string | null;
}

export function useGuestToken(reservationId: string | undefined, token: string | null): UseGuestTokenReturn {
  const [reservation, setReservation] = useState<GuestReservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));

      if (!token || !reservationId) {
        setError('invalid');
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      // Demo mode: validate against demo tokens
      const guestToken = DEMO_GUEST_TOKENS.find(
        (gt) => gt.token === token && gt.bookingId === reservationId
      );

      if (!guestToken) {
        // Also allow generic demo access
        if (token === 'demo-token' || token === 'demo') {
          const booking = DEMO_HOTEL_BOOKINGS[0];
          setReservation({
            id: reservationId,
            hotelName: 'Grand Hyatt Seoul',
            roomNumber: booking?.room || '2305',
            guestName: booking?.parent.name || 'Demo Guest',
            date: booking?.date || '2026-03-05',
            time: booking?.time || '18:00 - 22:00',
            children: booking?.children || [{ name: 'Emma', age: 5 }],
            sitterName: booking?.sitter?.name || 'Kim Minjung',
            sitterTier: booking?.sitter?.tier || 'gold',
            totalAmount: booking?.totalAmount || 280000,
            confirmationCode: booking?.confirmationCode || 'KCP-2026-0042',
            status: 'pending_guest_consent',
          });
          setIsValid(true);
          setIsLoading(false);
          return;
        }
        setError('invalid');
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      if (guestToken.expiresAt < new Date()) {
        setIsExpired(true);
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      const booking = DEMO_HOTEL_BOOKINGS.find((b) => b.id === '1') || DEMO_HOTEL_BOOKINGS[0];

      setReservation({
        id: reservationId,
        hotelName: 'Grand Hyatt Seoul',
        roomNumber: guestToken.room,
        guestName: guestToken.guestName,
        date: booking?.date || '2026-03-05',
        time: booking?.time || '18:00 - 22:00',
        children: booking?.children || [{ name: 'Emma', age: 5 }],
        sitterName: booking?.sitter?.name,
        sitterTier: booking?.sitter?.tier,
        totalAmount: booking?.totalAmount || 280000,
        confirmationCode: booking?.confirmationCode || 'KCP-2026-0042',
        status: 'pending_guest_consent',
      });
      setIsValid(true);
      setIsLoading(false);
    };

    validateToken();
  }, [reservationId, token]);

  return { reservation, isLoading, isValid, isExpired, error };
}
