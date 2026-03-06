import { renderHook, act, waitFor } from '@testing-library/react';
import { useReviews } from '../children/useReviews';

// In test mode, DEMO_MODE is true (from setup.ts)

describe('useReviews', () => {
    it('loads reviews in demo mode', async () => {
        const { result } = renderHook(() => useReviews('demo-sitter-1'));

        // Initially loading
        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.reviews.length).toBeGreaterThan(0);
        expect(result.current.averageRating).toBeGreaterThan(0);
    });

    it('returns empty reviews for unknown sitter', async () => {
        const { result } = renderHook(() => useReviews('unknown-sitter'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.reviews).toHaveLength(0);
    });

    it('can submit a review in demo mode', async () => {
        const { result } = renderHook(() => useReviews('demo-sitter-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const initialCount = result.current.reviews.length;

        await act(async () => {
            await result.current.submitReview({
                bookingId: 'test-booking',
                sitterId: 'demo-sitter-1',
                rating: 5,
                comment: 'Great service!',
                tags: ['professional'],
            });
        });

        expect(result.current.reviews.length).toBe(initialCount + 1);
        expect(result.current.reviews[0].comment).toBe('Great service!');
    });
});
