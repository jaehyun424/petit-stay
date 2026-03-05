import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import { LanguageSwitcher } from '../LanguageSwitcher';

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the language switcher button', () => {
        render(<LanguageSwitcher />);
        expect(screen.getByLabelText('aria.switchLanguage')).toBeTruthy();
    });

    it('displays current language code', () => {
        render(<LanguageSwitcher />);
        expect(screen.getByText('EN')).toBeTruthy();
    });

    it('has aria-expanded false by default', () => {
        render(<LanguageSwitcher />);
        expect(screen.getByLabelText('aria.switchLanguage')).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens dropdown on click', async () => {
        render(<LanguageSwitcher />);
        fireEvent.click(screen.getByLabelText('aria.switchLanguage'));

        await waitFor(() => {
            expect(screen.getByLabelText('aria.switchLanguage')).toHaveAttribute('aria-expanded', 'true');
        });
    });

    it('shows all language options when open', async () => {
        render(<LanguageSwitcher />);
        fireEvent.click(screen.getByLabelText('aria.switchLanguage'));

        await waitFor(() => {
            expect(screen.getByText('English')).toBeTruthy();
        });
    });

    it('closes dropdown after selecting a language', async () => {
        render(<LanguageSwitcher />);
        fireEvent.click(screen.getByLabelText('aria.switchLanguage'));

        await waitFor(() => {
            expect(screen.getByText('English')).toBeTruthy();
        });

        fireEvent.click(screen.getByText('English'));

        await waitFor(() => {
            expect(screen.getByLabelText('aria.switchLanguage')).toHaveAttribute('aria-expanded', 'false');
        });
    });

    it('closes dropdown on Escape key', async () => {
        render(<LanguageSwitcher />);
        fireEvent.click(screen.getByLabelText('aria.switchLanguage'));

        await waitFor(() => {
            expect(screen.getByLabelText('aria.switchLanguage')).toHaveAttribute('aria-expanded', 'true');
        });

        fireEvent.keyDown(document, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.getByLabelText('aria.switchLanguage')).toHaveAttribute('aria-expanded', 'false');
        });
    });

    it('toggles dropdown open and closed', async () => {
        render(<LanguageSwitcher />);
        const btn = screen.getByLabelText('aria.switchLanguage');

        // Open
        fireEvent.click(btn);
        await waitFor(() => {
            expect(btn).toHaveAttribute('aria-expanded', 'true');
        });

        // Close by clicking again
        fireEvent.click(btn);
        await waitFor(() => {
            expect(btn).toHaveAttribute('aria-expanded', 'false');
        });
    });
});
