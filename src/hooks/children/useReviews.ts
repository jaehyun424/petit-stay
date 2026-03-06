// ============================================
// Petit Stay - Review Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../common/useDemo';
import { DEMO_REVIEWS, type DemoReview } from '../../data/demo';
import { reviewService } from '../../services/firestore';

// ----------------------------------------
// Sitter Reviews Hook
// ----------------------------------------
export function useReviews(sitterId?: string) {
    const [reviews, setReviews] = useState<DemoReview[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                const sitterReviews = sitterId
                    ? DEMO_REVIEWS.filter((r) => r.sitterId === sitterId)
                    : DEMO_REVIEWS;
                setReviews(sitterReviews);
                if (sitterReviews.length > 0) {
                    setAverageRating(
                        sitterReviews.reduce((sum, r) => sum + r.rating, 0) / sitterReviews.length
                    );
                }
                setError(null);
                setIsLoading(false);
            }, 400);
            return () => clearTimeout(timer);
        }

        if (!sitterId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function load() {
            try {
                const fbReviews = await reviewService.getSitterReviews(sitterId!);
                if (cancelled) return;

                const mapped: DemoReview[] = fbReviews.map((r, i) => ({
                    id: `review-${i}`,
                    bookingId: '',
                    sitterId: sitterId!,
                    sitterName: '',
                    parentId: '',
                    parentName: '',
                    rating: r.rating,
                    comment: r.comment || '',
                    tags: r.tags || [],
                    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(),
                    response: r.response,
                }));

                setReviews(mapped);
                if (mapped.length > 0) {
                    setAverageRating(
                        mapped.reduce((sum, r) => sum + r.rating, 0) / mapped.length
                    );
                }
                setError(null);
                setIsLoading(false);
            } catch {
                if (!cancelled) {
                    setError('Failed to load reviews');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [sitterId, retryCount]);

    const submitReview = useCallback(async (review: {
        bookingId: string;
        sitterId: string;
        rating: number;
        comment: string;
        tags: string[];
    }) => {
        if (DEMO_MODE) {
            await new Promise((r) => setTimeout(r, 1000));
            const newReview: DemoReview = {
                id: `review-${Date.now()}`,
                bookingId: review.bookingId,
                sitterId: review.sitterId,
                sitterName: '',
                parentId: 'demo-parent',
                parentName: 'You',
                rating: review.rating,
                comment: review.comment,
                tags: review.tags,
                createdAt: new Date(),
            };
            setReviews((prev) => [newReview, ...prev]);
            return newReview.id;
        }

        const id = await reviewService.createReview(review);
        return id;
    }, []);

    return { reviews, averageRating, isLoading, submitReview, error, retry };
}
