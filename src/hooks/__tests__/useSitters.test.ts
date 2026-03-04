import { renderHook, waitFor } from '@testing-library/react';
import { useHotelSitters, useSitterStats, useSitterProfile } from '../useSitters';

// In test mode, DEMO_MODE is true (from setup.ts)

describe('useHotelSitters', () => {
    it('loads demo sitters', async () => {
        const { result } = renderHook(() => useHotelSitters('hotel-1'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.sitters.length).toBe(5);
        expect(result.current.sitters.map((s) => s.name)).toEqual([
            'Kim Minjung',
            'Park Sooyeon',
            'Sato Haruka',
            'Chen Wei',
            'Lee Jihye',
        ]);
    });

    it('each sitter has expected fields and tiers', async () => {
        const { result } = renderHook(() => useHotelSitters('hotel-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const sitter = result.current.sitters[0];
        expect(sitter).toHaveProperty('id');
        expect(sitter).toHaveProperty('name');
        expect(sitter).toHaveProperty('tier');
        expect(sitter).toHaveProperty('rating');
        expect(sitter).toHaveProperty('sessionsCompleted');
        expect(sitter).toHaveProperty('languages');
        expect(sitter).toHaveProperty('certifications');
        expect(sitter).toHaveProperty('hourlyRate');

        // Check tier distribution: 3 gold, 2 silver
        const goldCount = result.current.sitters.filter((s) => s.tier === 'gold').length;
        const silverCount = result.current.sitters.filter((s) => s.tier === 'silver').length;
        expect(goldCount).toBe(3);
        expect(silverCount).toBe(2);
    });
});

describe('useSitterStats', () => {
    it('loads demo sitter stats', async () => {
        const { result } = renderHook(() => useSitterStats('sitter-1'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.stats.totalSessions).toBe(247);
        expect(result.current.stats.avgRating).toBe(4.87);
        expect(result.current.stats.tier).toBe('gold');
        expect(result.current.stats.onTimeRate).toBe('98%');
        expect(result.current.stats.safetyDays).toBe(365);
    });
});

describe('useSitterProfile', () => {
    it('loads demo sitter profile', async () => {
        const { result } = renderHook(() => useSitterProfile('sitter-1'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.profile.name).toBe('Kim Minjung');
        expect(result.current.profile.tier).toBe('gold');
        expect(result.current.profile.rating).toBe(4.95);
        expect(result.current.profile.totalSessions).toBe(247);
        expect(result.current.profile.certifications.length).toBeGreaterThan(0);
        expect(result.current.profile.languages.length).toBe(3);
    });

    it('profile has complete language details', async () => {
        const { result } = renderHook(() => useSitterProfile('sitter-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const languages = result.current.profile.languages;
        expect(languages[0]).toHaveProperty('name');
        expect(languages[0]).toHaveProperty('level');
        expect(languages[0]).toHaveProperty('flag');
        expect(languages.map((l) => l.name)).toEqual(['Korean', 'English', 'Japanese']);
    });
});
