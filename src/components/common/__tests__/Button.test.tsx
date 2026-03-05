import { render, screen, fireEvent } from '../../../test/utils';
import { Button, IconButton } from '../Button';

describe('Button', () => {
    it('renders children text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies variant class', () => {
        render(<Button variant="gold">Gold</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-gold');
    });

    it('applies fullWidth class', () => {
        render(<Button fullWidth>Full</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-full');
    });

    it('shows spinner when loading', () => {
        render(<Button isLoading>Loading</Button>);
        const btn = screen.getByRole('button');
        expect(btn).toBeDisabled();
        expect(btn.querySelector('.spinner')).toBeInTheDocument();
        // Loading text is still in DOM but visually hidden via btn-loading-text class
        expect(btn.querySelector('.btn-loading-text')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('calls onClick handler', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when loading', () => {
        const handleClick = vi.fn();
        render(<Button isLoading onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders icon on left by default', () => {
        render(<Button icon={<span data-testid="icon">★</span>}>Star</Button>);
        expect(screen.getByTestId('icon').parentElement).toHaveClass('btn-icon-left');
    });

    it('renders icon on right when specified', () => {
        render(<Button icon={<span data-testid="icon">★</span>} iconPosition="right">Star</Button>);
        expect(screen.getByTestId('icon').parentElement).toHaveClass('btn-icon-right');
    });

    it('applies size class for sm', () => {
        render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-sm');
    });

    it('does not apply size class for md (default)', () => {
        render(<Button size="md">Medium</Button>);
        expect(screen.getByRole('button')).not.toHaveClass('btn-md');
    });
});

describe('IconButton', () => {
    it('renders with aria-label', () => {
        render(<IconButton icon={<span>X</span>} aria-label="Close" />);
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('applies btn-icon class', () => {
        render(<IconButton icon={<span>X</span>} aria-label="Close" />);
        expect(screen.getByRole('button')).toHaveClass('btn-icon');
    });
});
