import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase before importing the service
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOrderBy = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ _type: 'serverTimestamp' }));

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('../firebase', () => ({
  db: {},
}));

import { auditLogService } from '../auditLog';

describe('auditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockReturnValue('audit-collection-ref');
    mockQuery.mockReturnValue('audit-query');
    mockOrderBy.mockReturnValue('order-by-timestamp');
  });

  describe('logAudit', () => {
    it('creates an audit log entry with correct fields', async () => {
      mockAddDoc.mockResolvedValue({ id: 'audit-doc-1' });

      const result = await auditLogService.logAudit(
        'booking-1',
        'booking_created',
        'Booking created by parent',
        'user-1',
        'Sarah Johnson'
      );

      expect(result).toBe('audit-doc-1');
      expect(mockAddDoc).toHaveBeenCalledWith('audit-collection-ref', {
        bookingId: 'booking-1',
        action: 'booking_created',
        details: 'Booking created by parent',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        timestamp: expect.anything(),
      });
    });

    it('calls collection with correct path', async () => {
      mockAddDoc.mockResolvedValue({ id: 'audit-doc-2' });

      await auditLogService.logAudit('booking-99', 'sitter_assigned', 'Assigned', 'u1', 'Admin');

      expect(mockCollection).toHaveBeenCalledWith({}, 'bookings', 'booking-99', 'auditLog');
    });
  });

  describe('getAuditLog', () => {
    it('returns sorted audit entries', async () => {
      const mockDocs = [
        {
          id: 'log-1',
          data: () => ({
            action: 'booking_created',
            details: 'Created',
            userId: 'u1',
            userName: 'Admin',
            timestamp: { toDate: () => new Date('2026-03-01T10:00:00Z') },
          }),
        },
        {
          id: 'log-2',
          data: () => ({
            action: 'sitter_assigned',
            details: 'Assigned Kim',
            userId: 'u2',
            userName: 'Hotel Staff',
            timestamp: { toDate: () => new Date('2026-03-01T11:00:00Z') },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({ docs: mockDocs });

      const entries = await auditLogService.getAuditLog('booking-1');

      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe('log-1');
      expect(entries[0].action).toBe('booking_created');
      expect(entries[0].bookingId).toBe('booking-1');
      expect(entries[1].action).toBe('sitter_assigned');
    });

    it('returns empty array when no logs', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      const entries = await auditLogService.getAuditLog('booking-empty');
      expect(entries).toEqual([]);
    });

    it('handles timestamps that are plain Dates', async () => {
      const mockDocs = [
        {
          id: 'log-3',
          data: () => ({
            action: 'payment_received',
            details: 'Paid',
            userId: 'u1',
            userName: 'System',
            timestamp: new Date('2026-03-02T12:00:00Z'),
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({ docs: mockDocs });

      const entries = await auditLogService.getAuditLog('booking-2');
      expect(entries[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('subscribeToAuditLog', () => {
    it('calls onSnapshot with correct query', () => {
      const callback = vi.fn();
      mockOnSnapshot.mockReturnValue(vi.fn());

      auditLogService.subscribeToAuditLog('booking-1', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it('returns unsubscribe function', () => {
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const result = auditLogService.subscribeToAuditLog('booking-1', vi.fn());
      expect(result).toBe(unsubscribe);
    });
  });

  // ----------------------------------------
  // Edge Case Tests
  // ----------------------------------------
  describe('edge cases', () => {
    it('logAudit returns doc id for every valid action type', async () => {
      mockAddDoc.mockResolvedValue({ id: 'doc-new' });

      const actions: Array<'booking_created' | 'sitter_assigned' | 'status_changed' | 'payment_received' | 'incident_reported'> = [
        'booking_created', 'sitter_assigned', 'status_changed', 'payment_received', 'incident_reported',
      ];

      for (const action of actions) {
        const id = await auditLogService.logAudit('b1', action, `Action: ${action}`, 'u1', 'Admin');
        expect(id).toBe('doc-new');
      }
      expect(mockAddDoc).toHaveBeenCalledTimes(actions.length);
    });

    it('logAudit passes serverTimestamp', async () => {
      mockAddDoc.mockResolvedValue({ id: 'doc-ts' });

      await auditLogService.logAudit('b1', 'booking_created', 'test', 'u1', 'Admin');

      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.timestamp).toEqual({ _type: 'serverTimestamp' });
    });

    it('getAuditLog preserves entry order from Firestore', async () => {
      const mockDocs = [
        { id: 'first', data: () => ({ action: 'booking_created', details: 'A', userId: 'u1', userName: 'A', timestamp: { toDate: () => new Date('2026-03-01T12:00:00Z') } }) },
        { id: 'second', data: () => ({ action: 'sitter_assigned', details: 'B', userId: 'u2', userName: 'B', timestamp: { toDate: () => new Date('2026-03-01T11:00:00Z') } }) },
        { id: 'third', data: () => ({ action: 'check_in_completed', details: 'C', userId: 'u3', userName: 'C', timestamp: { toDate: () => new Date('2026-03-01T10:00:00Z') } }) },
      ];
      mockGetDocs.mockResolvedValue({ docs: mockDocs });

      const entries = await auditLogService.getAuditLog('b1');

      // Order should match Firestore result (desc by timestamp via query)
      expect(entries[0].id).toBe('first');
      expect(entries[1].id).toBe('second');
      expect(entries[2].id).toBe('third');
    });

    it('handles missing timestamp gracefully (falls back to new Date)', async () => {
      const mockDocs = [
        { id: 'no-ts', data: () => ({ action: 'booking_created', details: 'D', userId: 'u1', userName: 'X', timestamp: null }) },
      ];
      mockGetDocs.mockResolvedValue({ docs: mockDocs });

      const entries = await auditLogService.getAuditLog('b1');
      expect(entries[0].timestamp).toBeInstanceOf(Date);
    });

    it('subscribeToAuditLog invokes callback with entries on snapshot', () => {
      const callback = vi.fn();
      mockOnSnapshot.mockImplementation((q, cb) => {
        cb({
          docs: [
            { id: 'rt-1', data: () => ({ action: 'booking_created', details: 'live', userId: 'u1', userName: 'Live', timestamp: { toDate: () => new Date() } }) },
          ],
        });
        return vi.fn();
      });

      auditLogService.subscribeToAuditLog('b1', callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toHaveLength(1);
      expect(callback.mock.calls[0][0][0].action).toBe('booking_created');
    });

    it('subscribeToAuditLog calls onError on failure', () => {
      const callback = vi.fn();
      const onError = vi.fn();
      mockOnSnapshot.mockImplementation((_q, _cb, errCb) => {
        errCb(new Error('Firestore permission denied'));
        return vi.fn();
      });

      auditLogService.subscribeToAuditLog('b1', callback, onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
