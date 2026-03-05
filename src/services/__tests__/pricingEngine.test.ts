import { describe, it, expect } from 'vitest';
import {
  calculatePrice,
  getNightHours,
  isWeekend,
  calculateNightSurcharge,
  calculateWeekendSurcharge,
  calculateUrgentSurcharge,
  calculateAdditionalChildrenSurcharge,
  calculateGoldSitterSurcharge,
} from '../pricingEngine';

describe('pricingEngine', () => {
  describe('getNightHours', () => {
    it('returns 0 for daytime-only booking', () => {
      expect(getNightHours('10:00', '14:00')).toBe(0);
    });

    it('counts night hours for late evening booking', () => {
      // 20:00-00:00 → 22:00-00:00 = 2 night hours
      expect(getNightHours('20:00', '00:00')).toBe(2);
    });

    it('counts night hours for early morning booking', () => {
      // 04:00-08:00 → 04:00-06:00 = 2 night hours
      expect(getNightHours('04:00', '08:00')).toBe(2);
    });

    it('counts overnight booking night hours', () => {
      // 21:00-02:00 → 22:00-02:00 = 4 night hours
      expect(getNightHours('21:00', '02:00')).toBe(4);
    });

    it('returns 0 for booking entirely in daytime', () => {
      expect(getNightHours('09:00', '17:00')).toBe(0);
    });
  });

  describe('isWeekend', () => {
    it('returns true for Saturday', () => {
      expect(isWeekend(new Date('2026-03-07'))).toBe(true); // Saturday
    });

    it('returns true for Sunday', () => {
      expect(isWeekend(new Date('2026-03-08'))).toBe(true); // Sunday
    });

    it('returns false for Wednesday', () => {
      expect(isWeekend(new Date('2026-03-04'))).toBe(false); // Wednesday
    });
  });

  describe('calculateNightSurcharge', () => {
    it('returns 0 for daytime booking', () => {
      expect(calculateNightSurcharge(60000, '10:00', '14:00')).toBe(0);
    });

    it('calculates surcharge for night hours (1.5x - 1 = 0.5x)', () => {
      // 20:00-00:00 → 2 night hours * 60000 * 0.5
      const result = calculateNightSurcharge(60000, '20:00', '00:00');
      expect(result).toBe(60000); // 2 * 60000 * 0.5
    });
  });

  describe('calculateWeekendSurcharge', () => {
    it('returns 0 for weekday', () => {
      expect(calculateWeekendSurcharge(240000, new Date('2026-03-04'))).toBe(0);
    });

    it('returns 30% surcharge for weekend', () => {
      const result = calculateWeekendSurcharge(240000, new Date('2026-03-07')); // Saturday
      expect(result).toBe(72000); // 240000 * 0.3
    });
  });

  describe('calculateUrgentSurcharge', () => {
    it('returns 0 when not urgent', () => {
      expect(calculateUrgentSurcharge(240000, false)).toBe(0);
    });

    it('returns 50% surcharge when urgent', () => {
      expect(calculateUrgentSurcharge(240000, true)).toBe(120000);
    });
  });

  describe('calculateAdditionalChildrenSurcharge', () => {
    it('returns 0 for single child', () => {
      expect(calculateAdditionalChildrenSurcharge(240000, 1)).toBe(0);
    });

    it('returns 30% for 2 children', () => {
      expect(calculateAdditionalChildrenSurcharge(240000, 2)).toBe(72000);
    });

    it('returns 60% for 3 children', () => {
      expect(calculateAdditionalChildrenSurcharge(240000, 3)).toBe(144000);
    });

    it('returns 0 for 0 children', () => {
      expect(calculateAdditionalChildrenSurcharge(240000, 0)).toBe(0);
    });
  });

  describe('calculateGoldSitterSurcharge', () => {
    it('returns 0 for silver tier', () => {
      expect(calculateGoldSitterSurcharge(240000, 'silver')).toBe(0);
    });

    it('returns 0 for any tier', () => {
      expect(calculateGoldSitterSurcharge(240000, 'any')).toBe(0);
    });

    it('returns 40% surcharge for gold tier', () => {
      expect(calculateGoldSitterSurcharge(240000, 'gold')).toBe(96000);
    });
  });

  describe('calculatePrice', () => {
    it('calculates base price without surcharges', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '10:00',
        endTime: '14:00',
        date: new Date('2026-03-04'), // Wednesday
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      expect(result.baseRate).toBe(60000);
      expect(result.hours).toBe(4);
      expect(result.nightSurcharge).toBe(0);
      expect(result.weekendSurcharge).toBe(0);
      expect(result.urgentSurcharge).toBe(0);
      expect(result.additionalChildrenSurcharge).toBe(0);
      expect(result.goldSitterSurcharge).toBe(0);
      expect(result.total).toBe(240000);
      expect(result.currency).toBe('KRW');
    });

    it('applies night surcharge for evening booking', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '20:00',
        endTime: '00:00',
        date: new Date('2026-03-04'), // Wednesday
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      expect(result.nightSurcharge).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(240000);
    });

    it('applies weekend surcharge for Saturday', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '10:00',
        endTime: '14:00',
        date: new Date('2026-03-07'), // Saturday
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      expect(result.weekendSurcharge).toBe(72000);
    });

    it('applies urgent surcharge', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '10:00',
        endTime: '14:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: true,
      });

      expect(result.urgentSurcharge).toBe(120000);
    });

    it('applies additional children surcharge', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '10:00',
        endTime: '14:00',
        date: new Date('2026-03-04'),
        childrenCount: 3,
        sitterTier: 'silver',
        isUrgent: false,
      });

      expect(result.additionalChildrenSurcharge).toBe(144000); // 240000 * 0.3 * 2
    });

    it('applies gold sitter surcharge', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '10:00',
        endTime: '14:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'gold',
        isUrgent: false,
      });

      expect(result.goldSitterSurcharge).toBe(96000);
    });

    it('combines multiple surcharges correctly', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '20:00',
        endTime: '00:00',
        date: new Date('2026-03-07'), // Saturday
        childrenCount: 2,
        sitterTier: 'gold',
        isUrgent: true,
      });

      const baseTotal = 60000 * 4;
      expect(result.total).toBe(
        baseTotal +
        result.nightSurcharge +
        result.weekendSurcharge +
        result.urgentSurcharge +
        result.additionalChildrenSurcharge +
        result.goldSitterSurcharge
      );
    });

    it('defaults currency to KRW', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 2,
        startTime: '10:00',
        endTime: '12:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      expect(result.currency).toBe('KRW');
    });

    it('uses provided currency', () => {
      const result = calculatePrice({
        baseRate: 50,
        hours: 2,
        startTime: '10:00',
        endTime: '12:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'silver',
        currency: 'USD',
        isUrgent: false,
      });

      expect(result.currency).toBe('USD');
    });

    it('includes breakdown strings for applied surcharges', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '20:00',
        endTime: '00:00',
        date: new Date('2026-03-07'),
        childrenCount: 2,
        sitterTier: 'gold',
        isUrgent: true,
      });

      expect(result.breakdown).toContain('pricing.baseRateLine');
      expect(result.breakdown).toContain('pricing.nightSurchargeLine');
      expect(result.breakdown).toContain('pricing.weekendSurchargeLine');
      expect(result.breakdown).toContain('pricing.urgentSurchargeLine');
      expect(result.breakdown).toContain('pricing.additionalChildrenLine');
      expect(result.breakdown).toContain('pricing.goldSitterLine');
    });
  });

  // ----------------------------------------
  // Edge Case Tests
  // ----------------------------------------
  describe('edge cases', () => {
    it('handles midnight-crossing booking (21:00 to 02:00)', () => {
      const nightHours = getNightHours('21:00', '02:00');
      // 22:00-02:00 = 4 night hours
      expect(nightHours).toBe(4);
    });

    it('handles 0-hour booking (hours=0 means zero base total)', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 0,
        startTime: '10:00',
        endTime: '14:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      // baseTotal = 60000 * 0 = 0, so all surcharges based on baseTotal are 0
      // but nightSurcharge is based on baseRate * nightHours
      expect(result.weekendSurcharge).toBe(0);
      expect(result.additionalChildrenSurcharge).toBe(0);
    });

    it('handles 5 children (4 additional children surcharge)', () => {
      const surcharge = calculateAdditionalChildrenSurcharge(240000, 5);
      // 4 additional children × 30% × 240000 = 288000
      expect(surcharge).toBe(288000);
    });

    it('stacks all surcharges correctly', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: 4,
        startTime: '22:00',
        endTime: '02:00',
        date: new Date('2026-03-07'), // Saturday
        childrenCount: 3,
        sitterTier: 'gold',
        isUrgent: true,
      });

      const baseTotal = 60000 * 4;
      expect(result.nightSurcharge).toBeGreaterThan(0);
      expect(result.weekendSurcharge).toBeGreaterThan(0);
      expect(result.urgentSurcharge).toBeGreaterThan(0);
      expect(result.additionalChildrenSurcharge).toBeGreaterThan(0);
      expect(result.goldSitterSurcharge).toBeGreaterThan(0);
      expect(result.total).toBe(
        baseTotal +
        result.nightSurcharge +
        result.weekendSurcharge +
        result.urgentSurcharge +
        result.additionalChildrenSurcharge +
        result.goldSitterSurcharge
      );
    });

    it('handles negative base rate gracefully', () => {
      const result = calculatePrice({
        baseRate: -1000,
        hours: 2,
        startTime: '10:00',
        endTime: '12:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      // Negative base produces negative total (no crash)
      expect(result.total).toBe(-2000);
    });

    it('handles negative hours gracefully (no crash)', () => {
      const result = calculatePrice({
        baseRate: 60000,
        hours: -1,
        startTime: '10:00',
        endTime: '12:00',
        date: new Date('2026-03-04'),
        childrenCount: 1,
        sitterTier: 'silver',
        isUrgent: false,
      });

      // baseTotal = 60000 * -1 = -60000, but night surcharge from time range may add
      expect(typeof result.total).toBe('number');
    });

    it('returns zero night hours for fully daytime booking', () => {
      const nightHours = getNightHours('08:00', '18:00');
      expect(nightHours).toBe(0);
    });

    it('calculates full night booking correctly (22:00 to 06:00)', () => {
      const nightHours = getNightHours('22:00', '06:00');
      expect(nightHours).toBe(8);
    });

    it('isWeekend returns true for Saturday and Sunday', () => {
      expect(isWeekend(new Date('2026-03-07'))).toBe(true); // Saturday
      expect(isWeekend(new Date('2026-03-08'))).toBe(true); // Sunday
      expect(isWeekend(new Date('2026-03-04'))).toBe(false); // Wednesday
    });
  });
});
