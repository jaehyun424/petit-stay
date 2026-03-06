import { renderHook, waitFor } from '@testing-library/react';
import { useHotelSessions, useLiveStatus, useActiveSession } from '../session/useSessions';

// In test mode, DEMO_MODE is true (from setup.ts)

describe('useHotelSessions', () => {
    it('loads demo active sessions', async () => {
        const { result } = renderHook(() => useHotelSessions('hotel-1'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.sessions.length).toBeGreaterThan(0);
    });

    it('each session has expected fields', async () => {
        const { result } = renderHook(() => useHotelSessions('hotel-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const session = result.current.sessions[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('sitter');
        expect(session.sitter).toHaveProperty('name');
    });
});

describe('useLiveStatus', () => {
    it('loads demo live status', async () => {
        const { result } = renderHook(() => useLiveStatus('session-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.logs.length).toBeGreaterThan(0);
        expect(result.current.sessionInfo.sitterName).toBeTruthy();
    });
});

describe('useActiveSession', () => {
    it('loads demo active session', async () => {
        const { result } = renderHook(() => useActiveSession('user-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.checklist.length).toBeGreaterThan(0);
        expect(result.current.sessionId).toBeTruthy();
    });

    it('can toggle checklist items', async () => {
        const { result } = renderHook(() => useActiveSession('user-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const firstItem = result.current.checklist[0];
        const initialState = firstItem.completed;

        result.current.toggleChecklistItem(firstItem.id);

        await waitFor(() => {
            expect(result.current.checklist[0].completed).toBe(!initialState);
        });
    });
});
