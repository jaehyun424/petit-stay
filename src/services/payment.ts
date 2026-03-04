// ============================================
// Petit Stay - Payment Service (Stripe)
// ============================================

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// ----------------------------------------
// Types
// ----------------------------------------
export interface CreateCheckoutSessionParams {
    bookingId: string;
    hotelId: string;
    amount: number;
    currency: 'krw' | 'usd' | 'jpy';
    guestEmail?: string;
    description?: string;
    locale?: string;
}

export interface CheckoutSessionResult {
    sessionId: string;
    url: string;
}

export interface PaymentStatusResult {
    status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
    transactionId?: string;
    paidAt?: string;
}

// ----------------------------------------
// Payment Service
// ----------------------------------------
export const paymentService = {
    /**
     * Create a Stripe Checkout Session via Cloud Function.
     * Returns the session ID and URL for redirect.
     */
    async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
        const createSession = httpsCallable<CreateCheckoutSessionParams, CheckoutSessionResult>(
            functions,
            'createStripeCheckoutSession'
        );
        const result = await createSession(params);
        return result.data;
    },

    /**
     * Redirect the user to Stripe Checkout.
     * Uses the Checkout Session URL directly (recommended approach).
     */
    async redirectToCheckout(checkoutUrl: string): Promise<void> {
        if (!checkoutUrl) {
            throw new Error('No checkout URL provided');
        }
        window.location.href = checkoutUrl;
    },

    /**
     * Query payment status for a booking via Cloud Function.
     */
    async getPaymentStatus(bookingId: string): Promise<PaymentStatusResult> {
        const getStatus = httpsCallable<{ bookingId: string }, PaymentStatusResult>(
            functions,
            'getPaymentStatus'
        );
        const result = await getStatus({ bookingId });
        return result.data;
    },

    /**
     * Generate a payment link for a booking (used by Hotel Console).
     * Creates a Checkout Session and returns the full URL.
     */
    async generatePaymentLink(params: CreateCheckoutSessionParams): Promise<string> {
        const session = await this.createCheckoutSession(params);
        return session.url;
    },
};
