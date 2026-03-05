// ============================================
// Petit Stay - Children Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import { DEMO_CHILDREN, type DemoChild } from '../data/demo';
import { childrenService } from '../services/firestore';

// ----------------------------------------
// Parent Children Hook
// ----------------------------------------
export function useChildren(parentId?: string) {
    const [children, setChildren] = useState<DemoChild[]>([]);
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
                setChildren(DEMO_CHILDREN);
                setError(null);
                setIsLoading(false);
            }, 400);
            return () => clearTimeout(timer);
        }

        if (!parentId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function load() {
            try {
                const fbChildren = await childrenService.getParentChildren(parentId!);
                if (cancelled) return;

                setChildren(fbChildren.map((c: { id: string; firstName: string; age: number; allergies: string[]; gender: 'male' | 'female' | 'other' }) => ({
                    id: c.id,
                    name: c.firstName,
                    age: c.age,
                    allergies: c.allergies,
                    gender: c.gender,
                })));
                setError(null);
                setIsLoading(false);
            } catch {
                if (!cancelled) {
                    setError('Failed to load children');
                    setIsLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [parentId, retryCount]);

    const addChild = useCallback(async (data: Omit<DemoChild, 'id'>) => {
        if (DEMO_MODE) {
            const newChild = { ...data, id: 'demo-child-' + Date.now() };
            setChildren((prev) => [...prev, newChild]);
            return newChild.id;
        }

        if (!parentId) return '';
        try {
            const id = await childrenService.addChild({
                parentId,
                firstName: data.name,
                age: data.age,
                gender: data.gender,
                allergies: data.allergies,
                consentGiven: true,
                consentTimestamp: new Date(),
                autoDeleteAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
                createdAt: new Date(),
            });
            // Reload
            const fbChildren = await childrenService.getParentChildren(parentId);
            setChildren(fbChildren.map((c: { id: string; firstName: string; age: number; allergies: string[]; gender: 'male' | 'female' | 'other' }) => ({
                id: c.id,
                name: c.firstName,
                age: c.age,
                allergies: c.allergies,
                gender: c.gender,
            })));
            return id;
        } catch {
            setError('Failed to add child');
            return '';
        }
    }, [parentId]);

    const updateChild = useCallback(async (childId: string, data: Partial<Omit<DemoChild, 'id'>>) => {
        if (DEMO_MODE) {
            setChildren((prev) => prev.map((c) => c.id === childId ? { ...c, ...data } : c));
            return;
        }

        if (!parentId) return;
        try {
            await childrenService.updateChild(childId, {
                ...(data.name !== undefined ? { firstName: data.name } : {}),
                ...(data.age !== undefined ? { age: data.age } : {}),
                ...(data.gender !== undefined ? { gender: data.gender } : {}),
                ...(data.allergies !== undefined ? { allergies: data.allergies } : {}),
            });
            // Reload
            const fbChildren = await childrenService.getParentChildren(parentId);
            setChildren(fbChildren.map((c: { id: string; firstName: string; age: number; allergies: string[]; gender: 'male' | 'female' | 'other' }) => ({
                id: c.id,
                name: c.firstName,
                age: c.age,
                allergies: c.allergies,
                gender: c.gender,
            })));
        } catch {
            setError('Failed to update child');
        }
    }, [parentId]);

    const removeChild = useCallback(async (childId: string) => {
        if (DEMO_MODE) {
            setChildren((prev) => prev.filter((c) => c.id !== childId));
            return;
        }

        if (!parentId) return;
        try {
            await childrenService.deleteChild(childId);
            setChildren((prev) => prev.filter((c) => c.id !== childId));
        } catch {
            setError('Failed to remove child');
        }
    }, [parentId]);

    return { children, isLoading, addChild, updateChild, removeChild, error, retry };
}
