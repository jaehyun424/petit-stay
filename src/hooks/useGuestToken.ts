// ============================================
// Petit Stay - Guest Token Hook
// ============================================

import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { DEMO_MODE } from './useDemo';
import { DEMO_GUEST_TOKENS } from '../data/demo';
import { DEMO_HOTEL_BOOKINGS } from '../data/demo';
import { functions } from '../services/firebase';

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

interface ValidateTokenResponse {
  bookingId: string;
  hotelId: string;
  confirmationCode: string;
  schedule: { date: string; startTime: string; endTime: string };
  children: { name: string; age: number }[];
  location: { roomNumber: string };
  pricing: { total: number };
  status: string;
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

      if (!token || !reservationId) {
        setError('invalid');
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      if (DEMO_MODE) {
        // Demo mode: validate against demo tokens
        await new Promise((r) => setTimeout(r, 800));

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
        return;
      }

      // Real mode: call Cloud Function validateGuestToken
      try {
        const validateGuestToken = httpsCallable<{ token: string }, ValidateTokenResponse>(functions, 'validateGuestToken');
        const result = await validateGuestToken({ token });
        const data = result.data;

        const scheduleDate = data.schedule.date || '';
        const startTime = data.schedule.startTime || '';
        const endTime = data.schedule.endTime || '';

        setReservation({
          id: data.bookingId,
          hotelName: data.hotelId, // Will be resolved by the component or a separate lookup
          roomNumber: data.location.roomNumber,
          guestName: '', // Not returned by Cloud Function for privacy
          date: scheduleDate,
          time: startTime && endTime ? `${startTime} - ${endTime}` : '',
          children: data.children,
          totalAmount: data.pricing.total,
          confirmationCode: data.confirmationCode,
          status: data.status,
        });
        setIsValid(true);
        setIsLoading(false);
      } catch (err: unknown) {
        const firebaseError = err as { code?: string };
        if (firebaseError.code === 'functions/deadline-exceeded') {
          setIsExpired(true);
        } else {
          setError('invalid');
        }
        setIsValid(false);
        setIsLoading(false);
      }
    };

    validateToken();
  }, [reservationId, token]);

  return { reservation, isLoading, isValid, isExpired, error };
}
