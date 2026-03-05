// ============================================
// Petit Stay - Messaging Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from './useDemo';
import { messagingService, type Message, type Conversation } from '../services/messaging';
import { fcmService } from '../services/fcm';

// ----------------------------------------
// Demo Messages
// ----------------------------------------
const DEMO_MESSAGES: Message[] = [
    { id: '1', senderId: 'demo-sitter-1', senderName: 'Kim Minjung', text: 'Hello! Emma is doing great, playing with blocks now.', type: 'text', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '2', senderId: 'demo-parent-1', senderName: 'Sarah Johnson', text: 'Great to hear! Has she had her snack?', type: 'text', createdAt: new Date(Date.now() - 1000 * 60 * 25) },
    { id: '3', senderId: 'demo-sitter-1', senderName: 'Kim Minjung', text: 'Yes, she had apple slices and juice about 20 minutes ago.', type: 'text', createdAt: new Date(Date.now() - 1000 * 60 * 20) },
];

// ----------------------------------------
// Hook
// ----------------------------------------
export function useMessaging(userId?: string, conversationId?: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = useCallback(() => {
        setError(null);
        setRetryCount((c) => c + 1);
    }, []);
    const [activeConversationId, setActiveConversationId] = useState(conversationId);
    const [typingUsers] = useState<string[]>([]);

    // Register FCM token for push notifications
    useEffect(() => {
        if (DEMO_MODE || !userId) return;
        fcmService.registerToken(userId).catch((err) => {
            console.warn('FCM token registration failed:', err);
        });
    }, [userId]);

    // Subscribe to conversations list
    useEffect(() => {
        if (DEMO_MODE || !userId) {
            setIsLoading(false);
            return;
        }

        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = messagingService.subscribeToConversations(userId, (convs) => {
                setConversations(convs);
                setError(null);
                setIsLoading(false);
            });
        } catch (err) {
            console.error('Failed to subscribe to conversations:', err);
            setError('Failed to load conversations');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [userId, retryCount]);

    // Subscribe to messages in active conversation
    useEffect(() => {
        if (DEMO_MODE) {
            setMessages(DEMO_MESSAGES);
            setIsLoading(false);
            return;
        }

        if (!activeConversationId) return;

        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = messagingService.subscribeToMessages(activeConversationId, (msgs) => {
                setMessages(msgs);
                setError(null);
                setIsLoading(false);
            });
        } catch (err) {
            console.error('Failed to subscribe to messages:', err);
            setError('Failed to load messages');
            setIsLoading(false);
        }

        return () => unsubscribe?.();
    }, [activeConversationId, retryCount]);

    // Send a message
    const sendMessage = useCallback(async (text: string, senderName: string) => {
        if (DEMO_MODE) {
            const newMsg: Message = {
                id: `demo-${Date.now()}`,
                senderId: userId || 'demo-user',
                senderName,
                text,
                type: 'text',
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, newMsg]);
            return;
        }

        if (!activeConversationId || !userId) return;
        try {
            await messagingService.sendMessage(activeConversationId, userId, senderName, text);
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
        }
    }, [activeConversationId, userId]);

    // Open or create a conversation
    const openConversation = useCallback(async (
        otherUserId: string,
        names: Record<string, string>,
        bookingId?: string,
    ) => {
        if (DEMO_MODE) {
            setActiveConversationId('demo-conversation-1');
            return 'demo-conversation-1';
        }

        if (!userId) return '';
        try {
            const convId = await messagingService.getOrCreateConversation(
                userId, otherUserId, names, bookingId
            );
            setActiveConversationId(convId);
            return convId;
        } catch (err) {
            console.error('Failed to open conversation:', err);
            setError('Failed to open conversation');
            return '';
        }
    }, [userId]);

    // Set typing status
    const setTyping = useCallback(async (isTyping: boolean) => {
        if (DEMO_MODE || !activeConversationId || !userId) return;
        try {
            await messagingService.setTyping(activeConversationId, userId, isTyping);
        } catch (err) {
            console.error('Failed to set typing status:', err);
        }
    }, [activeConversationId, userId]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (DEMO_MODE || !activeConversationId || !userId) return;
        try {
            await messagingService.markAsRead(activeConversationId, userId);
        } catch (err) {
            console.error('Failed to mark messages as read:', err);
        }
    }, [activeConversationId, userId]);

    return {
        messages,
        conversations,
        isLoading,
        error,
        retry,
        sendMessage,
        openConversation,
        activeConversationId,
        setActiveConversationId,
        typingUsers,
        setTyping,
        markAsRead,
    };
}
