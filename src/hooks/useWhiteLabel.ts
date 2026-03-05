// ============================================
// Petit Stay - White Label Hook
// ============================================

import { useState, useEffect } from 'react';
import { DEMO_MODE } from './useDemo';
import {
  type HotelBranding,
  DEFAULT_BRANDING,
  getHotelBranding,
  applyBranding,
  clearBranding,
} from '../services/whiteLabel';

// ----------------------------------------
// Demo branding data
// ----------------------------------------
const DEMO_BRANDING: HotelBranding = {
  primaryColor: '#1C1C1C',
  secondaryColor: '#F9F9F7',
  accentColor: '#C5A059',
  logo: '',
  logoUrl: '',
  fontFamily: 'Playfair Display',
  hotelName: 'Grand Hyatt Seoul',
  tagline: 'Premium Hotel Childcare',
};

// ----------------------------------------
// Hook
// ----------------------------------------
export function useWhiteLabel(hotelId?: string) {
  const [branding, setBranding] = useState<HotelBranding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      const timer = setTimeout(() => {
        setBranding(DEMO_BRANDING);
        applyBranding(DEMO_BRANDING);
        setIsLoading(false);
      }, 200);
      return () => {
        clearTimeout(timer);
        clearBranding();
      };
    }

    if (!hotelId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const data = await getHotelBranding(hotelId!);
        if (cancelled) return;
        setBranding(data);
        applyBranding(data);
      } catch {
        // Falls back to DEFAULT_BRANDING
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      clearBranding();
    };
  }, [hotelId]);

  return { branding, isLoading };
}
