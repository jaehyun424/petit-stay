// ============================================
// Petit Stay - Insurance Hook
// ============================================

import { useState, useEffect } from 'react';
import { DEMO_MODE } from './useDemo';
import { insuranceService } from '../services/insurance';
import type { InsurancePolicy, BookingInsurance } from '../types';

// ----------------------------------------
// Demo Data
// ----------------------------------------
const now = new Date();
function monthsFromNow(n: number): Date {
    const d = new Date(now);
    d.setMonth(d.getMonth() + n);
    return d;
}
function monthsAgo(n: number): Date {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d;
}
function daysAgo(n: number): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
}

const DEMO_POLICIES: InsurancePolicy[] = [
    {
        id: 'ins-1',
        provider: 'Samsung Fire & Marine Insurance',
        policyNumber: 'SF-2026-00412',
        coverageType: 'comprehensive',
        maxCoverage: 100000000,
        currency: 'KRW',
        validFrom: monthsAgo(6),
        validTo: monthsFromNow(6),
    },
    {
        id: 'ins-2',
        provider: 'Tokio Marine Insurance',
        policyNumber: 'TM-2026-00887',
        coverageType: 'liability',
        maxCoverage: 50000000,
        currency: 'KRW',
        validFrom: monthsAgo(3),
        validTo: monthsFromNow(9),
    },
    {
        id: 'ins-3',
        provider: 'DB Insurance',
        policyNumber: 'DB-2025-01234',
        coverageType: 'accident',
        maxCoverage: 30000000,
        currency: 'KRW',
        validFrom: monthsAgo(14),
        validTo: monthsAgo(2),
    },
];

const DEMO_BOOKING_INSURANCE: BookingInsurance[] = [
    { bookingId: 'BK-001', policyId: 'ins-1', status: 'active' },
    { bookingId: 'BK-002', policyId: 'ins-1', status: 'active' },
    { bookingId: 'BK-003', policyId: 'ins-2', status: 'claimed', claimAmount: 350000, claimDescription: 'Minor injury during play activity', claimedAt: daysAgo(1) },
    { bookingId: 'BK-004', policyId: 'ins-1', status: 'pending' },
    { bookingId: 'BK-005', policyId: 'ins-3', status: 'expired' },
    { bookingId: 'BK-006', policyId: 'ins-1', status: 'active' },
    { bookingId: 'BK-007', policyId: 'ins-2', status: 'claimed', claimAmount: 120000, claimDescription: 'Property damage - broken toy', claimedAt: daysAgo(5) },
];

// ----------------------------------------
// Hook: Insurance Dashboard
// ----------------------------------------
export function useInsurance() {
    const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
    const [bookingInsurance, setBookingInsurance] = useState<BookingInsurance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (DEMO_MODE) {
            const timer = setTimeout(() => {
                setPolicies(DEMO_POLICIES);
                setBookingInsurance(DEMO_BOOKING_INSURANCE);
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }

        setIsLoading(true);
        let unsubPolicies: (() => void) | undefined;
        let unsubBookingIns: (() => void) | undefined;

        try {
            unsubPolicies = insuranceService.subscribeToPolicies((data) => {
                setPolicies(data);
            });
            unsubBookingIns = insuranceService.subscribeToBookingInsurance((data) => {
                setBookingInsurance(data);
            });
            setIsLoading(false);
        } catch {
            setError('Failed to load insurance data');
            setIsLoading(false);
        }

        return () => {
            unsubPolicies?.();
            unsubBookingIns?.();
        };
    }, []);

    // Derived stats
    const activePolicies = policies.filter((p) => p.validTo >= now);
    const expiredPolicies = policies.filter((p) => p.validTo < now);
    const totalCoverage = activePolicies.reduce((sum, p) => sum + p.maxCoverage, 0);
    const activeBookings = bookingInsurance.filter((b) => b.status === 'active').length;
    const pendingClaims = bookingInsurance.filter((b) => b.status === 'pending').length;
    const claimedCount = bookingInsurance.filter((b) => b.status === 'claimed').length;
    const totalClaimAmount = bookingInsurance
        .filter((b) => b.status === 'claimed' && b.claimAmount)
        .reduce((sum, b) => sum + (b.claimAmount || 0), 0);

    return {
        policies,
        bookingInsurance,
        activePolicies,
        expiredPolicies,
        totalCoverage,
        activeBookings,
        pendingClaims,
        claimedCount,
        totalClaimAmount,
        isLoading,
        error,
    };
}
