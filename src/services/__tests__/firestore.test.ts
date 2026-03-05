// @ts-nocheck
// ============================================
// Petit Stay - Firestore Service Tests
// Verifies service layer CRUD operations with
// mocked Firebase SDK functions.
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------
// Mock Firebase SDK
// ----------------------------------------
const mockDocRef = { id: 'new-doc-id' };
const mockDocSnap = {
  exists: () => true,
  data: () => ({ name: 'Test' }),
  id: 'doc-1',
};
const mockDocSnapMissing = {
  exists: () => false,
  data: () => null,
  id: 'missing',
};
const mockQuerySnapshot = {
  docs: [
    { id: 'doc-1', data: () => ({ name: 'Item 1', status: 'pending' }) },
    { id: 'doc-2', data: () => ({ name: 'Item 2', status: 'completed' }) },
  ],
  empty: false,
  size: 2,
};
const mockEmptySnapshot = {
  docs: [],
  empty: true,
  size: 0,
};

const mockCollection = vi.fn(() => 'mock-collection-ref');
const mockDoc = vi.fn(() => mockDocRef);
const mockGetDoc = vi.fn(() => Promise.resolve(mockDocSnap));
const mockGetDocs = vi.fn(() => Promise.resolve(mockQuerySnapshot));
const mockSetDoc = vi.fn(() => Promise.resolve());
const mockUpdateDoc = vi.fn(() => Promise.resolve());
const mockDeleteDoc = vi.fn(() => Promise.resolve());
const mockQuery = vi.fn((...args: unknown[]) => args);
const mockWhere = vi.fn((...args: unknown[]) => ['where', ...args]);
const mockOrderBy = vi.fn((...args: unknown[]) => ['orderBy', ...args]);
const mockLimit = vi.fn((n: number) => ['limit', n]);
const mockOnSnapshot = vi.fn(() => vi.fn()); // returns unsubscribe fn
const mockServerTimestamp = vi.fn(() => new Date('2026-01-01T00:00:00Z'));
const mockWriteBatch = vi.fn(() => ({
  update: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  limit: (n: number) => mockLimit(n),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  serverTimestamp: () => mockServerTimestamp(),
  writeBatch: (...args: unknown[]) => mockWriteBatch(...args),
  Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
}));

vi.mock('../../services/firebase', () => ({
  db: {},
  auth: { currentUser: null },
  storage: {},
}));

// ----------------------------------------
// Import services AFTER mocks are set up
// ----------------------------------------
import {
  bookingService,
  sessionService,
  childrenService,
  reviewService,
  hotelService,
  sitterService,
  activityService,
  incidentService,
  notificationService,
} from '../../services/firestore';

// ----------------------------------------
// Reset mocks before each test
// ----------------------------------------
beforeEach(() => {
  vi.clearAllMocks();
  // Restore default mock implementations
  mockGetDoc.mockResolvedValue(mockDocSnap);
  mockGetDocs.mockResolvedValue(mockQuerySnapshot);
  mockSetDoc.mockResolvedValue(undefined);
  mockUpdateDoc.mockResolvedValue(undefined);
  mockDeleteDoc.mockResolvedValue(undefined);
});

// ============================================
// bookingService
// ============================================
describe('bookingService', () => {
  describe('getHotelBookings', () => {
    it('should query bookings by hotelId and return mapped results', async () => {
      const result = await bookingService.getHotelBookings('hotel-1');

      expect(mockCollection).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('hotelId', '==', 'hotel-1');
      expect(mockOrderBy).toHaveBeenCalledWith('schedule.date', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(mockGetDocs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'doc-1');
      expect(result[1]).toHaveProperty('id', 'doc-2');
    });

    it('should return empty array when no bookings exist', async () => {
      mockGetDocs.mockResolvedValueOnce(mockEmptySnapshot);
      const result = await bookingService.getHotelBookings('hotel-empty');
      expect(result).toHaveLength(0);
    });
  });

  describe('getParentBookings', () => {
    it('should query bookings by parentId', async () => {
      const result = await bookingService.getParentBookings('parent-1');

      expect(mockWhere).toHaveBeenCalledWith('parentId', '==', 'parent-1');
      expect(mockOrderBy).toHaveBeenCalledWith('schedule.date', 'desc');
      expect(result).toHaveLength(2);
    });
  });

  describe('getSitterBookings', () => {
    it('should query bookings by sitterId', async () => {
      const result = await bookingService.getSitterBookings('sitter-1');

      expect(mockWhere).toHaveBeenCalledWith('sitterId', '==', 'sitter-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('createBooking', () => {
    it('should create a booking with timestamps and return the doc id', async () => {
      const bookingData = {
        hotelId: 'hotel-1',
        parentId: 'parent-1',
        confirmationCode: 'ABC123',
        status: 'pending' as const,
        schedule: {
          date: new Date(),
          startTime: '10:00',
          endTime: '14:00',
          duration: 4,
          timezone: 'Asia/Seoul',
        },
        location: { type: 'room' as const, roomNumber: '301' },
        children: [{ childId: 'child-1', firstName: 'Test', age: 5 }],
        requirements: { sitterTier: 'any' as const, preferredLanguages: ['en'] },
        pricing: {
          baseRate: 25000,
          hours: 4,
          baseTotal: 100000,
          nightSurcharge: 0,
          holidaySurcharge: 0,
          goldSurcharge: 0,
          subtotal: 100000,
          commission: 15000,
          total: 115000,
        },
        payment: { status: 'pending' as const, method: 'card' as const },
        trustProtocol: { safeWord: 'rainbow' },
        metadata: { source: 'parent_app' as const },
      };

      const id = await bookingService.createBooking(bookingData);

      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockServerTimestamp).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status with updatedAt timestamp', async () => {
      await bookingService.updateBookingStatus('booking-1', 'confirmed');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalled();
    });
  });

  describe('updateBooking', () => {
    it('should update booking with partial data and updatedAt', async () => {
      await bookingService.updateBooking('booking-1', { status: 'in_progress' });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('getBookingStats', () => {
    it('should compute dashboard stats from hotel bookings', async () => {
      // Provide bookings with the shape getBookingStats expects
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'b1',
            data: () => ({
              status: 'pending',
              schedule: { date: new Date() },
              pricing: { total: 50000 },
            }),
          },
          {
            id: 'b2',
            data: () => ({
              status: 'completed',
              schedule: { date: new Date() },
              pricing: { total: 80000 },
            }),
          },
          {
            id: 'b3',
            data: () => ({
              status: 'in_progress',
              schedule: { date: new Date() },
              pricing: { total: 60000 },
            }),
          },
        ],
        empty: false,
        size: 3,
      });

      const stats = await bookingService.getBookingStats('hotel-1');

      expect(stats).toHaveProperty('todayBookings');
      expect(stats).toHaveProperty('activeNow');
      expect(stats).toHaveProperty('completedToday');
      expect(stats).toHaveProperty('todayRevenue');
      expect(stats).toHaveProperty('pendingBookings');
      expect(typeof stats.todayBookings).toBe('number');
      expect(typeof stats.activeNow).toBe('number');
    });
  });

  describe('getByConfirmationCode', () => {
    it('should return booking when found by confirmation code', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ id: 'booking-found', data: () => ({ confirmationCode: 'XYZ' }) }],
        empty: false,
        size: 1,
      });

      const result = await bookingService.getByConfirmationCode('XYZ');

      expect(mockWhere).toHaveBeenCalledWith('confirmationCode', '==', 'XYZ');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('booking-found');
    });

    it('should return null when confirmation code not found', async () => {
      mockGetDocs.mockResolvedValueOnce(mockEmptySnapshot);

      const result = await bookingService.getByConfirmationCode('NOPE');
      expect(result).toBeNull();
    });
  });

  describe('subscribeToBooking', () => {
    it('should call onSnapshot with the correct doc reference', () => {
      const callback = vi.fn();
      bookingService.subscribeToBooking('booking-1', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalled();
    });

    it('should return an unsubscribe function', () => {
      const unsubscribe = bookingService.subscribeToBooking('booking-1', vi.fn());
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToHotelBookings', () => {
    it('should set up real-time listener for hotel bookings', () => {
      const callback = vi.fn();
      const unsub = bookingService.subscribeToHotelBookings('hotel-1', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('hotelId', '==', 'hotel-1');
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// sessionService
// ============================================
describe('sessionService', () => {
  describe('getActiveSession', () => {
    it('should query for in_progress sessions by bookingId', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ id: 'session-1', data: () => ({ status: 'in_progress', bookingId: 'b1' }) }],
        empty: false,
        size: 1,
      });

      const session = await sessionService.getActiveSession('b1');

      expect(mockWhere).toHaveBeenCalledWith('bookingId', '==', 'b1');
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'in_progress');
      expect(session).not.toBeNull();
      expect(session!.id).toBe('session-1');
    });

    it('should return null when no active session exists', async () => {
      mockGetDocs.mockResolvedValueOnce(mockEmptySnapshot);

      const session = await sessionService.getActiveSession('b-no-session');
      expect(session).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should create a session document and return its id', async () => {
      const sessionData = {
        bookingId: 'b1',
        hotelId: 'hotel-1',
        sitterId: 'sitter-1',
        parentId: 'parent-1',
        status: 'preparing' as const,
        timeline: [],
        checklist: {
          roomSafety: {
            windowsSecured: false,
            balconyLocked: false,
            hazardsRemoved: false,
            emergencyExitKnown: false,
          },
          childInfo: {
            allergiesConfirmed: false,
            medicationNoted: false,
            sleepScheduleNoted: false,
          },
          supplies: {
            diapersProvided: false,
            snacksProvided: false,
            toysAvailable: false,
            emergencyKitReady: false,
          },
        },
        emergencyLog: [],
        actualTimes: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await sessionService.startSession(sessionData);

      expect(mockSetDoc).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });

  describe('endSession', () => {
    it('should update session status to completed with endTime', async () => {
      await sessionService.endSession('session-1', 'All went well');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalled();
    });

    it('should work without notes', async () => {
      await sessionService.endSession('session-1');
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('updateSession', () => {
    it('should update session with partial data', async () => {
      await sessionService.updateSession('session-1', { status: 'active' });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('getHotelActiveSessions', () => {
    it('should query active sessions for a hotel', async () => {
      const sessions = await sessionService.getHotelActiveSessions('hotel-1');

      expect(mockWhere).toHaveBeenCalledWith('hotelId', '==', 'hotel-1');
      expect(mockWhere).toHaveBeenCalledWith('status', 'in', ['preparing', 'checked_in', 'active']);
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('addTimelineEvent', () => {
    it('should add a timeline event to existing session', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ timeline: [] }),
        id: 'session-1',
      });

      await sessionService.addTimelineEvent('session-1', {
        type: 'activity',
        description: 'Playing blocks',
        isPrivate: false,
      });

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should not update if session does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce(mockDocSnapMissing);

      await sessionService.addTimelineEvent('missing-session', {
        type: 'note',
        description: 'Should not persist',
        isPrivate: false,
      });

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToSession', () => {
    it('should set up real-time listener for a session', () => {
      const unsub = sessionService.subscribeToSession('session-1', vi.fn());
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });

  describe('subscribeToHotelSessions', () => {
    it('should set up real-time listener for hotel active sessions', () => {
      const unsub = sessionService.subscribeToHotelSessions('hotel-1', vi.fn());
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// childrenService
// ============================================
describe('childrenService', () => {
  describe('getParentChildren', () => {
    it('should query children by parentId', async () => {
      const children = await childrenService.getParentChildren('parent-1');

      expect(mockWhere).toHaveBeenCalledWith('parentId', '==', 'parent-1');
      expect(mockGetDocs).toHaveBeenCalled();
      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(2);
    });
  });

  describe('addChild', () => {
    it('should create a child document and return its id', async () => {
      const childData = {
        parentId: 'parent-1',
        firstName: 'Luna',
        age: 4,
        gender: 'female' as const,
        allergies: ['peanuts'],
        consentGiven: true,
        consentTimestamp: new Date(),
        autoDeleteAt: new Date(),
        createdAt: new Date(),
      };

      const id = await childrenService.addChild(childData);

      expect(mockSetDoc).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });

  describe('updateChild', () => {
    it('should update child with partial data', async () => {
      await childrenService.updateChild('child-1', { firstName: 'Updated Name' });

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalled();
    });
  });

  describe('deleteChild', () => {
    it('should delete the child document', async () => {
      await childrenService.deleteChild('child-1');

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalled();
    });
  });
});

// ============================================
// reviewService
// ============================================
describe('reviewService', () => {
  describe('getSitterReviews', () => {
    it('should query reviews by sitterId ordered by createdAt', async () => {
      const reviews = await reviewService.getSitterReviews('sitter-1');

      expect(mockWhere).toHaveBeenCalledWith('sitterId', '==', 'sitter-1');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(Array.isArray(reviews)).toBe(true);
    });
  });

  describe('createReview', () => {
    it('should create a review document with createdAt timestamp', async () => {
      const reviewData = {
        sitterId: 'sitter-1',
        parentId: 'parent-1',
        bookingId: 'booking-1',
        rating: 5,
        comment: 'Excellent care!',
        tags: ['professional', 'kind'],
      };

      const id = await reviewService.createReview(reviewData);

      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockServerTimestamp).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });
});

// ============================================
// hotelService
// ============================================
describe('hotelService', () => {
  describe('getHotel', () => {
    it('should return hotel when document exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ name: 'Grand Hotel', tier: 'luxury' }),
        id: 'hotel-1',
      });

      const hotel = await hotelService.getHotel('hotel-1');

      expect(mockDoc).toHaveBeenCalled();
      expect(mockGetDoc).toHaveBeenCalled();
      expect(hotel).not.toBeNull();
      expect(hotel!.id).toBe('hotel-1');
    });

    it('should return null when hotel does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce(mockDocSnapMissing);

      const hotel = await hotelService.getHotel('nonexistent');
      expect(hotel).toBeNull();
    });
  });

  describe('updateHotelSettings', () => {
    it('should update hotel settings with updatedAt', async () => {
      await hotelService.updateHotelSettings('hotel-1', { name: 'Updated Hotel' } as never);

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockServerTimestamp).toHaveBeenCalled();
    });
  });

  describe('getAllHotels', () => {
    it('should fetch all hotels ordered by name', async () => {
      const hotels = await hotelService.getAllHotels();

      expect(mockOrderBy).toHaveBeenCalledWith('name');
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(Array.isArray(hotels)).toBe(true);
    });
  });

  describe('subscribeToHotel', () => {
    it('should set up real-time listener for hotel document', () => {
      const unsub = hotelService.subscribeToHotel('hotel-1', vi.fn());
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// sitterService
// ============================================
describe('sitterService', () => {
  describe('getHotelSitters', () => {
    it('should query sitters by role and hotelId', async () => {
      const sitters = await sitterService.getHotelSitters('hotel-1');

      expect(mockWhere).toHaveBeenCalledWith('role', '==', 'sitter');
      expect(mockWhere).toHaveBeenCalledWith('hotelId', '==', 'hotel-1');
      expect(Array.isArray(sitters)).toBe(true);
    });
  });

  describe('getSitter', () => {
    it('should return sitter when found in sitters collection', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ tier: 'gold', status: 'active' }),
        id: 'sitter-1',
      });

      const sitter = await sitterService.getSitter('sitter-1');

      expect(sitter).not.toBeNull();
      expect(sitter!.id).toBe('sitter-1');
    });

    it('should fallback to users collection when sitter not found', async () => {
      // First call (sitters collection) returns missing
      mockGetDoc.mockResolvedValueOnce(mockDocSnapMissing);
      // Second call (users collection) returns found
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'sitter', name: 'Fallback Sitter' }),
        id: 'sitter-2',
      });

      const sitter = await sitterService.getSitter('sitter-2');

      expect(mockGetDoc).toHaveBeenCalledTimes(2);
      expect(sitter).not.toBeNull();
      expect(sitter!.id).toBe('sitter-2');
    });

    it('should return null when sitter not found in either collection', async () => {
      mockGetDoc.mockResolvedValueOnce(mockDocSnapMissing);
      mockGetDoc.mockResolvedValueOnce(mockDocSnapMissing);

      const sitter = await sitterService.getSitter('nobody');
      expect(sitter).toBeNull();
    });
  });

  describe('updateSitterProfile', () => {
    it('should update sitter profile with updatedAt', async () => {
      await sitterService.updateSitterProfile('sitter-1', { status: 'inactive' } as never);

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockServerTimestamp).toHaveBeenCalled();
    });
  });

  describe('getSitterEarnings', () => {
    it('should query completed bookings for sitter earnings', async () => {
      const earnings = await sitterService.getSitterEarnings('sitter-1');

      expect(mockWhere).toHaveBeenCalledWith('sitterId', '==', 'sitter-1');
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'completed');
      expect(Array.isArray(earnings)).toBe(true);
    });
  });

  describe('subscribeToHotelSitters', () => {
    it('should listen for sitters associated with a hotel', () => {
      const unsub = sitterService.subscribeToHotelSitters('hotel-1', vi.fn());

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('partnerHotels', 'array-contains', 'hotel-1');
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// activityService
// ============================================
describe('activityService', () => {
  describe('getSessionActivities', () => {
    it('should query activities by sessionId', async () => {
      const activities = await activityService.getSessionActivities('session-1');

      expect(mockWhere).toHaveBeenCalledWith('sessionId', '==', 'session-1');
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(Array.isArray(activities)).toBe(true);
    });
  });

  describe('logActivity', () => {
    it('should create an activity log entry with timestamp', async () => {
      const id = await activityService.logActivity({
        sessionId: 'session-1',
        type: 'meal',
        description: 'Lunch served',
      });

      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockServerTimestamp).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });

  describe('subscribeToActivities', () => {
    it('should set up real-time listener for session activities', () => {
      const unsub = activityService.subscribeToActivities('session-1', vi.fn());

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// incidentService
// ============================================
describe('incidentService', () => {
  describe('getHotelIncidents', () => {
    it('should query incidents for a hotel', async () => {
      const incidents = await incidentService.getHotelIncidents('hotel-1');

      expect(mockWhere).toHaveBeenCalledWith('hotelId', '==', 'hotel-1');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(Array.isArray(incidents)).toBe(true);
    });
  });

  describe('createIncident', () => {
    it('should create an incident with timestamps', async () => {
      const incidentData = {
        bookingId: 'b1',
        sessionId: 's1',
        hotelId: 'hotel-1',
        sitterId: 'sitter-1',
        parentId: 'parent-1',
        severity: 'low' as const,
        category: 'safety_concern' as const,
        report: {
          summary: 'Minor issue',
          details: 'Details here',
          reportedBy: 'sitter' as const,
          reportedAt: new Date(),
        },
        response: { actions: [] },
        resolution: { status: 'open' as const },
        documentation: { photos: [], medicalReports: [], witnessStatements: [], internalNotes: [] },
        followUp: { parentContacted: false },
      };

      const id = await incidentService.createIncident(incidentData);

      expect(mockSetDoc).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });

  describe('updateIncident', () => {
    it('should update incident with partial data', async () => {
      await incidentService.updateIncident('incident-1', {
        resolution: { status: 'resolved', resolvedAt: new Date(), resolvedBy: 'admin' },
      } as never);

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('subscribeToHotelIncidents', () => {
    it('should listen for hotel incidents in real-time', () => {
      const unsub = incidentService.subscribeToHotelIncidents('hotel-1', vi.fn());

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// notificationService
// ============================================
describe('notificationService', () => {
  describe('getUserNotifications', () => {
    it('should query notifications by userId', async () => {
      const notifications = await notificationService.getUserNotifications('user-1');

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-1');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe('createNotification', () => {
    it('should create a notification with createdAt timestamp', async () => {
      const id = await notificationService.createNotification({
        userId: 'user-1',
        type: 'booking_created',
        title: 'New Booking',
        body: 'Your booking has been created',
        read: false,
      });

      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockServerTimestamp).toHaveBeenCalled();
      expect(id).toBe('new-doc-id');
    });
  });

  describe('markAsRead', () => {
    it('should set read to true on a notification', async () => {
      await notificationService.markAsRead('notif-1');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should batch-update all unread notifications for a user', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          { id: 'n1', data: () => ({ read: false }) },
          { id: 'n2', data: () => ({ read: false }) },
        ],
        empty: false,
        size: 2,
      });

      await notificationService.markAllAsRead('user-1');

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-1');
      expect(mockWhere).toHaveBeenCalledWith('read', '==', false);
      expect(mockWriteBatch).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
        empty: false,
        size: 3,
      });

      const count = await notificationService.getUnreadCount('user-1');

      expect(mockWhere).toHaveBeenCalledWith('read', '==', false);
      expect(count).toBe(3);
    });
  });

  describe('subscribeToUserNotifications', () => {
    it('should set up real-time listener for user notifications', () => {
      const unsub = notificationService.subscribeToUserNotifications('user-1', vi.fn());

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });
});

// ============================================
// Service exports validation
// ============================================
describe('service exports', () => {
  it('should export bookingService with expected methods', () => {
    expect(bookingService).toBeDefined();
    expect(typeof bookingService.getHotelBookings).toBe('function');
    expect(typeof bookingService.getParentBookings).toBe('function');
    expect(typeof bookingService.getSitterBookings).toBe('function');
    expect(typeof bookingService.createBooking).toBe('function');
    expect(typeof bookingService.updateBookingStatus).toBe('function');
    expect(typeof bookingService.updateBooking).toBe('function');
    expect(typeof bookingService.getBookingStats).toBe('function');
    expect(typeof bookingService.getByConfirmationCode).toBe('function');
    expect(typeof bookingService.getTodayBookings).toBe('function');
    expect(typeof bookingService.subscribeToBooking).toBe('function');
    expect(typeof bookingService.subscribeToHotelBookings).toBe('function');
  });

  it('should export sessionService with expected methods', () => {
    expect(sessionService).toBeDefined();
    expect(typeof sessionService.getActiveSession).toBe('function');
    expect(typeof sessionService.startSession).toBe('function');
    expect(typeof sessionService.endSession).toBe('function');
    expect(typeof sessionService.updateSession).toBe('function');
    expect(typeof sessionService.addTimelineEvent).toBe('function');
    expect(typeof sessionService.getHotelActiveSessions).toBe('function');
    expect(typeof sessionService.subscribeToSession).toBe('function');
    expect(typeof sessionService.subscribeToHotelSessions).toBe('function');
  });

  it('should export childrenService with expected methods', () => {
    expect(childrenService).toBeDefined();
    expect(typeof childrenService.getParentChildren).toBe('function');
    expect(typeof childrenService.addChild).toBe('function');
    expect(typeof childrenService.updateChild).toBe('function');
    expect(typeof childrenService.deleteChild).toBe('function');
  });

  it('should export reviewService with expected methods', () => {
    expect(reviewService).toBeDefined();
    expect(typeof reviewService.getSitterReviews).toBe('function');
    expect(typeof reviewService.createReview).toBe('function');
  });

  it('should export hotelService with expected methods', () => {
    expect(hotelService).toBeDefined();
    expect(typeof hotelService.getHotel).toBe('function');
    expect(typeof hotelService.updateHotelSettings).toBe('function');
    expect(typeof hotelService.getAllHotels).toBe('function');
    expect(typeof hotelService.subscribeToHotel).toBe('function');
  });

  it('should export sitterService with expected methods', () => {
    expect(sitterService).toBeDefined();
    expect(typeof sitterService.getHotelSitters).toBe('function');
    expect(typeof sitterService.getSitter).toBe('function');
    expect(typeof sitterService.updateSitterProfile).toBe('function');
    expect(typeof sitterService.getSitterEarnings).toBe('function');
    expect(typeof sitterService.subscribeToHotelSitters).toBe('function');
  });

  it('should export activityService with expected methods', () => {
    expect(activityService).toBeDefined();
    expect(typeof activityService.getSessionActivities).toBe('function');
    expect(typeof activityService.logActivity).toBe('function');
    expect(typeof activityService.subscribeToActivities).toBe('function');
  });

  it('should export incidentService with expected methods', () => {
    expect(incidentService).toBeDefined();
    expect(typeof incidentService.getHotelIncidents).toBe('function');
    expect(typeof incidentService.createIncident).toBe('function');
    expect(typeof incidentService.updateIncident).toBe('function');
    expect(typeof incidentService.subscribeToHotelIncidents).toBe('function');
  });

  it('should export notificationService with expected methods', () => {
    expect(notificationService).toBeDefined();
    expect(typeof notificationService.getUserNotifications).toBe('function');
    expect(typeof notificationService.createNotification).toBe('function');
    expect(typeof notificationService.markAsRead).toBe('function');
    expect(typeof notificationService.markAllAsRead).toBe('function');
    expect(typeof notificationService.getUnreadCount).toBe('function');
    expect(typeof notificationService.subscribeToUserNotifications).toBe('function');
  });
});
