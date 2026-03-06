import { render, screen, fireEvent } from '../../../test/utils';
import { ChatPanel } from '../ChatPanel';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

// Mock useMessaging hook
const mockSendMessage = vi.fn();
const mockOpenConversation = vi.fn();
const mockSetTyping = vi.fn();
const mockMarkAsRead = vi.fn();

vi.mock('../../../hooks/common/useMessaging', () => ({
    useMessaging: () => ({
        messages: [
            {
                id: '1',
                senderId: 'demo-sitter-1',
                senderName: 'Kim Minjung',
                text: 'Hello! Emma is doing great.',
                type: 'text',
                createdAt: new Date(),
                readBy: [],
            },
            {
                id: '2',
                senderId: 'demo-parent-1',
                senderName: 'Sarah Johnson',
                text: 'Great to hear!',
                type: 'text',
                createdAt: new Date(),
                readBy: ['demo-sitter-1'],
            },
        ],
        conversations: [],
        isLoading: false,
        sendMessage: mockSendMessage,
        openConversation: mockOpenConversation,
        activeConversationId: 'conv-1',
        setActiveConversationId: vi.fn(),
        typingUsers: [],
        setTyping: mockSetTyping,
        markAsRead: mockMarkAsRead,
    }),
}));

describe('ChatPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when closed', () => {
        const { container } = render(
            <ChatPanel isOpen={false} onClose={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders chat panel when open', () => {
        render(
            <ChatPanel isOpen={true} onClose={vi.fn()} otherUserName="Kim Minjung" />
        );
        // Name appears in header h3 and as chat-sender span
        const elements = screen.getAllByText('Kim Minjung');
        expect(elements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('chat.online')).toBeInTheDocument();
    });

    it('displays messages', () => {
        render(
            <ChatPanel isOpen={true} onClose={vi.fn()} otherUserName="Kim Minjung" />
        );
        expect(screen.getByText('Hello! Emma is doing great.')).toBeInTheDocument();
        expect(screen.getByText('Great to hear!')).toBeInTheDocument();
    });

    it('shows read receipts on own messages', () => {
        render(
            <ChatPanel isOpen={true} onClose={vi.fn()} otherUserName="Kim Minjung" />
        );
        // Own message has readBy with entries, so should show checkmarks
        const receipts = screen.getAllByTitle('chat.read');
        expect(receipts.length).toBeGreaterThan(0);
    });

    it('sends message on enter key', () => {
        render(
            <ChatPanel isOpen={true} onClose={vi.fn()} otherUserName="Kim Minjung" />
        );
        const input = screen.getByPlaceholderText('chat.messagePlaceholder');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(mockSendMessage).toHaveBeenCalledWith('Test message', 'Sarah Johnson');
    });

    it('triggers typing indicator on input', () => {
        render(
            <ChatPanel isOpen={true} onClose={vi.fn()} otherUserName="Kim Minjung" />
        );
        const input = screen.getByPlaceholderText('chat.messagePlaceholder');
        fireEvent.input(input);
        expect(mockSetTyping).toHaveBeenCalledWith(true);
    });

    it('calls markAsRead when panel opens', () => {
        render(
            <ChatPanel isOpen={true} onClose={vi.fn()} otherUserName="Kim Minjung" />
        );
        expect(mockMarkAsRead).toHaveBeenCalled();
    });

    it('closes when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <ChatPanel isOpen={true} onClose={onClose} otherUserName="Kim Minjung" />
        );
        fireEvent.click(screen.getByLabelText('aria.closeChat'));
        expect(onClose).toHaveBeenCalled();
    });
});
