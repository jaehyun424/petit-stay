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

function avatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C5A059&color=fff&size=80`;
}

// ----------------------------------------
// Hotel Dashboard Stats
// ----------------------------------------
export const DEMO_DASHBOARD_STATS: DashboardStats = {
    todayBookings: 8,
    activeNow: 3,
    completedToday: 4,
    todayRevenue: 1680000,
    safetyDays: 127,
    pendingBookings: 2,
};

// ----------------------------------------
// Hotel Bookings -- 16 entries, diverse statuses/hotels/guests
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
        id: '1', confirmationCode: 'KCP-2026-0042', date: daysFromNow(0), time: '18:00 - 22:00', room: '2305',
        parent: { name: 'Sarah Johnson', phone: '+1 415-555-0173' },
        children: [{ name: 'Emma', age: 5, allergies: ['peanuts'] }],
        sitter: { name: 'Kim Minjung', tier: 'gold', avatar: avatarUrl('Kim Minjung'), hotelVerified: true },
        status: 'in_progress', totalAmount: 360000,
    },
    {
        id: '2', confirmationCode: 'KCP-2026-0043', date: daysFromNow(0), time: '19:00 - 23:00', room: '1102',
        parent: { name: 'Tanaka Yuki', phone: '+81 90-1234-5678' },
        children: [{ name: 'Yui', age: 4 }, { name: 'Haeun', age: 6 }],
        sitter: { name: 'Park Sooyeon', tier: 'gold', avatar: avatarUrl('Park Sooyeon'), hotelVerified: true },
        status: 'in_progress', totalAmount: 540000,
    },
    {
        id: '3', confirmationCode: 'KCP-2026-0044', date: daysFromNow(0), time: '20:00 - 24:00', room: '3501',
        parent: { name: 'Zhang Wei', phone: '+86 138-2188-6600' },
        children: [{ name: 'Xiaoming', age: 3, allergies: ['shellfish'] }],
        sitter: { name: 'Chen Yuxi', tier: 'silver', avatar: avatarUrl('Chen Yuxi'), hotelVerified: true },
        status: 'confirmed', totalAmount: 240000,
    },
    {
        id: '4', confirmationCode: 'KCP-2026-0045', date: daysFromNow(0), time: '21:00 - 01:00', room: '4201',
        parent: { name: 'Pierre Dubois', phone: '+33 6-12-34-56-78' },
        children: [{ name: 'Camille', age: 7 }, { name: 'Louis', age: 4 }],
        sitter: null, status: 'pending', totalAmount: 480000,
    },
    {
        id: '5', confirmationCode: 'KCP-2026-0038', date: daysFromNow(-1), time: '17:00 - 21:00', room: '2108',
        parent: { name: 'Maria Garcia', phone: '+34 612-345-678' },
        children: [{ name: 'Lucas', age: 7 }],
        sitter: { name: 'Lee Jihye', tier: 'silver', avatar: avatarUrl('Lee Jihye'), hotelVerified: true },
        status: 'completed', totalAmount: 240000,
    },
    {
        id: '6', confirmationCode: 'KCP-2026-0039', date: daysFromNow(-1), time: '18:00 - 22:00', room: '1507',
        parent: { name: 'Choi Eunsoo', phone: '+82 10-5678-1234' },
        children: [{ name: 'Minjae', age: 8 }, { name: 'Soyeon', age: 5 }],
        sitter: { name: 'Sato Haruka', tier: 'gold', avatar: avatarUrl('Sato Haruka'), hotelVerified: true },
        status: 'completed', totalAmount: 360000,
    },
    {
        id: '7', confirmationCode: 'KCP-2026-0035', date: daysFromNow(-2), time: '14:00 - 18:00', room: '2601',
        parent: { name: 'James Mitchell', phone: '+1 212-555-0198' },
        children: [{ name: 'Oliver', age: 2 }],
        sitter: { name: 'Kim Minjung', tier: 'gold', avatar: avatarUrl('Kim Minjung'), hotelVerified: true },
        status: 'completed', totalAmount: 360000,
    },
    {
        id: '8', confirmationCode: 'KCP-2026-0036', date: daysFromNow(-2), time: '19:00 - 23:00', room: '3102',
        parent: { name: 'Nakamura Kenji', phone: '+81 80-9876-5432' },
        children: [{ name: 'Aoi', age: 6, allergies: ['dairy'] }],
        sitter: { name: 'Yamamoto Rina', tier: 'silver', avatar: avatarUrl('Yamamoto Rina'), hotelVerified: true },
        status: 'completed', totalAmount: 240000,
    },
    {
        id: '9', confirmationCode: 'KCP-2026-0037', date: daysFromNow(-2), time: '20:00 - 24:00', room: '1903',
        parent: { name: 'Anna Kowalski', phone: '+49 170-123-4567' },
        children: [{ name: 'Lena', age: 9 }],
        sitter: { name: 'Park Sooyeon', tier: 'gold', avatar: avatarUrl('Park Sooyeon'), hotelVerified: true },
        status: 'cancelled', totalAmount: 300000,
    },
    {
        id: '10', confirmationCode: 'KCP-2026-0046', date: daysFromNow(1), time: '18:00 - 22:00', room: '1801',
        parent: { name: 'Lee Sujin', phone: '+82 10-9876-5432' },
        children: [{ name: 'Jihoon', age: 5 }],
        sitter: { name: 'Sato Haruka', tier: 'gold', avatar: avatarUrl('Sato Haruka'), hotelVerified: true },
        status: 'confirmed', totalAmount: 360000,
    },
    {
        id: '11', confirmationCode: 'KCP-2026-0047', date: daysFromNow(1), time: '10:00 - 14:00', room: '2203',
        parent: { name: 'Robert Chen', phone: '+1 650-555-0147' },
        children: [{ name: 'Lily', age: 3 }, { name: 'Ethan', age: 6 }],
        sitter: { name: 'Kim Minjung', tier: 'gold', avatar: avatarUrl('Kim Minjung'), hotelVerified: true },
        status: 'sitter_confirmed', totalAmount: 540000,
    },
    {
        id: '12', confirmationCode: 'KCP-2026-0048', date: daysFromNow(2), time: '19:00 - 23:00', room: '3301',
        parent: { name: 'Suzuki Akiko', phone: '+81 90-5555-1234' },
        children: [{ name: 'Ren', age: 8 }],
        sitter: null, status: 'pending_assignment', totalAmount: 240000,
    },
    {
        id: '13', confirmationCode: 'KCP-2026-0049', date: daysFromNow(2), time: '09:00 - 13:00', room: '1205',
        parent: { name: 'Sophie Laurent', phone: '+33 7-65-43-21-09' },
        children: [{ name: 'Chloe', age: 1 }],
        sitter: { name: 'Park Sooyeon', tier: 'gold', avatar: avatarUrl('Park Sooyeon'), hotelVerified: true },
        status: 'sitter_assigned', totalAmount: 360000,
    },
    {
        id: '14', confirmationCode: 'KCP-2026-0050', date: daysFromNow(3), time: '15:00 - 19:00', room: '2507',
        parent: { name: 'Park Dongwoo', phone: '+82 10-3344-5566' },
        children: [{ name: 'Yejin', age: 10 }, { name: 'Seojun', age: 7 }],
        sitter: null, status: 'pending_guest_consent', totalAmount: 480000,
    },
    {
        id: '15', confirmationCode: 'KCP-2026-0030', date: daysFromNow(-5), time: '10:00 - 14:00', room: '1601',
        parent: { name: 'Michael Brown', phone: '+1 310-555-0234' },
        children: [{ name: 'Ava', age: 4 }, { name: 'Noah', age: 2 }],
        sitter: { name: 'Jeong Nayoung', tier: 'silver', avatar: avatarUrl('Jeong Nayoung'), hotelVerified: true },
        status: 'completed', totalAmount: 480000,
    },
    {
        id: '16', confirmationCode: 'KCP-2026-0025', date: daysFromNow(-7), time: '18:00 - 22:00', room: '2801',
        parent: { name: 'Tanaka Yuki', phone: '+81 90-1234-5678' },
        children: [{ name: 'Yui', age: 4 }],
        sitter: { name: 'Kim Minjung', tier: 'gold', avatar: avatarUrl('Kim Minjung'), hotelVerified: true },
        status: 'completed', totalAmount: 360000,
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
    elapsed: string;
    lastUpdate: string;
    lastActivity: string;
    activities: { time: string; activity: string; type: string }[];
    vitals: { mood: string; energy: string };
    endTime?: string;
    status: 'active';
}

export const DEMO_ACTIVE_SESSIONS: DemoActiveSession[] = [
    {
        id: '1',
        sitter: { name: 'Kim Minjung', avatar: avatarUrl('Kim Minjung'), tier: 'gold' },
        room: '2305', children: [{ name: 'Emma', age: 5 }], childrenText: 'Emma (5)',
        startTime: '18:00', elapsed: '2h 45m', lastUpdate: '1 min ago', lastActivity: 'Drawing and coloring',
        activities: [
            { time: '20:40', activity: 'Drawing and coloring', type: 'play' },
            { time: '20:00', activity: 'Snack time - Fruit plate & juice', type: 'food' },
            { time: '19:15', activity: 'Read "Goodnight Moon" together', type: 'reading' },
            { time: '18:30', activity: 'Trust check-in completed', type: 'checkin' },
            { time: '18:00', activity: 'Session started', type: 'start' },
        ],
        vitals: { mood: 'happy', energy: 'medium' }, status: 'active',
    },
    {
        id: '2',
        sitter: { name: 'Park Sooyeon', avatar: avatarUrl('Park Sooyeon'), tier: 'gold' },
        room: '1102', children: [{ name: 'Yui', age: 4 }, { name: 'Haeun', age: 6 }], childrenText: 'Yui (4), Haeun (6)',
        startTime: '19:00', elapsed: '1h 45m', lastUpdate: '3 min ago', lastActivity: 'Building a block tower',
        activities: [
            { time: '20:40', activity: 'Building a block tower', type: 'play' },
            { time: '20:10', activity: 'Snack time - Apple slices & crackers', type: 'food' },
            { time: '19:30', activity: 'Trust check-in completed', type: 'checkin' },
            { time: '19:00', activity: 'Session started', type: 'start' },
        ],
        vitals: { mood: 'happy', energy: 'high' }, status: 'active',
    },
    {
        id: '3',
        sitter: { name: 'Chen Yuxi', avatar: avatarUrl('Chen Yuxi'), tier: 'silver' },
        room: '3501', children: [{ name: 'Xiaoming', age: 3 }], childrenText: 'Xiaoming (3)',
        startTime: '20:00', elapsed: '0h 45m', lastUpdate: '2 min ago', lastActivity: 'Watching cartoon (settling in)',
        activities: [
            { time: '20:40', activity: 'Watching cartoon (settling in)', type: 'play' },
            { time: '20:15', activity: 'Trust check-in completed', type: 'checkin' },
            { time: '20:00', activity: 'Session started', type: 'start' },
        ],
        vitals: { mood: 'calm', energy: 'low' }, status: 'active',
    },
];

// ----------------------------------------
// Sitters -- 8 sitters: 3 Gold, 5 Silver
// ----------------------------------------
export interface DemoSitter {
    id: string; name: string; tier: 'gold' | 'silver'; rating: number; sessionsCompleted: number;
    languages: string[]; certifications: string[]; availability: string; hourlyRate: number;
    safetyDays: number; avatar?: string; hotelVerified?: boolean; bio?: string; experience?: number;
}

export const DEMO_SITTERS: DemoSitter[] = [
    { id: '1', name: 'Kim Minjung', tier: 'gold', rating: 4.95, sessionsCompleted: 312, languages: ['Korean', 'English', 'Japanese'], certifications: ['CPR', 'First Aid', 'Child Psychology', 'Luxury Service Training'], availability: 'Available', hourlyRate: 90000, safetyDays: 450, avatar: avatarUrl('Kim Minjung'), hotelVerified: true, bio: 'Certified childcare specialist with 8 years of luxury hotel experience. Specializes in infant and toddler care with multilingual communication.', experience: 8 },
    { id: '2', name: 'Park Sooyeon', tier: 'gold', rating: 4.88, sessionsCompleted: 247, languages: ['Korean', 'English', 'Chinese'], certifications: ['CPR', 'First Aid', 'Child Development', 'Montessori Level 1'], availability: 'In Session', hourlyRate: 85000, safetyDays: 380, avatar: avatarUrl('Park Sooyeon'), hotelVerified: true, bio: 'Former kindergarten teacher turned premium childcare provider. Montessori-trained with a focus on creative play and early learning.', experience: 6 },
    { id: '3', name: 'Sato Haruka', tier: 'gold', rating: 4.92, sessionsCompleted: 289, languages: ['Japanese', 'English', 'Korean'], certifications: ['CPR', 'First Aid', 'Hoikushi National License', 'Child Development'], availability: 'Available', hourlyRate: 90000, safetyDays: 520, avatar: avatarUrl('Sato Haruka'), hotelVerified: true, bio: 'Licensed Hoikushi (nursery teacher) from Tokyo with 7 years experience. Expert in bilingual childcare for Japanese-speaking families.', experience: 7 },
    { id: '4', name: 'Chen Yuxi', tier: 'silver', rating: 4.65, sessionsCompleted: 95, languages: ['Chinese', 'English', 'Korean'], certifications: ['CPR', 'First Aid'], availability: 'In Session', hourlyRate: 60000, safetyDays: 140, avatar: avatarUrl('Chen Yuxi'), hotelVerified: true, bio: 'Native Mandarin speaker with early childhood education background. Great with shy children and first-time hotel childcare families.', experience: 2 },
    { id: '5', name: 'Lee Jihye', tier: 'silver', rating: 4.72, sessionsCompleted: 156, languages: ['Korean', 'English'], certifications: ['CPR', 'First Aid', 'Child Psychology'], availability: 'Available', hourlyRate: 60000, safetyDays: 210, avatar: avatarUrl('Lee Jihye'), hotelVerified: true, bio: 'Psychology graduate specializing in child behavior. Known for calm demeanor and excellent communication with parents.', experience: 3 },
    { id: '6', name: 'Yamamoto Rina', tier: 'silver', rating: 4.45, sessionsCompleted: 78, languages: ['Japanese', 'Korean'], certifications: ['CPR', 'First Aid'], availability: 'Available', hourlyRate: 60000, safetyDays: 95, avatar: avatarUrl('Yamamoto Rina'), hotelVerified: true, bio: 'Bilingual Japanese-Korean caregiver. Passionate about arts and crafts activities with children.', experience: 1 },
    { id: '7', name: 'Jeong Nayoung', tier: 'silver', rating: 4.58, sessionsCompleted: 112, languages: ['Korean', 'English', 'French'], certifications: ['CPR', 'First Aid', 'Early Childhood Education'], availability: 'Off Duty', hourlyRate: 60000, safetyDays: 175, avatar: avatarUrl('Jeong Nayoung'), hotelVerified: true, bio: 'Early childhood education degree from Ewha Womans University. Trilingual with experience caring for European families.', experience: 4 },
    { id: '8', name: 'Bae Jisoo', tier: 'silver', rating: 4.35, sessionsCompleted: 64, languages: ['Korean', 'English'], certifications: ['CPR', 'First Aid'], availability: 'Available', hourlyRate: 60000, safetyDays: 80, avatar: avatarUrl('Bae Jisoo'), hotelVerified: true, bio: 'Energetic and creative caregiver. Former after-school program coordinator with a talent for storytelling and music activities.', experience: 2 },
];

// ----------------------------------------
// Hotels (used by Parent Booking)
// ----------------------------------------
export interface DemoHotelOption { value: string; label: string; }

export const DEMO_HOTELS: DemoHotelOption[] = [
    { value: 'four-seasons-seoul', label: 'Four Seasons Seoul' },
    { value: 'the-shilla-seoul', label: 'The Shilla Seoul' },
    { value: 'signiel-seoul', label: 'Signiel Seoul' },
    { value: 'park-hyatt-seoul', label: 'Park Hyatt Seoul' },
    { value: 'grand-hyatt-seoul', label: 'Grand Hyatt Seoul' },
    { value: 'josun-palace-seoul', label: 'Josun Palace Seoul' },
    { value: 'mandarin-oriental-tokyo', label: 'Mandarin Oriental Tokyo' },
    { value: 'aman-tokyo', label: 'Aman Tokyo' },
    { value: 'park-hyatt-tokyo', label: 'Park Hyatt Tokyo' },
];

// ----------------------------------------
// Children (used by Parent Booking + Home)
// ----------------------------------------
export interface DemoChild { id: string; name: string; age: number; allergies: string[]; gender: 'male' | 'female' | 'other'; }

export const DEMO_CHILDREN: DemoChild[] = [
    { id: '1', name: 'Emma', age: 5, allergies: ['peanuts'], gender: 'female' },
    { id: '2', name: 'Lucas', age: 7, allergies: [], gender: 'male' },
    { id: '3', name: 'Lily', age: 3, allergies: ['dairy'], gender: 'female' },
];

// ----------------------------------------
// Parent Upcoming Booking (used by Parent Home)
// ----------------------------------------
export interface DemoUpcomingBooking {
    id: string; confirmationCode: string; dateKey: string; time: string; hotel: string; room: string;
    sitter: { name: string; rating: number; avatar?: string }; childrenIds: string[]; status: 'confirmed' | 'pending';
}

export const DEMO_UPCOMING_BOOKING: DemoUpcomingBooking = {
    id: '1', confirmationCode: 'KCP-2026-0042', dateKey: 'tonight', time: '18:00 - 22:00',
    hotel: 'Four Seasons Seoul', room: '2305',
    sitter: { name: 'Kim Minjung', rating: 4.95, avatar: avatarUrl('Kim Minjung') },
    childrenIds: ['1'], status: 'confirmed',
};

// ----------------------------------------
// Parent History (used by Parent History)
// ----------------------------------------
export interface DemoHistoryItem {
    id: string; date: string; time: string; hotel: string; sitter: string; sitterAvatar?: string;
    duration: string; amount: number; rating: number; status: 'completed' | 'cancelled';
}

export const DEMO_HISTORY: DemoHistoryItem[] = [
    { id: '1', date: formatDateLabel(-1), time: '18:00-22:00', hotel: 'Four Seasons Seoul', sitter: 'Kim Minjung', sitterAvatar: avatarUrl('Kim Minjung'), duration: '4h', amount: 360000, rating: 5, status: 'completed' },
    { id: '2', date: formatDateLabel(-3), time: '19:00-23:00', hotel: 'The Shilla Seoul', sitter: 'Park Sooyeon', sitterAvatar: avatarUrl('Park Sooyeon'), duration: '4h', amount: 340000, rating: 5, status: 'completed' },
    { id: '3', date: formatDateLabel(-5), time: '10:00-14:00', hotel: 'Signiel Seoul', sitter: 'Sato Haruka', sitterAvatar: avatarUrl('Sato Haruka'), duration: '4h', amount: 360000, rating: 4, status: 'completed' },
    { id: '4', date: formatDateLabel(-8), time: '17:00-21:00', hotel: 'Four Seasons Seoul', sitter: 'Lee Jihye', sitterAvatar: avatarUrl('Lee Jihye'), duration: '4h', amount: 240000, rating: 5, status: 'completed' },
    { id: '5', date: formatDateLabel(-10), time: '20:00-23:00', hotel: 'Grand Hyatt Seoul', sitter: 'Chen Yuxi', sitterAvatar: avatarUrl('Chen Yuxi'), duration: '3h', amount: 180000, rating: 4, status: 'completed' },
    { id: '6', date: formatDateLabel(-12), time: '18:00-22:00', hotel: 'Park Hyatt Seoul', sitter: 'Kim Minjung', sitterAvatar: avatarUrl('Kim Minjung'), duration: '4h', amount: 360000, rating: 5, status: 'completed' },
    { id: '7', date: formatDateLabel(-15), time: '19:00-22:00', hotel: 'Josun Palace Seoul', sitter: 'Jeong Nayoung', sitterAvatar: avatarUrl('Jeong Nayoung'), duration: '3h', amount: 180000, rating: 0, status: 'completed' },
    { id: '8', date: formatDateLabel(-18), time: '15:00-19:00', hotel: 'The Shilla Seoul', sitter: 'Park Sooyeon', sitterAvatar: avatarUrl('Park Sooyeon'), duration: '4h', amount: 340000, rating: 4, status: 'completed' },
    { id: '9', date: formatDateLabel(-20), time: '18:00-22:00', hotel: 'Signiel Seoul', sitter: 'Sato Haruka', sitterAvatar: avatarUrl('Sato Haruka'), duration: '4h', amount: 360000, rating: 0, status: 'cancelled' },
];

// ----------------------------------------
// Parent Recent Sessions (used by Parent Home)
// ----------------------------------------
export interface DemoRecentSession { id: string; date: Date; hotel: string; durationHours: number; rating: number; }

export const DEMO_RECENT_SESSIONS: DemoRecentSession[] = [
    { id: '1', date: daysAgo(1), hotel: 'Four Seasons Seoul', durationHours: 4, rating: 5 },
    { id: '2', date: daysAgo(3), hotel: 'The Shilla Seoul', durationHours: 4, rating: 5 },
    { id: '3', date: daysAgo(5), hotel: 'Signiel Seoul', durationHours: 4, rating: 4 },
    { id: '4', date: daysAgo(8), hotel: 'Four Seasons Seoul', durationHours: 4, rating: 5 },
];

// ----------------------------------------
// LiveStatus Activity Logs (used by Parent LiveStatus)
// ----------------------------------------
export interface DemoActivityLog {
    id: string; timestamp: Date; type: 'photo' | 'meal' | 'status' | 'checkin' | 'note';
    content: string; metadata: { photoUrl?: string; subtext?: string; mood?: string };
}

export const DEMO_LIVE_STATUS_LOGS: DemoActivityLog[] = [
    { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 15), type: 'photo', content: 'Emma is having a wonderful time with watercolor painting!', metadata: { photoUrl: 'https://images.unsplash.com/photo-1596464716127-f9a87ae63648?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' } },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 45), type: 'meal', content: 'Snack Time', metadata: { subtext: 'Sliced apples, rice crackers & apple juice (nut-free confirmed)' } },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 75), type: 'status', content: 'Reading "The Very Hungry Caterpillar" together', metadata: { mood: 'calm' } },
    { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 105), type: 'note', content: 'Emma mentioned she wants to show mommy her painting later', metadata: {} },
    { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 120), type: 'status', content: 'Building a castle with wooden blocks', metadata: { mood: 'excited' } },
    { id: '6', timestamp: new Date(Date.now() - 1000 * 60 * 150), type: 'checkin', content: 'Trust Check-in Verified', metadata: { subtext: 'Safe word confirmed, handover complete. Emma in good spirits.' } },
];

// ----------------------------------------
// LiveStatus Session Info
// ----------------------------------------
export interface DemoLiveSession {
    sitterId: string; sitterName: string; sitterTier: 'gold' | 'silver';
    sitterLanguages: string; sitterAvatar?: string; elapsedTime: string;
}

export const DEMO_LIVE_SESSION: DemoLiveSession = {
    sitterId: 'demo-sitter-1', sitterName: 'Kim Minjung', sitterTier: 'gold',
    sitterLanguages: 'English / Korean / Japanese', sitterAvatar: avatarUrl('Kim Minjung'), elapsedTime: '2h 45m',
};

// ----------------------------------------
// Sitter Schedule (used by Sitter Schedule)
// ----------------------------------------
export interface DemoSitterChild { name: string; age: number; allergies?: string[]; }

export interface DemoSitterSession {
    id: string; time: string; room: string; hotel: string;
    children: DemoSitterChild[]; status: 'confirmed' | 'pending' | 'in_progress' | 'sitter_assigned'; amount?: string;
}

export const DEMO_TODAY_SESSIONS: DemoSitterSession[] = [
    { id: '1', time: '18:00 - 22:00', room: '2305', hotel: 'Four Seasons Seoul', children: [{ name: 'Emma', age: 5, allergies: ['peanuts'] }], status: 'in_progress', amount: '360,000' },
    { id: '2', time: '19:00 - 23:00', room: '1102', hotel: 'Four Seasons Seoul', children: [{ name: 'Yui', age: 4 }, { name: 'Haeun', age: 6, allergies: ['dairy'] }], status: 'confirmed', amount: '540,000' },
    { id: '3', time: '21:00 - 01:00', room: '4201', hotel: 'The Shilla Seoul', children: [{ name: 'Camille', age: 7 }, { name: 'Louis', age: 4 }], status: 'pending', amount: '480,000' },
];

export interface DemoWeekDay { date: string; sessions: number; }

export const DEMO_WEEK_SCHEDULE: DemoWeekDay[] = [
    { date: dynamicWeekday(0), sessions: 3 }, { date: dynamicWeekday(1), sessions: 2 },
    { date: dynamicWeekday(2), sessions: 1 }, { date: dynamicWeekday(3), sessions: 3 },
    { date: dynamicWeekday(4), sessions: 4 }, { date: dynamicWeekday(5), sessions: 5 },
    { date: dynamicWeekday(6), sessions: 2 },
];

// ----------------------------------------
// Sitter Stats (used by Sitter Schedule + Profile)
// ----------------------------------------
export interface DemoSitterStats { totalSessions: number; avgRating: number; safetyDays: number; onTimeRate: string; tier: 'gold' | 'silver'; }

export const DEMO_SITTER_STATS: DemoSitterStats = { totalSessions: 312, avgRating: 4.95, safetyDays: 450, onTimeRate: '99%', tier: 'gold' };

// ----------------------------------------
// Sitter Active Session (used by Sitter ActiveSession)
// ----------------------------------------
export interface DemoChecklistItem { id: string; label: string; completed: boolean; }

export const DEMO_CHECKLIST_ITEMS: DemoChecklistItem[] = [
    { id: '1', label: 'activeSession.checklistWashHands', completed: true },
    { id: '2', label: 'activeSession.checklistVerifyChild', completed: true },
    { id: '3', label: 'activeSession.checklistReviewAllergies', completed: true },
    { id: '4', label: 'activeSession.checklistEmergencyContact', completed: true },
    { id: '5', label: 'activeSession.checklistRoomSafety', completed: true },
    { id: '6', label: 'activeSession.checklistFirstActivity', completed: true },
    { id: '7', label: 'activeSession.checklistSnackServed', completed: false },
    { id: '8', label: 'activeSession.checklistPhotoUpdate', completed: false },
    { id: '9', label: 'activeSession.checklistDocumentIncidents', completed: false },
];

export interface DemoActiveSessionInfo { room: string; children: string; parent: string; endTime: string; elapsedTime: string; }

export const DEMO_ACTIVE_SESSION_INFO: DemoActiveSessionInfo = {
    room: '2305', children: 'Emma (5)', parent: 'Sarah Johnson', endTime: '22:00', elapsedTime: '2h 45m',
};

// ----------------------------------------
// Sitter Profile (used by Sitter Profile)
// ----------------------------------------
export interface DemoSitterProfile {
    name: string; tier: 'gold' | 'silver'; rating: number; reviewCount: number; totalSessions: number;
    safetyDays: number; onTimeRate: string; certifications: string[];
    languages: { flag: string; name: string; level: string }[]; avatar?: string; hotelVerified?: boolean;
}

export const DEMO_SITTER_PROFILE: DemoSitterProfile = {
    name: 'Kim Minjung', tier: 'gold', rating: 4.95, reviewCount: 287, totalSessions: 312,
    safetyDays: 450, onTimeRate: '99%',
    certifications: ['CPR Certified', 'First Aid', 'Child Psychology', 'Luxury Service Training', 'Background Checked'],
    languages: [
        { flag: '\u{1F1F0}\u{1F1F7}', name: 'Korean', level: 'Native' },
        { flag: '\u{1F1FA}\u{1F1F8}', name: 'English', level: 'Fluent' },
        { flag: '\u{1F1EF}\u{1F1F5}', name: 'Japanese', level: 'Conversational' },
    ],
    avatar: avatarUrl('Kim Minjung'), hotelVerified: true,
};

// ----------------------------------------
// Notifications (demo)
// ----------------------------------------
export interface DemoNotification { id: string; type: string; title: string; body: string; read: boolean; createdAt: Date; }

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
    { id: '1', type: 'booking_confirmed', title: 'Booking Confirmed', body: 'Your booking KCP-2026-0042 at Four Seasons Seoul has been confirmed for tonight.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '2', type: 'sitter_assigned', title: 'Sitter Assigned', body: 'Kim Minjung (Gold) has been assigned to your booking. She speaks English, Korean, and Japanese.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '3', type: 'care_started', title: 'Session Started', body: 'Kim Minjung has checked in with Emma at Room 2305. Trust protocol verified.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: '4', type: 'care_completed', title: 'Session Complete', body: 'Your session at The Shilla Seoul has been completed. Please leave a review for Park Sooyeon.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
    { id: '5', type: 'review_received', title: 'Review Response', body: 'Kim Minjung responded to your review: "Thank you! Emma is wonderful to care for."', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
    { id: '6', type: 'payment_received', title: 'Payment Processed', body: 'Payment of 360,000 KRW for booking KCP-2026-0038 has been processed.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
];

// ----------------------------------------
// Reviews -- 10 reviews: 4x5-star, 4x4-star, 2x3-star
// ----------------------------------------
export interface DemoReview {
    id: string; bookingId: string; sitterId: string; sitterName: string; parentId: string; parentName: string;
    rating: number; comment: string; tags: string[]; createdAt: Date;
    response?: { message: string; createdAt: Date };
}

export const DEMO_REVIEWS: DemoReview[] = [
    {
        id: 'r1', bookingId: 'b1', sitterId: 'demo-sitter-1', sitterName: 'Kim Minjung',
        parentId: 'demo-parent-1', parentName: 'Sarah Johnson', rating: 5,
        comment: 'Absolutely phenomenal! Emma had so much fun with arts and crafts. Minjung was incredibly attentive to her peanut allergy and brought nut-free snack alternatives. We could enjoy dinner worry-free knowing Emma was in the best hands.',
        tags: ['professional', 'creative', 'attentive', 'allergy_aware'], createdAt: daysAgo(3),
        response: { message: 'Thank you, Sarah! Emma is such a joy to care for. Her painting skills are impressive! Looking forward to our next session.', createdAt: daysAgo(2) },
    },
    {
        id: 'r2', bookingId: 'b2', sitterId: 'demo-sitter-2', sitterName: 'Park Sooyeon',
        parentId: 'demo-parent-2', parentName: 'Tanaka Yuki', rating: 5,
        comment: 'Sooyeon-san was amazing with both kids. She communicated in simple Korean with Haeun and used English with Yui. The photo updates throughout the evening were so reassuring. Both children were already asleep when we returned!',
        tags: ['communicative', 'bilingual', 'reliable', 'photo_updates'], createdAt: daysAgo(7),
    },
    {
        id: 'r3', bookingId: 'b3', sitterId: 'demo-sitter-3', sitterName: 'Sato Haruka',
        parentId: 'demo-parent-6', parentName: 'Choi Eunsoo', rating: 5,
        comment: 'Haruka spoke Japanese with our kids which made them feel so comfortable being away from us in a foreign country. She even taught them simple origami. The Signiel concierge recommended Petit Stay and we are so glad they did.',
        tags: ['multilingual', 'creative', 'warm', 'highly_recommended'], createdAt: daysAgo(10),
        response: { message: 'It was my pleasure! Minjae and Soyeon are such bright children. The origami crane they made was beautiful!', createdAt: daysAgo(9) },
    },
    {
        id: 'r4', bookingId: 'b4', sitterId: 'demo-sitter-1', sitterName: 'Kim Minjung',
        parentId: 'demo-parent-7', parentName: 'James Mitchell', rating: 5,
        comment: 'Third time using Petit Stay at the Grand Hyatt and Minjung is consistently outstanding. Oliver adores her. The trust protocol check-in gives us peace of mind every single time.',
        tags: ['consistent', 'trustworthy', 'repeat_booking', 'child_loved_it'], createdAt: daysAgo(14),
    },
    {
        id: 'r5', bookingId: 'b5', sitterId: 'demo-sitter-5', sitterName: 'Lee Jihye',
        parentId: 'demo-parent-5', parentName: 'Maria Garcia', rating: 4,
        comment: 'Jihye was great with Lucas. He enjoyed the storytelling session she organized. She was very professional and punctual. Only minor note: the activity log updates could have been more frequent.',
        tags: ['professional', 'punctual', 'storytelling'], createdAt: daysAgo(5),
    },
    {
        id: 'r6', bookingId: 'b6', sitterId: 'demo-sitter-4', sitterName: 'Chen Yuxi',
        parentId: 'demo-parent-3', parentName: 'Zhang Wei', rating: 4,
        comment: 'Xiaoming really enjoyed the Mandarin storytime. Yuxi was patient and warm. The shellfish allergy was carefully managed. Would have liked more photo updates, but overall a great experience.',
        tags: ['patient', 'warm', 'mandarin_speaking', 'allergy_aware'], createdAt: daysAgo(8),
        response: { message: 'Thank you for the feedback! I will make sure to send more frequent photo updates next time. Xiaoming is a wonderful child!', createdAt: daysAgo(7) },
    },
    {
        id: 'r7', bookingId: 'b7', sitterId: 'demo-sitter-7', sitterName: 'Jeong Nayoung',
        parentId: 'demo-parent-4', parentName: 'Pierre Dubois', rating: 4,
        comment: 'Nayoung spoke French with our children which was a wonderful surprise. Camille and Louis really warmed up to her. Very responsible and organized. The Four Seasons room setup was also excellent.',
        tags: ['french_speaking', 'organized', 'responsible'], createdAt: daysAgo(18),
    },
    {
        id: 'r8', bookingId: 'b8', sitterId: 'demo-sitter-6', sitterName: 'Yamamoto Rina',
        parentId: 'demo-parent-8', parentName: 'Nakamura Kenji', rating: 4,
        comment: 'Rina-san did a good job with Aoi. They did arts and crafts together and Aoi showed us her drawings afterwards. The dairy allergy was properly handled. Arrival was a few minutes late but otherwise fine.',
        tags: ['creative', 'arts_crafts', 'Japanese_speaking'], createdAt: daysAgo(12),
    },
    {
        id: 'r9', bookingId: 'b9', sitterId: 'demo-sitter-8', sitterName: 'Bae Jisoo',
        parentId: 'demo-parent-9', parentName: 'Anna Kowalski', rating: 3,
        comment: 'Jisoo was friendly but seemed a bit inexperienced. Lena got bored after the first hour and Jisoo had difficulty keeping her engaged. The check-in process was smooth though. Would try a Gold-tier sitter next time.',
        tags: ['friendly', 'needs_improvement'], createdAt: daysAgo(22),
    },
    {
        id: 'r10', bookingId: 'b10', sitterId: 'demo-sitter-5', sitterName: 'Lee Jihye',
        parentId: 'demo-parent-10', parentName: 'Robert Chen', rating: 3,
        comment: 'Service was adequate. The sitter was polite and the children were safe. However, the evening felt a bit routine -- would have appreciated more creative activities for two active kids. The platform itself is very convenient.',
        tags: ['safe', 'adequate', 'polite'], createdAt: daysAgo(25),
    },
];

// ----------------------------------------
// Payment Methods (demo)
// ----------------------------------------
export interface DemoPaymentMethod {
    id: string; brand: 'visa' | 'mastercard' | 'amex' | 'other'; last4: string;
    expiryMonth: number; expiryYear: number; holderName: string; isDefault: boolean;
}

export const DEMO_PAYMENT_METHODS: DemoPaymentMethod[] = [
    { id: 'pm1', brand: 'visa', last4: '4242', expiryMonth: 12, expiryYear: 2027, holderName: 'Sarah Johnson', isDefault: true },
    { id: 'pm2', brand: 'amex', last4: '1005', expiryMonth: 9, expiryYear: 2028, holderName: 'Sarah Johnson', isDefault: false },
];

// ----------------------------------------
// Sitter Availability (demo)
// ----------------------------------------
export const DEMO_SITTER_AVAILABILITY = {
    monday: [{ start: '09:00', end: '21:00' }], tuesday: [{ start: '09:00', end: '21:00' }],
    wednesday: [{ start: '09:00', end: '21:00' }], thursday: [{ start: '09:00', end: '21:00' }],
    friday: [{ start: '09:00', end: '23:00' }], saturday: [{ start: '10:00', end: '23:00' }],
    sunday: [{ start: '10:00', end: '20:00' }], nightShift: true, holidayAvailable: true,
};

// ----------------------------------------
// Sitter Documents (demo) -- dynamic dates
// ----------------------------------------
export interface DemoDocument { id: string; name: string; url: string; uploadedAt: Date; size: number; }

export const DEMO_SITTER_DOCUMENTS: DemoDocument[] = [
    { id: 'doc1', name: 'CPR_Certification_2025.pdf', url: 'https://demo.petitstay.com/docs/cpr.pdf', uploadedAt: monthsAgo(6), size: 245760 },
    { id: 'doc2', name: 'First_Aid_Certificate.pdf', url: 'https://demo.petitstay.com/docs/firstaid.pdf', uploadedAt: monthsAgo(3), size: 189440 },
    { id: 'doc3', name: 'Background_Check_2026.pdf', url: 'https://demo.petitstay.com/docs/background.pdf', uploadedAt: monthsAgo(1), size: 312000 },
    { id: 'doc4', name: 'Child_Psychology_Cert.pdf', url: 'https://demo.petitstay.com/docs/psych.pdf', uploadedAt: monthsAgo(8), size: 278528 },
];

// ----------------------------------------
// Incidents -- 6 incidents, various severities
// ----------------------------------------
export interface DemoIncident {
    id: string; severity: 'low' | 'medium' | 'high' | 'critical'; category: string; summary: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed'; reportedAt: Date; sitterName: string; childName: string;
}

export const DEMO_INCIDENTS: DemoIncident[] = [
    { id: '1', severity: 'low', category: 'injury', summary: 'Minor bruise on left knee from tripping while running in the play area. Ice applied immediately. Child resumed playing within 5 minutes.', status: 'resolved', reportedAt: daysAgo(2), sitterName: 'Lee Jihye', childName: 'Lucas Garcia' },
    { id: '2', severity: 'medium', category: 'illness', summary: 'Mild allergic reaction (skin rash on arms) after contact with hotel lotion in bathroom. Antihistamine administered per parent authorization. Rash subsided within 30 minutes.', status: 'resolved', reportedAt: daysAgo(5), sitterName: 'Chen Yuxi', childName: 'Xiaoming Zhang' },
    { id: '3', severity: 'low', category: 'complaint', summary: 'Adjacent room guest complained about noise from children playing after 22:00. Sitter immediately transitioned to quiet activities (reading, coloring). Apology note delivered to neighboring guest.', status: 'closed', reportedAt: daysAgo(8), sitterName: 'Park Sooyeon', childName: 'Yui Tanaka' },
    { id: '4', severity: 'medium', category: 'safety_concern', summary: 'Sitter arrived 12 minutes late due to subway delay. Hotel concierge stayed with child during gap. Process review initiated: sitters must arrive 15 minutes early.', status: 'investigating', reportedAt: daysAgo(10), sitterName: 'Yamamoto Rina', childName: 'Aoi Nakamura' },
    { id: '5', severity: 'low', category: 'other', summary: 'Extended crying episode (20 minutes) at session start. Child was experiencing separation anxiety. Sitter used calming techniques and distraction with favorite toy. Child settled and had a good session overall.', status: 'closed', reportedAt: daysAgo(14), sitterName: 'Bae Jisoo', childName: 'Lena Kowalski' },
    { id: '6', severity: 'high', category: 'injury', summary: 'Child fell from hotel room sofa (approx. 50cm height) and bumped head on carpeted floor. No visible injury, child alert and responsive. Parents notified immediately. Hotel nurse examined and confirmed no concussion.', status: 'resolved', reportedAt: daysAgo(18), sitterName: 'Jeong Nayoung', childName: 'Louis Dubois' },
];

// ----------------------------------------
// Timeline Events -- 12 events across a 4-hour session
// ----------------------------------------
export interface DemoTimelineEvent {
    id: string;
    type: 'check_in' | 'snack' | 'play' | 'reading' | 'photo_update' | 'diaper_change' | 'nap_start' | 'nap_end' | 'bath' | 'check_out' | 'note';
    time: string; description: string; detail?: string;
}

export const DEMO_TIMELINE_EVENTS: DemoTimelineEvent[] = [
    { id: 'tl-1', type: 'check_in', time: '18:00', description: 'Session started - Trust check-in completed', detail: 'Safe word verified with parent. Room safety inspection passed. Emma in good spirits, excited about painting.' },
    { id: 'tl-2', type: 'play', time: '18:10', description: 'Free play - Building blocks & puzzles', detail: 'Emma chose the wooden block set. Building a "castle for princess bear."' },
    { id: 'tl-3', type: 'photo_update', time: '18:30', description: 'Photo update sent to parent', detail: 'Sent 2 photos of Emma playing with blocks. Parent acknowledged.' },
    { id: 'tl-4', type: 'diaper_change', time: '18:45', description: 'Bathroom break', detail: 'Assisted with handwashing after bathroom visit.' },
    { id: 'tl-5', type: 'snack', time: '19:00', description: 'Snack time - Fruit plate & apple juice', detail: 'Sliced apples, grapes, and rice crackers. Confirmed nut-free. Emma ate well.' },
    { id: 'tl-6', type: 'reading', time: '19:20', description: 'Storytime - "The Very Hungry Caterpillar"', detail: 'Read together in English. Emma helped count the fruits on each page.' },
    { id: 'tl-7', type: 'play', time: '19:45', description: 'Art activity - Watercolor painting', detail: 'Set up painting station on desk with hotel-provided cover. Emma painted a rainbow and a flower.' },
    { id: 'tl-8', type: 'photo_update', time: '20:00', description: 'Photo update sent to parent', detail: 'Sent 3 photos of artwork and painting activity. Parent replied with heart emoji.' },
    { id: 'tl-9', type: 'nap_start', time: '20:15', description: 'Quiet time / Wind down', detail: 'Dimmed lights, played soft lullaby music. Emma resting on bed with her stuffed bunny.' },
    { id: 'tl-10', type: 'nap_end', time: '20:45', description: 'Emma woke up refreshed', detail: 'Short 30-minute rest. Woke up in good mood.' },
    { id: 'tl-11', type: 'play', time: '21:00', description: 'Drawing and coloring - Quiet play', detail: 'Coloring in her favorite animal coloring book. Very focused and calm.' },
    { id: 'tl-12', type: 'note', time: '21:30', description: 'Emma asked to call mommy', detail: 'Brief video call with parent (2 minutes). Emma showed her paintings. Returned to coloring happily.' },
];

// ----------------------------------------
// Guest Tokens (demo)
// ----------------------------------------
export interface DemoGuestToken {
    id: string; bookingId: string; token: string; guestName: string; room: string; expiresAt: Date; used: boolean;
}

export const DEMO_GUEST_TOKENS: DemoGuestToken[] = [
    { id: 'gt-1', bookingId: 'demo-booking-1', token: 'demo-token', guestName: 'Sarah Johnson', room: '2305', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), used: false },
    { id: 'gt-2', bookingId: 'demo-booking-2', token: 'demo-token-2', guestName: 'Tanaka Yuki', room: '1102', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), used: true },
    { id: 'gt-3', bookingId: 'demo-booking-3', token: 'demo-token-3', guestName: 'Pierre Dubois', room: '4201', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), used: false },
];

// ----------------------------------------
// Settlements -- 6 entries: 2 paid, 2 approved, 2 pending
// ----------------------------------------
export interface DemoSettlement {
    id: string; hotelId: string; hotelName: string; period: string; totalBookings: number;
    totalRevenue: number; commission: number; commissionRate: number; netPayout: number;
    status: 'draft' | 'pending_approval' | 'approved' | 'paid'; createdAt: Date;
}

function monthLabel(monthsBack: number): string {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsBack);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export const DEMO_SETTLEMENTS: DemoSettlement[] = [
    { id: 'stl-1', hotelId: 'hotel-four-seasons', hotelName: 'Four Seasons Seoul', period: monthLabel(3), totalBookings: 72, totalRevenue: 21600000, commission: 3240000, commissionRate: 15, netPayout: 18360000, status: 'paid', createdAt: monthsAgo(2) },
    { id: 'stl-2', hotelId: 'hotel-the-shilla', hotelName: 'The Shilla Seoul', period: monthLabel(3), totalBookings: 45, totalRevenue: 13500000, commission: 2025000, commissionRate: 15, netPayout: 11475000, status: 'paid', createdAt: monthsAgo(2) },
    { id: 'stl-3', hotelId: 'hotel-four-seasons', hotelName: 'Four Seasons Seoul', period: monthLabel(2), totalBookings: 68, totalRevenue: 20400000, commission: 3060000, commissionRate: 15, netPayout: 17340000, status: 'approved', createdAt: monthsAgo(1) },
    { id: 'stl-4', hotelId: 'hotel-signiel', hotelName: 'Signiel Seoul', period: monthLabel(2), totalBookings: 38, totalRevenue: 11400000, commission: 1710000, commissionRate: 15, netPayout: 9690000, status: 'approved', createdAt: monthsAgo(1) },
    { id: 'stl-5', hotelId: 'hotel-the-shilla', hotelName: 'The Shilla Seoul', period: monthLabel(1), totalBookings: 52, totalRevenue: 15600000, commission: 2340000, commissionRate: 15, netPayout: 13260000, status: 'pending_approval', createdAt: monthsAgo(0) },
    { id: 'stl-6', hotelId: 'hotel-grand-hyatt', hotelName: 'Grand Hyatt Seoul', period: monthLabel(1), totalBookings: 61, totalRevenue: 18300000, commission: 2745000, commissionRate: 15, netPayout: 15555000, status: 'pending_approval', createdAt: monthsAgo(0) },
];

// ----------------------------------------
// Ops Dashboard Stats (demo)
// ----------------------------------------
export interface DemoOpsStats {
    totalHotels: number; totalActiveSitters: number; totalBookingsThisMonth: number;
    totalRevenueThisMonth: number; avgSatisfaction: number; openIssues: number;
    pendingSettlements: number; slaCompliance: number;
}

export const DEMO_OPS_STATS: DemoOpsStats = {
    totalHotels: 9, totalActiveSitters: 18, totalBookingsThisMonth: 156, totalRevenueThisMonth: 28080000,
    avgSatisfaction: 4.72, openIssues: 3, pendingSettlements: 2, slaCompliance: 96.8,
};

// ----------------------------------------
// Ops Hotels (used by Ops Dashboard)
// ----------------------------------------
export interface DemoOpsHotel { id: string; name: string; tier: string; bookingsThisMonth: number; revenue: number; commission: number; }

export const DEMO_OPS_HOTELS: DemoOpsHotel[] = [
    { id: 'hotel-four-seasons', name: 'Four Seasons Seoul', tier: 'luxury', bookingsThisMonth: 32, revenue: 5760000, commission: 864000 },
    { id: 'hotel-the-shilla', name: 'The Shilla Seoul', tier: 'luxury', bookingsThisMonth: 28, revenue: 5040000, commission: 756000 },
    { id: 'hotel-signiel', name: 'Signiel Seoul', tier: 'luxury', bookingsThisMonth: 22, revenue: 3960000, commission: 594000 },
    { id: 'hotel-grand-hyatt', name: 'Grand Hyatt Seoul', tier: 'luxury', bookingsThisMonth: 19, revenue: 3420000, commission: 513000 },
    { id: 'hotel-park-hyatt-seoul', name: 'Park Hyatt Seoul', tier: 'luxury', bookingsThisMonth: 15, revenue: 2700000, commission: 405000 },
    { id: 'hotel-josun-palace', name: 'Josun Palace Seoul', tier: 'premium', bookingsThisMonth: 12, revenue: 2160000, commission: 324000 },
    { id: 'hotel-mandarin-tokyo', name: 'Mandarin Oriental Tokyo', tier: 'luxury', bookingsThisMonth: 11, revenue: 1980000, commission: 297000 },
    { id: 'hotel-aman-tokyo', name: 'Aman Tokyo', tier: 'luxury', bookingsThisMonth: 10, revenue: 1800000, commission: 270000 },
    { id: 'hotel-park-hyatt-tokyo', name: 'Park Hyatt Tokyo', tier: 'premium', bookingsThisMonth: 7, revenue: 1260000, commission: 189000 },
];

// ----------------------------------------
// Sitter Earnings (used by Sitter Earnings)
// ----------------------------------------
export interface DemoEarnings { thisMonth: number; lastMonth: number; pending: number; totalSessions: number; }

export const DEMO_EARNINGS: DemoEarnings = { thisMonth: 3420000, lastMonth: 2880000, pending: 540000, totalSessions: 19 };

export interface DemoMonthlyChart { month: string; amount: number; }

function recentMonthLabel(monthsBack: number): string {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsBack);
    return d.toLocaleDateString('en-US', { month: 'short' });
}

export const DEMO_MONTHLY_CHART: DemoMonthlyChart[] = [
    { month: recentMonthLabel(5), amount: 1800000 }, { month: recentMonthLabel(4), amount: 2160000 },
    { month: recentMonthLabel(3), amount: 2520000 }, { month: recentMonthLabel(2), amount: 2880000 },
    { month: recentMonthLabel(1), amount: 3060000 }, { month: recentMonthLabel(0), amount: 3420000 },
];

export interface DemoRecentPayment { id: string; date: string; hotel: string; hours: number; amount: number; status: 'paid' | 'pending'; }

export const DEMO_RECENT_PAYMENTS: DemoRecentPayment[] = [
    { id: '1', date: formatShortDate(-1), hotel: 'Four Seasons Seoul', hours: 4, amount: 360000, status: 'paid' },
    { id: '2', date: formatShortDate(-3), hotel: 'The Shilla Seoul', hours: 4, amount: 340000, status: 'paid' },
    { id: '3', date: formatShortDate(-5), hotel: 'Signiel Seoul', hours: 4, amount: 360000, status: 'paid' },
    { id: '4', date: formatShortDate(-7), hotel: 'Grand Hyatt Seoul', hours: 4, amount: 360000, status: 'paid' },
    { id: '5', date: formatShortDate(-8), hotel: 'Four Seasons Seoul', hours: 3, amount: 270000, status: 'paid' },
    { id: '6', date: formatShortDate(-10), hotel: 'Park Hyatt Seoul', hours: 4, amount: 360000, status: 'pending' },
    { id: '7', date: formatShortDate(-12), hotel: 'Josun Palace Seoul', hours: 3, amount: 180000, status: 'pending' },
];

export interface DemoHotelBreakdown { hotel: string; sessions: number; amount: number; percentage: number; }

export const DEMO_HOTEL_BREAKDOWN: DemoHotelBreakdown[] = [
    { hotel: 'Four Seasons Seoul', sessions: 7, amount: 2340000, percentage: 32 },
    { hotel: 'The Shilla Seoul', sessions: 4, amount: 1360000, percentage: 19 },
    { hotel: 'Signiel Seoul', sessions: 3, amount: 1080000, percentage: 15 },
    { hotel: 'Grand Hyatt Seoul', sessions: 3, amount: 1080000, percentage: 15 },
    { hotel: 'Park Hyatt Seoul', sessions: 2, amount: 720000, percentage: 10 },
    { hotel: 'Josun Palace Seoul', sessions: 1, amount: 360000, percentage: 5 },
    { hotel: 'Mandarin Oriental Tokyo', sessions: 1, amount: 360000, percentage: 4 },
];
