import { describe, it, expect } from 'vitest';
import { calculateMatchScore, getRecommendedSitters } from '../matchingEngine';
import type { Sitter, Booking, Hotel } from '../../types';

// ----------------------------------------
// Test Fixtures
// ----------------------------------------

function makeSitter(overrides: Partial<Sitter> = {}): Sitter {
  return {
    id: 'sitter-1',
    userId: 'user-1',
    tier: 'gold',
    status: 'active',
    profile: {
      displayName: 'Kim Minjung',
      bio: '',
      avatar: '',
      languages: ['English', 'Korean'],
      experience: 5,
      specialties: [],
    },
    certifications: [
      { type: 'childcare', name: 'Childcare Cert', issuedBy: 'KCA', issuedAt: new Date() },
      { type: 'first_aid', name: 'First Aid', issuedBy: 'Red Cross', issuedAt: new Date() },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed' },
    availability: {
      monday: [{ start: '09:00', end: '18:00' }],
      tuesday: [{ start: '09:00', end: '18:00' }],
      wednesday: [{ start: '09:00', end: '18:00' }],
      thursday: [{ start: '09:00', end: '18:00' }],
      friday: [{ start: '09:00', end: '22:00' }],
      saturday: [{ start: '10:00', end: '20:00' }],
      sunday: [],
      nightShift: false,
      holidayAvailable: false,
    },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: {
      totalSessions: 100,
      totalHours: 400,
      averageRating: 4.8,
      ratingCount: 50,
      safetyRecord: 100,
      noShowCount: 0,
      repeatClientRate: 0.6,
    },
    bankInfo: { bankName: 'KB', accountNumber: '123', accountHolder: 'Kim' },
    partnerHotels: ['hotel-grand-hyatt'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  // Use a Wednesday so availability matches
  const wed = new Date('2026-03-04'); // Wednesday
  return {
    id: 'booking-1',
    hotelId: 'hotel-grand-hyatt',
    parentId: 'parent-1',
    confirmationCode: 'KCP-2026-0001',
    status: 'pending',
    schedule: {
      date: wed,
      startTime: '10:00',
      endTime: '14:00',
      duration: 4,
      timezone: 'Asia/Seoul',
    },
    location: { type: 'in_room', roomNumber: '2305' },
    children: [{ childId: 'c1', firstName: 'Emma', age: 5 }],
    requirements: {
      sitterTier: 'any',
      preferredLanguages: ['English'],
    },
    pricing: { baseRate: 60000, hours: 4, baseTotal: 240000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 240000, commission: 24000, total: 240000 },
    payment: { status: 'pending', method: 'card' },
    trustProtocol: { safeWord: 'sunshine' },
    metadata: {} as Booking['metadata'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Booking;
}

function makeHotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: 'hotel-grand-hyatt',
    name: 'Grand Hyatt Seoul',
    nameI18n: { en: 'Grand Hyatt Seoul', ko: '그랜드 하얏트 서울', ja: '', zh: '' },
    tier: 'premium',
    address: 'Seoul',
    coordinates: { lat: 37.5, lng: 127.0 },
    logo: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
    commission: 0.1,
    settings: { autoAssign: true, requireGoldForInfant: true, maxAdvanceBookingDays: 30, minBookingHours: 2, cancellationPolicy: 'flexible' },
    stats: { totalBookings: 500, safetyDays: 365, averageRating: 4.7, thisMonthBookings: 50, thisMonthRevenue: 10000000 },
    slaMetrics: { responseRate: 0.98, replacementRate: 0.95, satisfactionRate: 0.96 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Hotel;
}

// ----------------------------------------
// Tests
// ----------------------------------------

describe('matchingEngine', () => {
  describe('calculateMatchScore', () => {
    it('gives high language score when sitter speaks preferred language', () => {
      const sitter = makeSitter({ profile: { ...makeSitter().profile, languages: ['English', 'Korean'] } });
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: ['English'] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(100);
    });

    it('gives zero language score when no language match', () => {
      const sitter = makeSitter({ profile: { ...makeSitter().profile, languages: ['Japanese'] } });
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: ['English'] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(0);
    });

    it('gives partial language score for partial match', () => {
      const sitter = makeSitter({ profile: { ...makeSitter().profile, languages: ['English'] } });
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: ['English', 'Korean'] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(50);
    });

    it('gives full language score when no preferred languages specified', () => {
      const sitter = makeSitter();
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: [] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(100);
    });

    it('gives full availability score when sitter covers entire booking', () => {
      const sitter = makeSitter(); // Wednesday 09:00-18:00
      const booking = makeBooking(); // Wednesday 10:00-14:00
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.availabilityScore).toBe(100);
    });

    it('gives zero availability score when sitter has no slots for that day', () => {
      const sitter = makeSitter(); // Sunday is empty
      const sun = new Date('2026-03-08'); // Sunday
      const booking = makeBooking({ schedule: { date: sun, startTime: '10:00', endTime: '14:00', duration: 4, timezone: 'Asia/Seoul' } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.availabilityScore).toBe(0);
    });

    it('gives high distance score for partner hotel sitter', () => {
      const sitter = makeSitter({ partnerHotels: ['hotel-grand-hyatt'] });
      const booking = makeBooking();
      const hotel = makeHotel({ id: 'hotel-grand-hyatt' });

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.distanceScore).toBe(100);
    });

    it('gives low distance score for non-partner sitter', () => {
      const sitter = makeSitter({ partnerHotels: [] });
      const booking = makeBooking();
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.distanceScore).toBe(30);
    });

    it('calculates weighted total score correctly', () => {
      const sitter = makeSitter();
      const booking = makeBooking();
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);

      // Weighted: lang*0.30 + avail*0.25 + exp*0.20 + rating*0.15 + dist*0.10
      const expected = Math.round(
        result.languageScore * 0.30 +
        result.availabilityScore * 0.25 +
        result.experienceScore * 0.20 +
        result.ratingScore * 0.15 +
        result.distanceScore * 0.10
      );
      expect(result.totalScore).toBe(expected);
    });

    it('gives experience score with tier bonus for gold match', () => {
      const sitter = makeSitter({ tier: 'gold' });
      const booking = makeBooking({ requirements: { sitterTier: 'gold', preferredLanguages: ['English'] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.experienceScore).toBeGreaterThan(0);
    });

    it('applies confidence penalty for low review count', () => {
      const lowReviewSitter = makeSitter({
        stats: { ...makeSitter().stats, ratingCount: 1, averageRating: 5.0 },
      });
      const highReviewSitter = makeSitter({
        stats: { ...makeSitter().stats, ratingCount: 50, averageRating: 5.0 },
      });
      const booking = makeBooking();
      const hotel = makeHotel();

      const lowResult = calculateMatchScore(lowReviewSitter, booking, hotel);
      const highResult = calculateMatchScore(highReviewSitter, booking, hotel);

      expect(lowResult.ratingScore).toBeLessThan(highResult.ratingScore);
    });

    it('penalizes no-shows in rating score', () => {
      const noShowSitter = makeSitter({
        stats: { ...makeSitter().stats, noShowCount: 5 },
      });
      const cleanSitter = makeSitter({
        stats: { ...makeSitter().stats, noShowCount: 0 },
      });
      const booking = makeBooking();
      const hotel = makeHotel();

      const noShowResult = calculateMatchScore(noShowSitter, booking, hotel);
      const cleanResult = calculateMatchScore(cleanSitter, booking, hotel);

      expect(noShowResult.ratingScore).toBeLessThan(cleanResult.ratingScore);
    });
  });

  describe('getRecommendedSitters', () => {
    it('returns top 3 sitters sorted by score', () => {
      const sitters = [
        makeSitter({ id: 's1', profile: { ...makeSitter().profile, languages: ['Japanese'] } }),
        makeSitter({ id: 's2', profile: { ...makeSitter().profile, languages: ['English', 'Korean'] } }),
        makeSitter({ id: 's3', profile: { ...makeSitter().profile, languages: ['English'] } }),
        makeSitter({ id: 's4', profile: { ...makeSitter().profile, languages: ['Chinese'] } }),
      ];
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: ['English'] } });
      const hotel = makeHotel();

      const result = getRecommendedSitters(booking, sitters, hotel);

      expect(result.length).toBe(3);
      // Sorted descending
      expect(result[0].score.totalScore).toBeGreaterThanOrEqual(result[1].score.totalScore);
      expect(result[1].score.totalScore).toBeGreaterThanOrEqual(result[2].score.totalScore);
    });

    it('returns empty array when no sitters', () => {
      const booking = makeBooking();
      const hotel = makeHotel();

      const result = getRecommendedSitters(booking, [], hotel);
      expect(result).toEqual([]);
    });

    it('filters out inactive sitters', () => {
      const sitters = [
        makeSitter({ id: 's1', status: 'inactive' }),
        makeSitter({ id: 's2', status: 'active' }),
        makeSitter({ id: 's3', status: 'suspended' }),
      ];
      const booking = makeBooking();
      const hotel = makeHotel();

      const result = getRecommendedSitters(booking, sitters, hotel);
      expect(result.length).toBe(1);
      expect(result[0].sitter.id).toBe('s2');
    });

    it('filters by gold tier when required', () => {
      const sitters = [
        makeSitter({ id: 's1', tier: 'silver' }),
        makeSitter({ id: 's2', tier: 'gold' }),
      ];
      const booking = makeBooking({ requirements: { sitterTier: 'gold', preferredLanguages: [] } });
      const hotel = makeHotel();

      const result = getRecommendedSitters(booking, sitters, hotel);
      expect(result.length).toBe(1);
      expect(result[0].sitter.tier).toBe('gold');
    });

    it('returns fewer than 3 when not enough eligible sitters', () => {
      const sitters = [makeSitter({ id: 's1' })];
      const booking = makeBooking();
      const hotel = makeHotel();

      const result = getRecommendedSitters(booking, sitters, hotel);
      expect(result.length).toBe(1);
    });
  });

  // ----------------------------------------
  // Edge Case Tests
  // ----------------------------------------
  describe('edge cases', () => {
    it('handles sitter with no languages at all', () => {
      const sitter = makeSitter({ profile: { ...makeSitter().profile, languages: [] } });
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: ['English'] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(0);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('handles sitter with no stats (undefined)', () => {
      const sitter = makeSitter({ stats: undefined as any });
      const booking = makeBooking();
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.ratingScore).toBe(0);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('handles sitter with zero experience and no certifications', () => {
      const sitter = makeSitter({
        profile: { ...makeSitter().profile, experience: 0 },
        certifications: [],
      });
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: [] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      // tier bonus only (silver=10)
      expect(result.experienceScore).toBeLessThanOrEqual(20);
    });

    it('gives perfect score to ideal sitter', () => {
      const sitter = makeSitter({
        profile: { ...makeSitter().profile, languages: ['English', 'Korean'], experience: 10 },
        tier: 'gold',
        certifications: [
          { type: 'childcare', name: 'C1', issuedBy: 'A', issuedAt: new Date() },
          { type: 'first_aid', name: 'C2', issuedBy: 'A', issuedAt: new Date() },
          { type: 'childcare', name: 'C3', issuedBy: 'A', issuedAt: new Date() },
          { type: 'first_aid', name: 'C4', issuedBy: 'A', issuedAt: new Date() },
        ],
        stats: { totalSessions: 200, totalHours: 800, averageRating: 5.0, ratingCount: 100, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.8 },
        partnerHotels: ['hotel-grand-hyatt'],
      });
      const booking = makeBooking({
        requirements: { sitterTier: 'gold', preferredLanguages: ['English'] },
      });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(100);
      expect(result.availabilityScore).toBe(100);
      expect(result.distanceScore).toBe(100);
      expect(result.totalScore).toBeGreaterThan(90);
    });

    it('returns empty when all sitters are unavailable (Sunday booking)', () => {
      const sitters = [
        makeSitter({ id: 's1' }), // Sunday is []
        makeSitter({ id: 's2' }),
      ];
      const sun = new Date('2026-03-08'); // Sunday
      const booking = makeBooking({
        schedule: { date: sun, startTime: '10:00', endTime: '14:00', duration: 4, timezone: 'Asia/Seoul' },
      });
      const hotel = makeHotel();

      const result = getRecommendedSitters(booking, sitters, hotel);
      // They still get returned (availability is scored, not filtered)
      // but their availability score should be 0
      expect(result.every(r => r.score.availabilityScore === 0)).toBe(true);
    });

    it('handles booking with no preferred languages (universal match)', () => {
      const sitter = makeSitter({ profile: { ...makeSitter().profile, languages: ['Swahili'] } });
      const booking = makeBooking({ requirements: { sitterTier: 'any', preferredLanguages: [] } });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      expect(result.languageScore).toBe(100);
    });

    it('handles night shift availability for late booking', () => {
      const sitter = makeSitter({
        availability: {
          ...makeSitter().availability,
          wednesday: [{ start: '09:00', end: '18:00' }],
          nightShift: true,
        },
      });
      const wed = new Date('2026-03-04'); // Wednesday
      const booking = makeBooking({
        schedule: { date: wed, startTime: '21:00', endTime: '23:00', duration: 2, timezone: 'Asia/Seoul' },
      });
      const hotel = makeHotel();

      const result = calculateMatchScore(sitter, booking, hotel);
      // Night shift available, gets partial score
      expect(result.availabilityScore).toBeGreaterThan(0);
    });
  });
});
