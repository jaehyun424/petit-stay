// ============================================
// Petit Stay - Sitter Matching Engine
// Weighted scoring algorithm for optimal sitter-booking matching
// ============================================

import type { Sitter, Booking, Hotel } from '../types';

// ----------------------------------------
// Match Score Breakdown Type
// ----------------------------------------
export interface MatchScoreBreakdown {
  languageScore: number;       // 0-100
  availabilityScore: number;   // 0-100
  experienceScore: number;     // 0-100
  ratingScore: number;         // 0-100
  distanceScore: number;       // 0-100
  totalScore: number;          // 0-100 weighted
}

export interface SitterMatch {
  sitter: Sitter;
  score: MatchScoreBreakdown;
}

// ----------------------------------------
// Weight Configuration
// ----------------------------------------
const WEIGHTS = {
  language: 0.30,
  availability: 0.25,
  experience: 0.20,
  rating: 0.15,
  distance: 0.10,
} as const;

// ----------------------------------------
// Language Compatibility (30%)
// Compare sitter languages with booking preferred languages
// ----------------------------------------
function calculateLanguageScore(sitter: Sitter, booking: Booking): number {
  const sitterLanguages = sitter.profile.languages.map(l => l.toLowerCase());
  const preferredLanguages = booking.requirements.preferredLanguages.map(l => l.toLowerCase());

  if (preferredLanguages.length === 0) return 100; // No preference = full score
  if (sitterLanguages.length === 0) return 0;

  const matchCount = preferredLanguages.filter(lang =>
    sitterLanguages.includes(lang)
  ).length;

  return Math.round((matchCount / preferredLanguages.length) * 100);
}

// ----------------------------------------
// Time Availability (25%)
// Check sitter weekly schedule vs booking time
// ----------------------------------------
function calculateAvailabilityScore(sitter: Sitter, booking: Booking): number {
  const bookingDate = booking.schedule.date instanceof Date
    ? booking.schedule.date
    : new Date(booking.schedule.date);

  const dayOfWeek = bookingDate.getDay();
  const dayMap: Record<number, keyof typeof sitter.availability> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const dayKey = dayMap[dayOfWeek];
  if (!dayKey) return 0;

  const daySlots = sitter.availability[dayKey];
  if (!Array.isArray(daySlots) || daySlots.length === 0) return 0;

  const bookingStart = timeToMinutes(booking.schedule.startTime);
  const bookingEnd = timeToMinutes(booking.schedule.endTime);

  // Check if any slot covers the booking time
  for (const slot of daySlots) {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    if (slotStart <= bookingStart && slotEnd >= bookingEnd) {
      return 100; // Fully available
    }

    // Partial overlap
    const overlapStart = Math.max(slotStart, bookingStart);
    const overlapEnd = Math.min(slotEnd, bookingEnd);
    if (overlapEnd > overlapStart) {
      const bookingDuration = bookingEnd - bookingStart;
      const overlapDuration = overlapEnd - overlapStart;
      return Math.round((overlapDuration / bookingDuration) * 100);
    }
  }

  // Check night shift availability for late bookings
  if (bookingStart >= 1260 || bookingEnd <= 360) { // 9 PM or before 6 AM
    return sitter.availability.nightShift ? 50 : 0;
  }

  return 0;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// ----------------------------------------
// Experience & Qualifications (20%)
// Certifications count + years of experience
// ----------------------------------------
function calculateExperienceScore(sitter: Sitter, booking: Booking): number {
  let score = 0;

  // Years of experience (max 50 points for 10+ years)
  const years = sitter.profile.experience || 0;
  score += Math.min(years / 10, 1) * 50;

  // Certifications (max 30 points)
  const certCount = sitter.certifications?.length || 0;
  score += Math.min(certCount / 4, 1) * 30;

  // Tier match bonus (20 points)
  if (booking.requirements.sitterTier === 'gold' && sitter.tier === 'gold') {
    score += 20;
  } else if (booking.requirements.sitterTier === 'any') {
    score += sitter.tier === 'gold' ? 20 : 10;
  }

  return Math.round(Math.min(score, 100));
}

// ----------------------------------------
// Rating Score (15%)
// Based on average review score and total sessions
// ----------------------------------------
function calculateRatingScore(sitter: Sitter): number {
  const avgRating = sitter.stats?.averageRating || 0;
  const ratingCount = sitter.stats?.ratingCount || 0;
  const totalSessions = sitter.stats?.totalSessions || 0;

  // Base score from rating (0-5 scale → 0-80)
  const ratingBase = (avgRating / 5) * 80;

  // Reliability bonus from volume (max 20 points for 50+ sessions)
  const volumeBonus = Math.min(totalSessions / 50, 1) * 15;

  // Penalty for low review count (not enough data)
  const confidencePenalty = ratingCount < 3 ? 0.7 : 1;

  // No-show penalty
  const noShowPenalty = sitter.stats?.noShowCount
    ? Math.max(0, 1 - sitter.stats.noShowCount * 0.1)
    : 1;

  // Safety record bonus (max 5 points)
  const safetyBonus = (sitter.stats?.safetyRecord || 0) >= 100 ? 5 : 0;

  return Math.round(Math.min((ratingBase + volumeBonus + safetyBonus) * confidencePenalty * noShowPenalty, 100));
}

// ----------------------------------------
// Distance Score (10%)
// Proximity to hotel (based on partner hotel membership)
// ----------------------------------------
function calculateDistanceScore(sitter: Sitter, hotel: Hotel): number {
  // If sitter is a partner of this hotel, highest score
  if (sitter.partnerHotels?.includes(hotel.id)) {
    return 100;
  }

  // If sitter has coordinates and hotel has coordinates, estimate distance
  // For now, non-partner sitters get a base score
  return 30;
}

// ----------------------------------------
// Main Scoring Function
// ----------------------------------------
export function calculateMatchScore(
  sitter: Sitter,
  booking: Booking,
  hotel: Hotel
): MatchScoreBreakdown {
  const languageScore = calculateLanguageScore(sitter, booking);
  const availabilityScore = calculateAvailabilityScore(sitter, booking);
  const experienceScore = calculateExperienceScore(sitter, booking);
  const ratingScore = calculateRatingScore(sitter);
  const distanceScore = calculateDistanceScore(sitter, hotel);

  const totalScore = Math.round(
    languageScore * WEIGHTS.language +
    availabilityScore * WEIGHTS.availability +
    experienceScore * WEIGHTS.experience +
    ratingScore * WEIGHTS.rating +
    distanceScore * WEIGHTS.distance
  );

  return {
    languageScore,
    availabilityScore,
    experienceScore,
    ratingScore,
    distanceScore,
    totalScore,
  };
}

// ----------------------------------------
// Get Recommended Sitters (Top 3)
// ----------------------------------------
export function getRecommendedSitters(
  booking: Booking,
  sitters: Sitter[],
  hotel: Hotel
): SitterMatch[] {
  // Filter out inactive/suspended sitters
  const activeSitters = sitters.filter(s => s.status === 'active');

  // Filter by tier requirement
  const eligibleSitters = activeSitters.filter(s => {
    if (booking.requirements.sitterTier === 'gold') {
      return s.tier === 'gold';
    }
    return true;
  });

  // Score all eligible sitters
  const scored: SitterMatch[] = eligibleSitters.map(sitter => ({
    sitter,
    score: calculateMatchScore(sitter, booking, hotel),
  }));

  // Sort by total score descending
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore);

  // Return top 3
  return scored.slice(0, 3);
}
