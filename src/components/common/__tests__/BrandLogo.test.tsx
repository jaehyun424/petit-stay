import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLogo } from '../BrandLogo';

describe('BrandLogo', () => {
    it('renders brand name', () => {
        render(<BrandLogo />);
        expect(screen.getByText('Petit')).toBeTruthy();
        expect(screen.getByText('Stay')).toBeTruthy();
    });

    it('renders with default md size', () => {
        const { container } = render(<BrandLogo />);
        const nameEl = container.querySelector('.brand-logo-name');
        expect(nameEl).toBeTruthy();
        expect(nameEl?.getAttribute('style')).toContain('1.25rem');
    });

    it('renders with sm size', () => {
        const { container } = render(<BrandLogo size="sm" />);
        const nameEl = container.querySelector('.brand-logo-name');
        expect(nameEl?.getAttribute('style')).toContain('1rem');
    });

    it('renders with lg size', () => {
        const { container } = render(<BrandLogo size="lg" />);
        const nameEl = container.querySelector('.brand-logo-name');
        expect(nameEl?.getAttribute('style')).toContain('1.75rem');
    });

    it('applies custom className', () => {
        const { container } = render(<BrandLogo className="custom-class" />);
        const wrapper = container.querySelector('.brand-logo-wrap');
        expect(wrapper?.classList.contains('custom-class')).toBe(true);
    });

    it('renders Stay in gold accent span', () => {
        const { container } = render(<BrandLogo />);
        const goldSpan = container.querySelector('.brand-logo-name-gold');
        expect(goldSpan?.textContent).toBe('Stay');
    });

    it('has correct wrapper classes', () => {
        const { container } = render(<BrandLogo />);
        const wrapper = container.querySelector('.brand-logo-wrap');
        expect(wrapper?.classList.contains('brand-logo-text')).toBe(true);
    });
});
