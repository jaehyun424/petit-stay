// ============================================
// Petit Stay - Messaging Service
// Firestore-based real-time messaging
// ============================================

import {
    collection,
    doc,
    addDoc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ----------------------------------------
// Types
// ----------------------------------------
export interface Conversation {
    id: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage?: string;
    lastMessageAt?: Date;
    bookingId?: string;
    createdAt: Date;
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    type: 'text' | 'system' | 'emergency';
    readBy?: string[];
    createdAt: Date;
}

// ----------------------------------------
// Service
// ----------------------------------------
export const messagingService = {
    // Find or create a conversation between two users
    async getOrCreateConversation(
        userId1: string,
        userId2: string,
        names: Record<string, string>,
        bookingId?: string,
    ): Promise<string> {
        // Check if conversation already exists
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId1)
        );
        const snapshot = await getDocs(q);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.participants.includes(userId2)) {
                return doc.id;
            }
        }

        // Create new conversation
        const convRef = doc(collection(db, 'conversations'));
        await setDoc(convRef, {
            participants: [userId1, userId2],
            participantNames: names,
            bookingId: bookingId || null,
            createdAt: serverTimestamp(),
        });
        return convRef.id;
    },

    // Send a message
    async sendMessage(
        conversationId: string,
        senderId: string,
        senderName: string,
        text: string,
        type: Message['type'] = 'text',
    ): Promise<void> {
        await addDoc(
            collection(db, 'conversations', conversationId, 'messages'),
            {
                senderId,
                senderName,
                text,
                type,
                createdAt: serverTimestamp(),
            }
        );

        // Update last message on conversation
        await updateDoc(doc(db, 'conversations', conversationId), {
            lastMessage: text,
            lastMessageAt: serverTimestamp(),
        });
    },

    // Subscribe to messages in a conversation (real-time)
    subscribeToMessages(
        conversationId: string,
        callback: (messages: Message[]) => void,
        onError?: (error: Error) => void,
    ) {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'asc'),
            limit(200)
        );
        return onSnapshot(q, (snapshot) => {
            const messages: Message[] = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    senderId: data.senderId,
                    senderName: data.senderName,
                    text: data.text,
                    type: data.type || 'text',
                    readBy: data.readBy || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                };
            });
            callback(messages);
        }, (error) => {
            console.error('Firestore subscription error (messages):', error);
            onError?.(error);
        });
    },

    // Set typing status
    async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
        await updateDoc(doc(db, 'conversations', conversationId), {
            [`typing.${userId}`]: isTyping ? Date.now() : null,
        });
    },

    // Mark messages as read
    async markAsRead(conversationId: string, userId: string): Promise<void> {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        const batch = snapshot.docs.filter(d => {
            const data = d.data();
            return data.senderId !== userId && !(data.readBy || []).includes(userId);
        });
        for (const msgDoc of batch) {
            await updateDoc(doc(db, 'conversations', conversationId, 'messages', msgDoc.id), {
                readBy: [...(msgDoc.data().readBy || []), userId],
            });
        }
    },

    // Get user's conversations
    subscribeToConversations(
        userId: string,
        callback: (conversations: Conversation[]) => void,
        onError?: (error: Error) => void,
    ) {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            const conversations: Conversation[] = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    participants: data.participants,
                    participantNames: data.participantNames || {},
                    lastMessage: data.lastMessage,
                    lastMessageAt: data.lastMessageAt?.toDate(),
                    bookingId: data.bookingId,
                    createdAt: data.createdAt?.toDate() || new Date(),
                };
            });
            callback(conversations);
        }, (error) => {
            console.error('Firestore subscription error (conversations):', error);
            onError?.(error);
        });
    },
};
