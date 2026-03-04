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
});
