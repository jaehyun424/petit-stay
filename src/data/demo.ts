// ============================================
// Petit Stay - Consolidated Demo Data
// Single source of truth for all demo/mock data
// ============================================

import type { DashboardStats } from '../types';

// ----------------------------------------
// Date helpers for relative demo dates
// ----------------------------------------
const now = new Date();

function daysFromNow(days: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function daysAgo(n: number): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
}

function monthsAgo(n: number): Date {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d;
}

function formatDateLabel(days: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(days: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dynamicWeekday(offsetFromToday: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetFromToday);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const date = d.getDate();
    return `${day} ${date}`;
}

/** Generate a ui-avatars URL */
function avatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C5A059&color=fff&size=80`;
}

// ----------------------------------------
// Hotel Dashboard Stats
// ----------------------------------------
export const DEMO_DASHBOARD_STATS: DashboardStats = {
    todayBookings: 5,
    activeNow: 2,
    completedToday: 3,
    todayRevenue: 900000,
    safetyDays: 94,
    pendingBookings: 1,
};

// ----------------------------------------
// Hotel Bookings (used by Dashboard + Bookings page)
// ----------------------------------------
export interface DemoBooking {
    id: string;
    confirmationCode: string;
    date: string;
    time: string;
    room: string;
    parent: { name: string; phone: string };
    children: { name: string; age: number; allergies?: string[] }[];
    sitter: { name: string; tier: 'gold' | 'silver'; avatar?: string; hotelVerified?: boolean } | null;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'pending_guest_consent' | 'pending_assignment' | 'sitter_assigned' | 'sitter_confirmed';
    totalAmount: number;
}

export const DEMO_HOTEL_BOOKINGS: DemoBooking[] = [
    {
        id: '1',
        confirmationCode: 'KCP-2026-0042',
        date: daysFromNow(0),
        time: '18:00 - 22:00',
        room: '2305',
        parent: { name: 'Sarah Johnson', phone: '+1 555-0123' },
        children: [{ name: 'Emma', age: 5, allergies: ['peanuts'] }],
        sitter: { name: 'Kim Minjung', tier: 'gold', avatar: avatarUrl('Kim Minjung'), hotelVerified: true },
        status: 'confirmed',
        totalAmount: 300000,
    },
    {
        id: '2',
        confirmationCode: 'KCP-2026-0043',
        date: daysFromNow(0),
        time: '19:00 - 23:00',
        room: '1102',
        parent: { name: 'Tanaka Yuki', phone: '+81 90-1234-5678' },
        children: [{ name: 'Yui', age: 4 }, { name: 'Haeun', age: 6 }],
        sitter: { name: 'Park Sooyeon', tier: 'gold', avatar: avatarUrl('Park Sooyeon'), hotelVerified: true },
        status: 'in_progress',
        totalAmount: 450000,
    },
    {
        id: '3',
        confirmationCode: 'KCP-2026-0044',
        date: daysFromNow(0),
        time: '20:00 - 24:00',
        room: '3501',
        parent: { name: 'Zhang Meihua', phone: '+86 138-0000-0000' },
        children: [{ name: 'Xiaoming', age: 3 }],
        sitter: null,
        status: 'pending',
        totalAmount: 300000,
    },
    {
        id: '4',
        confirmationCode: 'KCP-2026-0045',
        date: daysFromNow(-1),
        time: '17:00 - 21:00',
        room: '2108',
        parent: { name: 'Maria Garcia', phone: '+34 612-345-678' },
        children: [{ name: 'Lucas', age: 7 }],
        sitter: { name: 'Lee Jihye', tier: 'silver', avatar: avatarUrl('Lee Jihye'), hotelVerified: true },
        status: 'completed',
        totalAmount: 240000,
    },
    {
        id: '5',
        confirmationCode: 'KCP-2026-0046',
        date: daysFromNow(1),
        time: '18:00 - 22:00',
        room: '1801',
        parent: { name: 'Lee Sujin', phone: '+82 10-9876-5432' },
        children: [{ name: 'Emma', age: 5 }],
        sitter: { name: 'Sato Haruka', tier: 'gold', avatar: avatarUrl('Sato Haruka'), hotelVerified: true },
        status: 'confirmed',
        totalAmount: 360000,
    },
];

// ----------------------------------------
// Active Sessions (used by Dashboard + LiveMonitor)
// ----------------------------------------
export interface DemoActiveSession {
    id: string;
    sitter: { name: string; avatar: string | null; tier: 'gold' | 'silver' };
    room: string;
    children: { name: string; age: number }[];
    childrenText: string;
    startTime: string;
    endTime: string;
    elapsed: string;
    lastUpdate: string;
    lastActivity: string;
    activities: { time: string; activity: string; type: string }[];
    vitals: { mood: string; energy: string };
    status: 'active';
}

export const DEMO_ACTIVE_SESSIONS: DemoActiveSession[] = [
    {
        id: '1',
        sitter: { name: 'Park Sooyeon', avatar: avatarUrl('Park Sooyeon'), tier: 'gold' },
        room: '1102',
        children: [{ name: 'Yui', age: 4 }, { name: 'Haeun', age: 6 }],
        childrenText: 'Yui (4), Haeun (6)',
        startTime: '19:00',
        endTime: '23:00',
        elapsed: '2h 15m',
        lastUpdate: '2 min ago',
        lastActivity: 'Playing with blocks',
        activities: [
            { time: '21:10', activity: 'Playing with blocks', type: 'play' },
            { time: '20:30', activity: 'Snack time - Apple slices', type: 'food' },
            { time: '19:45', activity: 'Trust check-in completed', type: 'checkin' },
            { time: '19:00', activity: 'Session started', type: 'start' },
        ],
        vitals: { mood: 'happy', energy: 'high' },
        status: 'active',
    },
    {
        id: '2',
        sitter: { name: 'Kim Minjung', avatar: avatarUrl('Kim Minjung'), tier: 'gold' },
        room: '2305',
        children: [{ name: 'Emma', age: 5 }],
        childrenText: 'Emma (5)',
        startTime: '18:00',
        endTime: '22:00',
        elapsed: '3h 15m',
        lastUpdate: '1 min ago',
        lastActivity: 'Drawing and coloring',
        activities: [
            { time: '21:10', activity: 'Drawing and coloring', type: 'play' },
            { time: '20:00', activity: 'Snack time - Juice & cookies', type: 'food' },
            { time: '18:30', activity: 'Trust check-in completed', type: 'checkin' },
            { time: '18:00', activity: 'Session started', type: 'start' },
        ],
        vitals: { mood: 'calm', energy: 'medium' },
        status: 'active',
    },
];

// ----------------------------------------
// Sitters (used by SitterManagement)
// ----------------------------------------
export interface DemoSitter {
    id: string;
    name: string;
    tier: 'gold' | 'silver';
    rating: number;
    sessionsCompleted: number;
    languages: string[];
    certifications: string[];
    availability: string;
    hourlyRate: number;
    safetyDays: number;
    avatar?: string;
    hotelVerified?: boolean;
}

export const DEMO_SITTERS: DemoSitter[] = [
    {
        id: '1',
        name: 'Kim Minjung',
        tier: 'gold',
        rating: 4.95,
        sessionsCompleted: 247,
        languages: ['Korean', 'English', 'Japanese'],
        certifications: ['CPR', 'First Aid', 'Child Psychology'],
        availability: 'Available',
        hourlyRate: 90000,
        safetyDays: 365,
        avatar: avatarUrl('Kim Minjung'),
        hotelVerified: true,
    },
    {
        id: '2',
        name: 'Park Sooyeon',
        tier: 'gold',
        rating: 4.88,
        sessionsCompleted: 189,
        languages: ['Korean', 'English'],
        certifications: ['CPR', 'First Aid'],
        availability: 'In Session',
        hourlyRate: 75000,
        safetyDays: 280,
        avatar: avatarUrl('Park Sooyeon'),
        hotelVerified: true,
    },
    {
        id: '3',
        name: 'Sato Haruka',
        tier: 'gold',
        rating: 4.92,
        sessionsCompleted: 312,
        languages: ['Japanese', 'English', 'Korean'],
        certifications: ['CPR', 'First Aid', 'Child Development'],
        availability: 'Available',
        hourlyRate: 90000,
        safetyDays: 450,
        avatar: avatarUrl('Sato Haruka'),
        hotelVerified: true,
    },
    {
        id: '4',
        name: 'Chen Wei',
        tier: 'silver',
        rating: 4.78,
        sessionsCompleted: 95,
        languages: ['Chinese', 'English', 'Korean'],
        certifications: ['CPR', 'First Aid'],
        availability: 'Available',
        hourlyRate: 60000,
        safetyDays: 120,
        avatar: avatarUrl('Chen Wei'),
        hotelVerified: true,
    },
    {
        id: '5',
        name: 'Lee Jihye',
        tier: 'silver',
        rating: 4.72,
        sessionsCompleted: 134,
        languages: ['Korean', 'Chinese'],
        certifications: ['CPR', 'First Aid'],
        availability: 'In Session',
        hourlyRate: 60000,
        safetyDays: 185,
        avatar: avatarUrl('Lee Jihye'),
        hotelVerified: true,
    },
];

// ----------------------------------------
// Hotels (used by Parent Booking)
// ----------------------------------------
export interface DemoHotelOption {
    value: string;
    label: string;
}

export const DEMO_HOTELS: DemoHotelOption[] = [
    { value: 'grand-hyatt-seoul', label: 'Grand Hyatt Seoul' },
    { value: 'the-shilla-seoul', label: 'The Shilla Seoul' },
    { value: 'signiel-seoul', label: 'Signiel Seoul' },
    { value: 'four-seasons-seoul', label: 'Four Seasons Seoul' },
    { value: 'park-hyatt-busan', label: 'Park Hyatt Busan' },
];

// ----------------------------------------
// Children (used by Parent Booking + Home)
// ----------------------------------------
export interface DemoChild {
    id: string;
    name: string;
    age: number;
    allergies: string[];
    gender: 'male' | 'female' | 'other';
}

export const DEMO_CHILDREN: DemoChild[] = [
    { id: '1', name: 'Emma', age: 5, allergies: ['peanuts'], gender: 'female' },
    { id: '2', name: 'Lucas', age: 7, allergies: [], gender: 'male' },
];

// ----------------------------------------
// Parent Upcoming Booking (used by Parent Home)
// ----------------------------------------
export interface DemoUpcomingBooking {
    id: string;
    confirmationCode: string;
    dateKey: string;
    time: string;
    hotel: string;
    room: string;
    sitter: { name: string; rating: number; avatar?: string };
    childrenIds: string[];
    status: 'confirmed' | 'pending';
}

export const DEMO_UPCOMING_BOOKING: DemoUpcomingBooking = {
    id: '1',
    confirmationCode: 'KCP-2026-0042',
    dateKey: 'tonight',
    time: '18:00 - 22:00',
    hotel: 'Grand Hyatt Seoul',
    room: '2305',
    sitter: { name: 'Kim Minjung', rating: 4.95, avatar: avatarUrl('Kim Minjung') },
    childrenIds: ['1'],
    status: 'confirmed',
};

// ----------------------------------------
// Parent History (used by Parent History)
// ----------------------------------------
export interface DemoHistoryItem {
    id: string;
    date: string;
    time: string;
    hotel: string;
    sitter: string;
    sitterAvatar?: string;
    duration: string;
    amount: number;
    rating: number;
    status: 'completed' | 'cancelled';
}

export const DEMO_HISTORY: DemoHistoryItem[] = [
    // Recent: yesterday — Gold sitter, late evening, full 4h
    { id: '1', date: formatDateLabel(-1), time: '18:00-22:00', hotel: 'Grand Hyatt Seoul', sitter: 'Kim Minjung', sitterAvatar: avatarUrl('Kim Minjung'), duration: '4h', amount: 360000, rating: 5, status: 'completed' },
    // 4 days ago — The Shilla, different sitter, also rated 5
    { id: '2', date: formatDateLabel(-4), time: '19:00-23:00', hotel: 'The Shilla Seoul', sitter: 'Park Sooyeon', sitterAvatar: avatarUrl('Park Sooyeon'), duration: '4h', amount: 300000, rating: 5, status: 'completed' },
    // 1 week ago — Unreviewed session, awaiting feedback
    { id: '3', date: formatDateLabel(-7), time: '17:00-21:00', hotel: 'Grand Hyatt Seoul', sitter: 'Sato Haruka', sitterAvatar: avatarUrl('Sato Haruka'), duration: '4h', amount: 360000, rating: 0, status: 'completed' },
    // 10 days ago — Short 3h evening session at Signiel
    { id: '4', date: formatDateLabel(-10), time: '20:00-23:00', hotel: 'Signiel Seoul', sitter: 'Chen Wei', sitterAvatar: avatarUrl('Chen Wei'), duration: '3h', amount: 270000, rating: 4, status: 'completed' },
    // 2 weeks ago — Four Seasons, unreviewed
    { id: '5', date: formatDateLabel(-14), time: '18:00-22:00', hotel: 'Four Seasons Seoul', sitter: 'Lee Jihye', sitterAvatar: avatarUrl('Lee Jihye'), duration: '4h', amount: 240000, rating: 0, status: 'completed' },
    // 3 weeks ago — Cancelled booking
    { id: '6', date: formatDateLabel(-21), time: '19:00-22:00', hotel: 'Grand Hyatt Seoul', sitter: 'Kim Minjung', sitterAvatar: avatarUrl('Kim Minjung'), duration: '3h', amount: 270000, rating: 0, status: 'cancelled' },
    // 1 month ago — Long 5h session, Gold sitter, high rating
    { id: '7', date: formatDateLabel(-30), time: '17:00-22:00', hotel: 'Park Hyatt Busan', sitter: 'Tanaka Yuki', sitterAvatar: avatarUrl('Tanaka Yuki'), duration: '5h', amount: 450000, rating: 5, status: 'completed' },
    // 5 weeks ago — 2h afternoon session
    { id: '8', date: formatDateLabel(-35), time: '14:00-16:00', hotel: 'The Shilla Seoul', sitter: 'Park Sooyeon', sitterAvatar: avatarUrl('Park Sooyeon'), duration: '2h', amount: 120000, rating: 4, status: 'completed' },
    // 6 weeks ago — 6h marathon session, two kids
    { id: '9', date: formatDateLabel(-42), time: '16:00-22:00', hotel: 'Grand Hyatt Seoul', sitter: 'Kim Minjung', sitterAvatar: avatarUrl('Kim Minjung'), duration: '6h', amount: 540000, rating: 5, status: 'completed' },
    // 2 months ago — First-ever booking
    { id: '10', date: formatDateLabel(-60), time: '18:00-21:00', hotel: 'Signiel Seoul', sitter: 'Lee Jihye', sitterAvatar: avatarUrl('Lee Jihye'), duration: '3h', amount: 180000, rating: 5, status: 'completed' },
    // Another cancelled
    { id: '11', date: formatDateLabel(-50), time: '20:00-24:00', hotel: 'Four Seasons Seoul', sitter: 'Sato Haruka', sitterAvatar: avatarUrl('Sato Haruka'), duration: '4h', amount: 360000, rating: 0, status: 'cancelled' },
    // 10 weeks ago — Standard 4h evening
    { id: '12', date: formatDateLabel(-70), time: '19:00-23:00', hotel: 'The Shilla Seoul', sitter: 'Chen Wei', sitterAvatar: avatarUrl('Chen Wei'), duration: '4h', amount: 300000, rating: 3, status: 'completed' },
];

// ----------------------------------------
// Parent Recent Sessions (used by Parent Home)
// ----------------------------------------
export interface DemoRecentSession {
    id: string;
    date: Date;
    hotel: string;
    durationHours: number;
    rating: number;
}

export const DEMO_RECENT_SESSIONS: DemoRecentSession[] = [
    { id: '1', date: daysAgo(1), hotel: 'Grand Hyatt Seoul', durationHours: 4, rating: 5 },
    { id: '2', date: daysAgo(4), hotel: 'The Shilla Seoul', durationHours: 4, rating: 5 },
    { id: '3', date: daysAgo(7), hotel: 'Grand Hyatt Seoul', durationHours: 4, rating: 5 },
];

// ----------------------------------------
// LiveStatus Activity Logs (used by Parent LiveStatus)
// ----------------------------------------
export interface DemoActivityLog {
    id: string;
    timestamp: Date;
    type: 'photo' | 'meal' | 'status' | 'checkin' | 'note';
    content: string;
    metadata: { photoUrl?: string; subtext?: string; mood?: string };
}

export const DEMO_LIVE_STATUS_LOGS: DemoActivityLog[] = [
    {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'status',
        content: 'Quiet time — reading picture books together',
        metadata: { mood: '📚' },
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        type: 'photo',
        content: 'Emma drew a beautiful rainbow painting!',
        metadata: { photoUrl: 'https://images.unsplash.com/photo-1596464716127-f9a87ae63648?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        type: 'status',
        content: 'Art time — watercolor painting session',
        metadata: { mood: '🎨' },
    },
    {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
        type: 'meal',
        content: 'Snack Time',
        metadata: { subtext: 'Sliced apples, rice crackers, and apple juice (confirmed peanut-free)' },
    },
    {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 70),
        type: 'status',
        content: 'Free play — building a block castle and playing pretend',
        metadata: { mood: '🏰' },
    },
    {
        id: '6',
        timestamp: new Date(Date.now() - 1000 * 60 * 85),
        type: 'note',
        content: 'Room safety check completed: all windows locked, balcony secured, minibar locked',
        metadata: { subtext: 'Safety protocol verified' },
    },
    {
        id: '7',
        timestamp: new Date(Date.now() - 1000 * 60 * 95),
        type: 'status',
        content: 'Getting settled — unpacking activity bag and meeting Emma',
        metadata: { mood: '👋' },
    },
    {
        id: '8',
        timestamp: new Date(Date.now() - 1000 * 60 * 100),
        type: 'checkin',
        content: 'Trust Check-in Verified',
        metadata: { subtext: 'Identity confirmed, safe word exchanged, care handover complete' },
    },
];

// ----------------------------------------
// LiveStatus Session Info
// ----------------------------------------
export interface DemoLiveSession {
    sitterId: string;
    sitterName: string;
    sitterTier: 'gold' | 'silver';
    sitterLanguages: string;
    sitterAvatar?: string;
    elapsedTime: string;
}

export const DEMO_LIVE_SESSION: DemoLiveSession = {
    sitterId: 'demo-sitter-1',
    sitterName: 'Kim Minjung',
    sitterTier: 'gold',
    sitterLanguages: 'English/Korean/Japanese',
    sitterAvatar: avatarUrl('Kim Minjung'),
    elapsedTime: '2h 15m',
};

// ----------------------------------------
// Sitter Schedule (used by Sitter Schedule)
// ----------------------------------------
export interface DemoSitterChild {
    name: string;
    age: number;
    allergies?: string[];
}

export interface DemoSitterSession {
    id: string;
    time: string;
    room: string;
    hotel: string;
    children: DemoSitterChild[];
    status: 'confirmed' | 'pending' | 'in_progress' | 'sitter_assigned';
    amount?: string;
}

export const DEMO_TODAY_SESSIONS: DemoSitterSession[] = [
    { id: '1', time: '19:00 - 23:00', room: '1102', hotel: 'Grand Hyatt Seoul', children: [{ name: 'Yui', age: 4 }, { name: 'Haeun', age: 6, allergies: ['dairy'] }], status: 'confirmed', amount: '\u20A975,000/hr' },
    { id: '2', time: '20:00 - 24:00', room: '3501', hotel: 'The Shilla Seoul', children: [{ name: 'Xiaoming', age: 3, allergies: ['peanuts'] }], status: 'pending', amount: '\u20A960,000/hr' },
    { id: '3', time: '21:00 - 01:00', room: '2205', hotel: 'Signiel Seoul', children: [{ name: 'Emma', age: 5 }], status: 'sitter_assigned', amount: '\u20A990,000/hr' },
];

export interface DemoWeekDay {
    date: string;
    sessions: number;
}

export const DEMO_WEEK_SCHEDULE: DemoWeekDay[] = [
    { date: dynamicWeekday(0), sessions: 2 },
    { date: dynamicWeekday(1), sessions: 1 },
    { date: dynamicWeekday(2), sessions: 0 },
    { date: dynamicWeekday(3), sessions: 2 },
    { date: dynamicWeekday(4), sessions: 3 },
    { date: dynamicWeekday(5), sessions: 4 },
    { date: dynamicWeekday(6), sessions: 2 },
];

// ----------------------------------------
// Sitter Stats (used by Sitter Schedule + Profile)
// ----------------------------------------
export interface DemoSitterStats {
    totalSessions: number;
    avgRating: number;
    safetyDays: number;
    onTimeRate: string;
    tier: 'gold' | 'silver';
}

export const DEMO_SITTER_STATS: DemoSitterStats = {
    totalSessions: 247,
    avgRating: 4.87,
    safetyDays: 365,
    onTimeRate: '98%',
    tier: 'gold',
};

// ----------------------------------------
// Sitter Active Session (used by Sitter ActiveSession)
// ----------------------------------------
export interface DemoChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

export const DEMO_CHECKLIST_ITEMS: DemoChecklistItem[] = [
    { id: '1', label: 'Pre-session: Wash hands', completed: true },
    { id: '2', label: 'Verify child identity with photo', completed: true },
    { id: '3', label: 'Review allergies & medical info', completed: true },
    { id: '4', label: 'Check emergency contact info', completed: true },
    { id: '5', label: 'Check window locks and balcony doors', completed: true },
    { id: '6', label: 'Remove small objects from child reach', completed: false },
    { id: '7', label: 'Verify emergency exit route', completed: false },
    { id: '8', label: 'First activity started', completed: false },
    { id: '9', label: 'Snack served (if applicable)', completed: false },
    { id: '10', label: 'Document any incidents before session end', completed: false },
];

export interface DemoActiveSessionInfo {
    room: string;
    children: string;
    parent: string;
    endTime: string;
    elapsedTime: string;
}

export const DEMO_ACTIVE_SESSION_INFO: DemoActiveSessionInfo = {
    room: '1102',
    children: 'Yui (4), Haeun (6)',
    parent: 'Tanaka Yuki',
    endTime: '23:00',
    elapsedTime: '2h 15m',
};

// ----------------------------------------
// Sitter Profile (used by Sitter Profile)
// ----------------------------------------
export interface DemoSitterProfile {
    name: string;
    tier: 'gold' | 'silver';
    rating: number;
    reviewCount: number;
    totalSessions: number;
    safetyDays: number;
    onTimeRate: string;
    certifications: string[];
    languages: { flag: string; name: string; level: string }[];
    avatar?: string;
    hotelVerified?: boolean;
}

export const DEMO_SITTER_PROFILE: DemoSitterProfile = {
    name: 'Kim Minjung',
    tier: 'gold',
    rating: 4.95,
    reviewCount: 247,
    totalSessions: 247,
    safetyDays: 365,
    onTimeRate: '98%',
    certifications: ['CPR Certified', 'First Aid', 'Child Psychology', 'Background Checked'],
    languages: [
        { flag: '🇰🇷', name: 'Korean', level: 'Native' },
        { flag: '🇺🇸', name: 'English', level: 'Fluent' },
        { flag: '🇯🇵', name: 'Japanese', level: 'Basic' },
    ],
    avatar: avatarUrl('Kim Minjung'),
    hotelVerified: true,
};

// ----------------------------------------
// Notifications (demo)
// ----------------------------------------
export interface DemoNotification {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: Date;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
    { id: '1', type: 'booking_confirmed', title: 'Booking Confirmed', body: 'Your booking KCP-2026-0042 has been confirmed.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '2', type: 'sitter_assigned', title: 'Sitter Assigned', body: 'Kim Minjung has been assigned to your booking.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '3', type: 'care_completed', title: 'Session Complete', body: 'The care session has been completed. Please leave a review.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

// ----------------------------------------
// Reviews (demo)
// ----------------------------------------
export interface DemoReview {
    id: string;
    bookingId: string;
    sitterId: string;
    sitterName: string;
    parentId: string;
    parentName: string;
    rating: number;
    comment: string;
    tags: string[];
    createdAt: Date;
    response?: { message: string; createdAt: Date };
}

export const DEMO_REVIEWS: DemoReview[] = [
    {
        id: 'r1',
        bookingId: '1',
        sitterId: 'demo-sitter-1',
        sitterName: 'Kim Minjung',
        parentId: 'demo-parent-1',
        parentName: 'Sarah Johnson',
        rating: 5,
        comment: 'Wonderful experience! Emma had so much fun with arts and crafts. Minjung was incredibly attentive and professional.',
        tags: ['professional', 'creative', 'attentive'],
        createdAt: daysAgo(5),
    },
    {
        id: 'r2',
        bookingId: '2',
        sitterId: 'demo-sitter-1',
        sitterName: 'Kim Minjung',
        parentId: 'demo-parent-2',
        parentName: 'Tanaka Yuki',
        rating: 5,
        comment: 'Both kids loved their time. Great communication throughout with photos and updates.',
        tags: ['communicative', 'fun', 'safe'],
        createdAt: daysAgo(12),
        response: {
            message: 'Thank you so much! Yui and Haeun are wonderful children. I enjoyed our time together!',
            createdAt: daysAgo(11),
        },
    },
    {
        id: 'r3',
        bookingId: '4',
        sitterId: 'demo-sitter-5',
        sitterName: 'Lee Jihye',
        parentId: 'demo-parent-5',
        parentName: 'Maria Garcia',
        rating: 4,
        comment: 'Good session overall. Lucas had a nice time. Would book again.',
        tags: ['professional', 'punctual'],
        createdAt: daysAgo(14),
    },
    {
        id: 'r4',
        bookingId: '5',
        sitterId: 'demo-sitter-4',
        sitterName: 'Chen Wei',
        parentId: 'demo-parent-4',
        parentName: 'Zhang Meihua',
        rating: 5,
        comment: 'Xiaoming really enjoyed the Mandarin storytime. Chen Wei is so patient and warm.',
        tags: ['attentive', 'communicative', 'safe'],
        createdAt: daysAgo(10),
    },
];

// ----------------------------------------
// Payment Methods (demo)
// ----------------------------------------
export interface DemoPaymentMethod {
    id: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'other';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    isDefault: boolean;
}

export const DEMO_PAYMENT_METHODS: DemoPaymentMethod[] = [
    { id: 'pm1', brand: 'visa', last4: '4242', expiryMonth: 12, expiryYear: 2027, holderName: 'Sarah Johnson', isDefault: true },
    { id: 'pm2', brand: 'mastercard', last4: '8888', expiryMonth: 6, expiryYear: 2026, holderName: 'Sarah Johnson', isDefault: false },
];

// ----------------------------------------
// Sitter Availability (demo)
// ----------------------------------------
export const DEMO_SITTER_AVAILABILITY = {
    monday: [{ start: '09:00', end: '18:00' }],
    tuesday: [{ start: '09:00', end: '18:00' }],
    wednesday: [{ start: '09:00', end: '18:00' }],
    thursday: [{ start: '09:00', end: '18:00' }],
    friday: [{ start: '09:00', end: '22:00' }],
    saturday: [{ start: '10:00', end: '22:00' }],
    sunday: [{ start: '10:00', end: '18:00' }],
    nightShift: true,
    holidayAvailable: true,
};

// ----------------------------------------
// Sitter Documents (demo) — dynamic dates
// ----------------------------------------
export interface DemoDocument {
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
    size: number;
}

export const DEMO_SITTER_DOCUMENTS: DemoDocument[] = [
    { id: 'doc1', name: 'CPR_Certification_2025.pdf', url: 'https://demo.petitstay.com/docs/cpr.pdf', uploadedAt: monthsAgo(6), size: 245760 },
    { id: 'doc2', name: 'First_Aid_Certificate.pdf', url: 'https://demo.petitstay.com/docs/firstaid.pdf', uploadedAt: monthsAgo(3), size: 189440 },
];

// ----------------------------------------
// Incidents (demo)
// ----------------------------------------
export interface DemoIncident {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    summary: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    reportedAt: Date;
    sitterName: string;
    childName: string;
}

export const DEMO_INCIDENTS: DemoIncident[] = [
    {
        id: '1',
        severity: 'medium',
        category: 'injury',
        summary: 'Minor bruise on knee from tripping during play.',
        status: 'resolved',
        reportedAt: daysAgo(1),
        sitterName: 'Lee Jihye',
        childName: 'Lucas',
    },
    {
        id: '2',
        severity: 'high',
        category: 'allergy',
        summary: 'Allergic reaction to dairy snack served by room service. Antihistamine administered per parent instructions.',
        status: 'investigating',
        reportedAt: daysAgo(0),
        sitterName: 'Park Sooyeon',
        childName: 'Haeun',
    },
    {
        id: '3',
        severity: 'low',
        category: 'complaint',
        summary: 'Guest complaint about sitter arriving 5 minutes late to room.',
        status: 'open',
        reportedAt: daysAgo(2),
        sitterName: 'Kim Minjung',
        childName: 'Emma',
    },
    {
        id: '4',
        severity: 'medium',
        category: 'property',
        summary: 'Accidental spill on hotel carpet during art activity. Hotel housekeeping notified.',
        status: 'resolved',
        reportedAt: daysAgo(5),
        sitterName: 'Choi Yerim',
        childName: 'Xiaoming',
    },
    {
        id: '5',
        severity: 'critical',
        category: 'safety',
        summary: 'Child found near open balcony door. Door was secured immediately. Room safety re-checked.',
        status: 'investigating',
        reportedAt: daysAgo(0),
        sitterName: 'Lee Jihye',
        childName: 'Yui',
    },
];

// ----------------------------------------
// Guest Tokens (demo)
// ----------------------------------------
export interface DemoGuestToken {
    id: string;
    bookingId: string;
    token: string;
    guestName: string;
    room: string;
    expiresAt: Date;
    used: boolean;
}

export const DEMO_GUEST_TOKENS: DemoGuestToken[] = [
    {
        id: 'gt-1',
        bookingId: 'demo-booking-1',
        token: 'demo-token',
        guestName: 'Sarah Johnson',
        room: '2305',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        used: false,
    },
    {
        id: 'gt-2',
        bookingId: 'demo-booking-2',
        token: 'demo-token-2',
        guestName: 'Tanaka Yuki',
        room: '1102',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        used: true,
    },
];

// ----------------------------------------
// Settlements (demo) — dynamic months
// ----------------------------------------
export interface DemoSettlement {
    id: string;
    hotelId: string;
    hotelName: string;
    period: string;
    totalBookings: number;
    totalRevenue: number;
    commission: number;
    commissionRate: number;
    netPayout: number;
    status: 'draft' | 'pending_approval' | 'approved' | 'paid';
    createdAt: Date;
}

function monthLabel(monthsBack: number): string {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsBack);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export const DEMO_SETTLEMENTS: DemoSettlement[] = [
    {
        id: 'stl-1',
        hotelId: 'hotel-grand-hyatt',
        hotelName: 'Grand Hyatt Seoul',
        period: monthLabel(2),
        totalBookings: 62,
        totalRevenue: 18600000,
        commission: 2790000,
        commissionRate: 15,
        netPayout: 15810000,
        status: 'paid',
        createdAt: monthsAgo(1),
    },
    {
        id: 'stl-2',
        hotelId: 'hotel-grand-hyatt',
        hotelName: 'Grand Hyatt Seoul',
        period: monthLabel(1),
        totalBookings: 58,
        totalRevenue: 17400000,
        commission: 2610000,
        commissionRate: 15,
        netPayout: 14790000,
        status: 'approved',
        createdAt: monthsAgo(0),
    },
    {
        id: 'stl-3',
        hotelId: 'hotel-the-shilla',
        hotelName: 'The Shilla Seoul',
        period: monthLabel(1),
        totalBookings: 34,
        totalRevenue: 10200000,
        commission: 1530000,
        commissionRate: 15,
        netPayout: 8670000,
        status: 'pending_approval',
        createdAt: monthsAgo(0),
    },
];

// ----------------------------------------
// Ops Dashboard Stats (demo) — realistic
// ----------------------------------------
export interface DemoOpsStats {
    totalHotels: number;
    totalActiveSitters: number;
    totalBookingsThisMonth: number;
    totalRevenueThisMonth: number;
    avgSatisfaction: number;
    openIssues: number;
    pendingSettlements: number;
    slaCompliance: number;
}

export const DEMO_OPS_STATS: DemoOpsStats = {
    totalHotels: 5,
    totalActiveSitters: 12,
    totalBookingsThisMonth: 47,
    totalRevenueThisMonth: 8460000,
    avgSatisfaction: 4.87,
    openIssues: 3,
    pendingSettlements: 2,
    slaCompliance: 97.5,
};

// ----------------------------------------
// Ops Hotels (used by Ops Dashboard)
// ----------------------------------------
export interface DemoOpsHotel {
    id: string;
    name: string;
    tier: string;
    bookingsThisMonth: number;
    revenue: number;
    commission: number;
}

export const DEMO_OPS_HOTELS: DemoOpsHotel[] = [
    { id: 'hotel-grand-hyatt', name: 'Grand Hyatt Seoul', tier: 'luxury', bookingsThisMonth: 16, revenue: 2961000, commission: 444150 },
    { id: 'hotel-the-shilla', name: 'The Shilla Seoul', tier: 'luxury', bookingsThisMonth: 12, revenue: 2115000, commission: 317250 },
    { id: 'hotel-signiel', name: 'Signiel Seoul', tier: 'luxury', bookingsThisMonth: 9, revenue: 1692000, commission: 253800 },
    { id: 'hotel-four-seasons', name: 'Four Seasons Seoul', tier: 'premium', bookingsThisMonth: 7, revenue: 1269000, commission: 190350 },
    { id: 'hotel-park-hyatt', name: 'Park Hyatt Busan', tier: 'premium', bookingsThisMonth: 3, revenue: 423000, commission: 63450 },
];

// ----------------------------------------
// Sitter Earnings (used by Sitter Earnings)
// ----------------------------------------
export interface DemoEarnings {
    thisMonth: number;
    lastMonth: number;
    pending: number;
    totalSessions: number;
}

export const DEMO_EARNINGS: DemoEarnings = {
    thisMonth: 2725000,
    lastMonth: 2400000,
    pending: 375000,
    totalSessions: 14,
};

export interface DemoMonthlyChart {
    month: string;
    amount: number;
}

/** Monthly revenue chart — growth trend */
function recentMonthLabel(monthsBack: number): string {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsBack);
    return d.toLocaleDateString('en-US', { month: 'short' });
}

export const DEMO_MONTHLY_CHART: DemoMonthlyChart[] = [
    { month: recentMonthLabel(5), amount: 3200000 },
    { month: recentMonthLabel(4), amount: 4800000 },
    { month: recentMonthLabel(3), amount: 6200000 },
    { month: recentMonthLabel(2), amount: 7500000 },
    { month: recentMonthLabel(1), amount: 8400000 },
    { month: recentMonthLabel(0), amount: 9000000 },
];

export interface DemoRecentPayment {
    id: string;
    date: string;
    hotel: string;
    hours: number;
    amount: number;
    status: 'paid' | 'pending';
}

export const DEMO_RECENT_PAYMENTS: DemoRecentPayment[] = [
    { id: '1', date: formatShortDate(-1), hotel: 'Grand Hyatt Seoul', hours: 4, amount: 360000, status: 'paid' },
    { id: '2', date: formatShortDate(-4), hotel: 'The Shilla Seoul', hours: 4, amount: 300000, status: 'paid' },
    { id: '3', date: formatShortDate(-7), hotel: 'Grand Hyatt Seoul', hours: 4, amount: 360000, status: 'paid' },
    { id: '4', date: formatShortDate(-9), hotel: 'Signiel Seoul', hours: 3, amount: 270000, status: 'paid' },
    { id: '5', date: formatShortDate(-11), hotel: 'Four Seasons Seoul', hours: 3, amount: 225000, status: 'pending' },
];

export interface DemoHotelBreakdown {
    hotel: string;
    sessions: number;
    amount: number;
    percentage: number;
}

export const DEMO_HOTEL_BREAKDOWN: DemoHotelBreakdown[] = [
    { hotel: 'Grand Hyatt Seoul', sessions: 9, amount: 2700000, percentage: 35 },
    { hotel: 'The Shilla Seoul', sessions: 6, amount: 1800000, percentage: 25 },
    { hotel: 'Signiel Seoul', sessions: 5, amount: 1350000, percentage: 20 },
    { hotel: 'Four Seasons Seoul', sessions: 4, amount: 1125000, percentage: 15 },
    { hotel: 'Park Hyatt Busan', sessions: 1, amount: 375000, percentage: 5 },
];
