import { renderHook, act, waitFor } from '@testing-library/react';
import { useChildren } from '../children/useChildren';

// In test mode, DEMO_MODE is true (from setup.ts)

describe('useChildren', () => {
    it('loads demo children', async () => {
        const { result } = renderHook(() => useChildren('parent-1'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.children.length).toBeGreaterThan(0);
        expect(result.current.children[0].name).toBe('Emma');
        expect(result.current.children[0].age).toBe(5);
    });

    it('has expected child fields', async () => {
        const { result } = renderHook(() => useChildren('parent-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const child = result.current.children[0];
        expect(child).toHaveProperty('id');
        expect(child).toHaveProperty('name');
        expect(child).toHaveProperty('age');
        expect(child).toHaveProperty('allergies');
        expect(child).toHaveProperty('gender');
        expect(child.gender).toBe('female');
        expect(child.allergies).toContain('peanuts');
    });

    it('addChild appends a new child', async () => {
        const { result } = renderHook(() => useChildren('parent-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const initialCount = result.current.children.length;

        await act(async () => {
            await result.current.addChild({
                name: 'Liam',
                age: 3,
                allergies: [],
                gender: 'male',
            });
        });

        expect(result.current.children.length).toBe(initialCount + 1);
        expect(result.current.children[result.current.children.length - 1].name).toBe('Liam');
    });

    it('removeChild removes the specified child', async () => {
        const { result } = renderHook(() => useChildren('parent-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const childId = result.current.children[0].id;
        const initialCount = result.current.children.length;

        act(() => {
            result.current.removeChild(childId);
        });

        await waitFor(() => {
            expect(result.current.children.length).toBe(initialCount - 1);
        });

        expect(result.current.children.find((c) => c.id === childId)).toBeUndefined();
    });

    it('updateChild modifies an existing child', async () => {
        const { result } = renderHook(() => useChildren('parent-1'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const childId = result.current.children[0].id;

        act(() => {
            result.current.updateChild(childId, { name: 'Emma Rose', age: 6 });
        });

        await waitFor(() => {
            expect(result.current.children[0].name).toBe('Emma Rose');
        });

        expect(result.current.children[0].age).toBe(6);
    });
});
