import { render, screen, fireEvent } from '../../../test/utils';
import { Pagination, usePagination } from '../Pagination';
import { renderHook } from '@testing-library/react';

describe('Pagination', () => {
    it('does not render when only 1 page', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders page buttons', () => {
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('calls onPageChange when clicking a page', () => {
        const handleChange = vi.fn();
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />
        );

        fireEvent.click(screen.getByText('3'));
        expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('disables previous on first page', () => {
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
        );

        const prevBtn = screen.getByLabelText('aria.previousPage');
        expect(prevBtn).toBeDisabled();
    });

    it('disables next on last page', () => {
        render(
            <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
        );

        const nextBtn = screen.getByLabelText('aria.nextPage');
        expect(nextBtn).toBeDisabled();
    });

    it('marks current page', () => {
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
        );

        const page3 = screen.getByText('3');
        expect(page3).toHaveAttribute('aria-current', 'page');
    });
});

describe('usePagination', () => {
    it('calculates total pages', () => {
        const items = Array.from({ length: 25 }, (_, i) => i);
        const { result } = renderHook(() => usePagination(items, 10));

        expect(result.current.totalPages).toBe(3);
    });

    it('returns correct page items', () => {
        const items = Array.from({ length: 25 }, (_, i) => i);
        const { result } = renderHook(() => usePagination(items, 10));

        const page1 = result.current.getPageItems(1);
        expect(page1).toHaveLength(10);
        expect(page1[0]).toBe(0);
        expect(page1[9]).toBe(9);

        const page3 = result.current.getPageItems(3);
        expect(page3).toHaveLength(5);
        expect(page3[0]).toBe(20);
    });
});
