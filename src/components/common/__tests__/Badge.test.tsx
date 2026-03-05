import { render, screen } from '../../../test/utils';
import { Badge, StatusBadge, TierBadge, SafetyBadge } from '../Badge';

describe('Badge', () => {
    it('renders children text', () => {
        render(<Badge>Active</Badge>);
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('applies variant class', () => {
        const { container } = render(<Badge variant="success">Done</Badge>);
        expect(container.querySelector('.badge')).toHaveClass('badge-success');
    });

    it('applies default neutral variant', () => {
        const { container } = render(<Badge>Default</Badge>);
        expect(container.querySelector('.badge')).toHaveClass('badge-neutral');
    });

    it('applies sm size class', () => {
        const { container } = render(<Badge size="sm">Small</Badge>);
        expect(container.querySelector('.badge')).toHaveClass('badge-sm');
    });

    it('renders icon when provided', () => {
        render(
            <Badge icon={<span data-testid="badge-icon">★</span>}>
                Featured
            </Badge>
        );
        expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <Badge className="my-badge">Custom</Badge>
        );
        expect(container.querySelector('.badge')).toHaveClass('my-badge');
    });
});

describe('StatusBadge', () => {
    it('renders status text for pending', () => {
        render(<StatusBadge status="pending" />);
        expect(screen.getByText('status.pending')).toBeInTheDocument();
    });

    it('renders status text for completed', () => {
        render(<StatusBadge status="completed" />);
        expect(screen.getByText('status.completed')).toBeInTheDocument();
    });

    it('renders status text for cancelled', () => {
        render(<StatusBadge status="cancelled" />);
        expect(screen.getByText('status.cancelled')).toBeInTheDocument();
    });

    it('renders status text for emergency', () => {
        render(<StatusBadge status="emergency" />);
        expect(screen.getByText('status.emergency')).toBeInTheDocument();
    });
});

describe('TierBadge', () => {
    it('renders gold tier with label', () => {
        render(<TierBadge tier="gold" />);
        expect(screen.getByText('common.tierGold')).toBeInTheDocument();
    });

    it('renders silver tier with label', () => {
        render(<TierBadge tier="silver" />);
        expect(screen.getByText('common.tierSilver')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
        render(<TierBadge tier="gold" showLabel={false} />);
        expect(screen.queryByText('common.tierGold')).not.toBeInTheDocument();
    });
});

describe('SafetyBadge', () => {
    it('renders the number of days', () => {
        render(<SafetyBadge days={42} />);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders the translated incident text', () => {
        render(<SafetyBadge days={10} />);
        expect(screen.getByText(/hotel\.daysWithoutIncident/)).toBeInTheDocument();
    });
});
