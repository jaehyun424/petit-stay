import { render, screen, fireEvent } from '../../../test/utils';
import { Modal, ConfirmModal } from '../Modal';

describe('Modal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders when open', () => {
        render(
            <Modal {...defaultProps}>
                <p>Modal content</p>
            </Modal>
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <Modal {...defaultProps} isOpen={false}>
                <p>Modal content</p>
            </Modal>
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows title when provided', () => {
        render(
            <Modal {...defaultProps} title="Test Title">
                <p>Content</p>
            </Modal>
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Title').id).toBe('modal-title');
    });

    it('shows children content', () => {
        render(
            <Modal {...defaultProps}>
                <p>Hello from modal</p>
            </Modal>
        );
        expect(screen.getByText('Hello from modal')).toBeInTheDocument();
    });

    it('calls onClose on Escape key', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose}>
                <p>Content</p>
            </Modal>
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape when closeOnEscape is false', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} closeOnEscape={false}>
                <p>Content</p>
            </Modal>
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('shows footer when provided', () => {
        render(
            <Modal {...defaultProps} footer={<button>Save</button>}>
                <p>Content</p>
            </Modal>
        );
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
        const { container } = render(
            <Modal {...defaultProps}>
                <p>Content</p>
            </Modal>
        );
        expect(container.querySelector('.modal-footer')).not.toBeInTheDocument();
    });

    it('applies size class', () => {
        render(
            <Modal {...defaultProps} size="lg">
                <p>Content</p>
            </Modal>
        );
        expect(screen.getByRole('dialog')).toHaveClass('modal-lg');
    });

    it('shows close button by default', () => {
        render(
            <Modal {...defaultProps} title="Title">
                <p>Content</p>
            </Modal>
        );
        expect(screen.getByLabelText('aria.closeModal')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
        render(
            <Modal {...defaultProps} title="Title" showCloseButton={false}>
                <p>Content</p>
            </Modal>
        );
        expect(screen.queryByLabelText('aria.closeModal')).not.toBeInTheDocument();
    });
});

describe('ConfirmModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: 'Confirm Action',
        message: 'Are you sure?',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders title and message', () => {
        render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText('Confirm Action')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('renders confirm and cancel buttons with default text', () => {
        render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText('Confirm')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        const onConfirm = vi.fn();
        render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByText('Confirm'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', () => {
        const onClose = vi.fn();
        render(<ConfirmModal {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders custom confirm and cancel text', () => {
        render(
            <ConfirmModal
                {...defaultProps}
                confirmText="Delete"
                cancelText="Go back"
            />
        );
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Go back')).toBeInTheDocument();
    });

    it('disables buttons when isLoading', () => {
        render(<ConfirmModal {...defaultProps} isLoading />);
        expect(screen.getByText('Cancel')).toBeDisabled();
    });
});
