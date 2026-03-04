// ============================================
// Petit Stay - Pricing Engine
// Dynamic price calculation with surcharges
// ============================================

import type { SitterTier, Currency } from '../types';

// ----------------------------------------
// Types
// ----------------------------------------
export interface PricingInput {
  baseRate: number;
  hours: number;
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  date: Date;
  childrenCount: number;
  sitterTier: SitterTier | 'any';
  currency?: Currency;
  isUrgent?: boolean; // booking made within 2 hours of start
}

export interface PricingBreakdown {
  baseRate: number;
  hours: number;
  nightSurcharge: number;
  weekendSurcharge: number;
  urgentSurcharge: number;
  additionalChildrenSurcharge: number;
  goldSitterSurcharge: number;
  subtotal: number;
  total: number;
  currency: Currency;
  breakdown: string[];
}

// ----------------------------------------
// Surcharge Rate Constants
// ----------------------------------------
const NIGHT_MULTIPLIER = 1.5;
const WEEKEND_MULTIPLIER = 1.3;
const URGENT_MULTIPLIER = 1.5;
const ADDITIONAL_CHILD_RATE = 0.3; // +30% per child from 2nd
const GOLD_SITTER_MULTIPLIER = 1.4;

// Night hours: 22:00 ~ 06:00
const NIGHT_START = 22;
const NIGHT_END = 6;

// ----------------------------------------
// Helper Functions
// ----------------------------------------

/** Parse "HH:mm" to hour number (e.g. "22:30" -> 22.5) */
function parseHour(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + (m || 0) / 60;
}

/** Calculate the fraction of hours that fall within night time (22:00~06:00) */
export function getNightHours(startTime: string, endTime: string): number {
  const start = parseHour(startTime);
  let end = parseHour(endTime);

  // Handle overnight (e.g. 21:00 -> 02:00)
  if (end <= start) end += 24;

  let nightHours = 0;
  for (let h = Math.floor(start); h < Math.ceil(end); h++) {
    const hourStart = Math.max(h, start);
    const hourEnd = Math.min(h + 1, end);
    const fraction = hourEnd - hourStart;
    const normalizedHour = h % 24;
    if (normalizedHour >= NIGHT_START || normalizedHour < NIGHT_END) {
      nightHours += fraction;
    }
  }
  return nightHours;
}

/** Check if a date falls on a weekend (Saturday or Sunday) */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Check if booking is urgent (start time within 2 hours from now) */
export function isUrgentBooking(date: Date, startTime: string): boolean {
  const now = new Date();
  const bookingStart = new Date(date);
  const [h, m] = startTime.split(':').map(Number);
  bookingStart.setHours(h, m || 0, 0, 0);

  const diffMs = bookingStart.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 2;
}

/** Calculate night surcharge amount */
export function calculateNightSurcharge(baseRate: number, startTime: string, endTime: string): number {
  const nightHours = getNightHours(startTime, endTime);
  if (nightHours <= 0) return 0;
  return Math.round(baseRate * nightHours * (NIGHT_MULTIPLIER - 1));
}

/** Calculate weekend surcharge amount */
export function calculateWeekendSurcharge(baseTotal: number, date: Date): number {
  if (!isWeekend(date)) return 0;
  return Math.round(baseTotal * (WEEKEND_MULTIPLIER - 1));
}

/** Calculate urgent booking surcharge */
export function calculateUrgentSurcharge(baseTotal: number, isUrgent: boolean): number {
  if (!isUrgent) return 0;
  return Math.round(baseTotal * (URGENT_MULTIPLIER - 1));
}

/** Calculate additional children surcharge (+30% per child from 2nd) */
export function calculateAdditionalChildrenSurcharge(baseTotal: number, childrenCount: number): number {
  if (childrenCount <= 1) return 0;
  const additionalChildren = childrenCount - 1;
  return Math.round(baseTotal * ADDITIONAL_CHILD_RATE * additionalChildren);
}

/** Calculate gold sitter tier surcharge */
export function calculateGoldSitterSurcharge(baseTotal: number, sitterTier: SitterTier | 'any'): number {
  if (sitterTier !== 'gold') return 0;
  return Math.round(baseTotal * (GOLD_SITTER_MULTIPLIER - 1));
}

// ----------------------------------------
// Main Pricing Calculator
// ----------------------------------------
export function calculatePrice(input: PricingInput): PricingBreakdown {
  const {
    baseRate,
    hours,
    startTime,
    endTime,
    date,
    childrenCount,
    sitterTier,
    currency = 'KRW',
  } = input;

  const urgent = input.isUrgent ?? isUrgentBooking(date, startTime);
  const baseTotal = baseRate * hours;
  const breakdown: string[] = [];

  // Base rate
  breakdown.push('pricing.baseRateLine');

  // Night surcharge
  const nightSurcharge = calculateNightSurcharge(baseRate, startTime, endTime);
  if (nightSurcharge > 0) breakdown.push('pricing.nightSurchargeLine');

  // Weekend surcharge
  const weekendSurcharge = calculateWeekendSurcharge(baseTotal, date);
  if (weekendSurcharge > 0) breakdown.push('pricing.weekendSurchargeLine');

  // Urgent surcharge
  const urgentSurcharge = calculateUrgentSurcharge(baseTotal, urgent);
  if (urgentSurcharge > 0) breakdown.push('pricing.urgentSurchargeLine');

  // Additional children
  const additionalChildrenSurcharge = calculateAdditionalChildrenSurcharge(baseTotal, childrenCount);
  if (additionalChildrenSurcharge > 0) breakdown.push('pricing.additionalChildrenLine');

  // Gold sitter
  const goldSitterSurcharge = calculateGoldSitterSurcharge(baseTotal, sitterTier);
  if (goldSitterSurcharge > 0) breakdown.push('pricing.goldSitterLine');

  const subtotal = baseTotal + nightSurcharge + weekendSurcharge + urgentSurcharge + additionalChildrenSurcharge + goldSitterSurcharge;
  const total = subtotal;

  return {
    baseRate,
    hours,
    nightSurcharge,
    weekendSurcharge,
    urgentSurcharge,
    additionalChildrenSurcharge,
    goldSitterSurcharge,
    subtotal,
    total,
    currency,
    breakdown,
  };
}
