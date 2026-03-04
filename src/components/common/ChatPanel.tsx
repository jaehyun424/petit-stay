// ============================================
// Petit Stay - Chat Panel Component
// Real-time messaging UI
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../hooks/useMessaging';
import type { Message } from '../../services/messaging';
import '../../styles/components/chat-panel.css';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    otherUserId?: string;
    otherUserName?: string;
    bookingId?: string;
}

export function ChatPanel({ isOpen, onClose, otherUserId, otherUserName, bookingId }: ChatPanelProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const userName = user ? `${user.profile.firstName} ${user.profile.lastName}` : t('chat.userFallback');
    const { messages, sendMessage, openConversation, activeConversationId, typingUsers, setTyping: setTypingStatus, markAsRead } = useMessaging(user?.id);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleTypingInput = useCallback(() => {
        if (!activeConversationId || !user?.id) return;
        setTypingStatus?.(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus?.(false);
        }, 2000);
    }, [activeConversationId, user?.id, setTypingStatus]);

    // Open/create conversation when panel opens
    useEffect(() => {
        if (isOpen && otherUserId && user?.id) {
            const names: Record<string, string> = {
                [user.id]: userName,
            };
            if (otherUserId) names[otherUserId] = otherUserName || t('chat.userFallback');
            openConversation(otherUserId, names, bookingId);
        }
    }, [isOpen, otherUserId, user?.id, userName, otherUserName, bookingId, openConversation]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read when panel opens or new messages arrive
    useEffect(() => {
        if (isOpen && markAsRead) {
            markAsRead();
        }
    }, [isOpen, messages, markAsRead]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        await sendMessage(text, userName);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-panel-overlay" onClick={onClose}>
            <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <h3>{otherUserName || t('chat.chatTitle')}</h3>
                        <span className="chat-status">{t('chat.online')}</span>
                    </div>
                    <button className="chat-close" onClick={onClose} aria-label={t('aria.closeChat')}>
                        &times;
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg: Message) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.senderId === user?.id ? 'chat-message-own' : 'chat-message-other'} ${msg.type === 'emergency' ? 'chat-message-emergency' : ''}`}
                        >
                            <div className="chat-bubble">
                                {msg.senderId !== user?.id && (
                                    <span className="chat-sender">{msg.senderName}</span>
                                )}
                                <p>{msg.text}</p>
                                <span className="chat-time">{formatTime(msg.createdAt)}</span>
                                {msg.senderId === user?.id && msg.readBy && msg.readBy.length > 0 && (
                                    <span className="read-receipt" title={t('chat.read')}><CheckCheck size={14} strokeWidth={2} /></span>
                                )}
                            </div>
                        </div>
                    ))}
                    {typingUsers.length > 0 && (
                        <div className="typing-indicator">
                            <span className="typing-dots">
                                <span></span><span></span><span></span>
                            </span>
                            <span className="typing-text">{t('chat.typingIndicator', { name: otherUserName || t('chat.someone') })}</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <input
                        className="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onInput={handleTypingInput}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.messagePlaceholder')}
                    />
                    <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
                        {t('chat.send')}
                    </button>
                </div>
            </div>

        </div>
    );
}
