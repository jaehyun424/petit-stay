// ============================================
// Petit Stay - Firestore Seed Script
// Usage: npx tsx scripts/seed.ts
// Requires: GOOGLE_APPLICATION_CREDENTIALS or Firebase emulator
// ============================================

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ----------------------------------------
// Initialize Firebase Admin
// ----------------------------------------
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

if (useEmulator) {
  initializeApp({ projectId: 'petit-stay' });
  console.log('🔧 Connected to Firebase Emulators');
} else {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) {
    console.error('❌ Set GOOGLE_APPLICATION_CREDENTIALS or start emulators first.');
    console.error('   For emulators: FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/seed.ts');
    process.exit(1);
  }
  const serviceAccount = (await import(serviceAccountPath, { with: { type: 'json' } })).default as ServiceAccount;
  initializeApp({ credential: cert(serviceAccount) });
  console.log('☁️  Connected to production Firebase');
}

const db = getFirestore();
const auth = getAuth();

// ----------------------------------------
// Helper functions
// ----------------------------------------
function daysFromNow(days: number): Timestamp {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return Timestamp.fromDate(date);
}

function hoursFromNow(hours: number): Timestamp {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return Timestamp.fromDate(date);
}

function daysAgo(days: number): Timestamp {
  return daysFromNow(-days);
}

function generateConfirmationCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `KCP-2026-${num}`;
}

// ----------------------------------------
// Test Users (Auth + Firestore)
// ----------------------------------------
async function createTestUser(
  email: string,
  password: string,
  role: string,
  profile: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): Promise<string> {
  let uid: string;
  try {
    const userRecord = await auth.createUser({ email, password, displayName: `${profile.firstName} ${profile.lastName}` });
    uid = userRecord.uid;
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'auth/email-already-exists') {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
    } else {
      throw e;
    }
  }

  await db.collection('users').doc(uid).set({
    email,
    role,
    profile: {
      phoneVerified: false,
      preferredLanguage: 'en',
      ...profile,
    },
    notifications: { push: true, email: true, sms: false },
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    ...extra,
  });

  return uid;
}

// ----------------------------------------
// Seed Data
// ----------------------------------------
async function seed() {
  console.log('\n📦 Seeding Petit Stay database...\n');

  // === HOTELS ===
  const hotels = [
    {
      id: 'hotel-grand-hyatt',
      name: 'Grand Hyatt Seoul',
      nameI18n: { en: 'Grand Hyatt Seoul', ko: '그랜드 하얏트 서울', ja: 'グランドハイアットソウル', zh: '首尔君悦酒店' },
      tier: 'luxury',
      address: '322 Sowol-ro, Yongsan-gu, Seoul',
      coordinates: { lat: 37.5383, lng: 126.9989 },
      logo: '/images/hotels/grand-hyatt.png',
      contactEmail: 'concierge@grandhyattseoul.com',
      contactPhone: '+82-2-797-1234',
      timezone: 'Asia/Seoul',
      currency: 'KRW',
      commission: 0.15,
      settings: {
        autoAssign: true,
        requireGoldForInfant: true,
        maxAdvanceBookingDays: 30,
        minBookingHours: 2,
        cancellationPolicy: 'moderate',
      },
      stats: { totalBookings: 284, safetyDays: 365, averageRating: 4.8, thisMonthBookings: 23, thisMonthRevenue: 4200000 },
      slaMetrics: { responseRate: 0.98, replacementRate: 0.95, satisfactionRate: 0.97 },
      createdAt: daysAgo(365),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'hotel-four-seasons',
      name: 'Four Seasons Seoul',
      nameI18n: { en: 'Four Seasons Seoul', ko: '포시즌스 서울', ja: 'フォーシーズンズソウル', zh: '首尔四季酒店' },
      tier: 'luxury',
      address: '97 Saemunan-ro, Jongno-gu, Seoul',
      coordinates: { lat: 37.5725, lng: 126.9753 },
      logo: '/images/hotels/four-seasons.png',
      contactEmail: 'concierge@fourseasons-seoul.com',
      contactPhone: '+82-2-6388-5000',
      timezone: 'Asia/Seoul',
      currency: 'KRW',
      commission: 0.12,
      settings: {
        autoAssign: false,
        requireGoldForInfant: true,
        maxAdvanceBookingDays: 60,
        minBookingHours: 3,
        cancellationPolicy: 'strict',
      },
      stats: { totalBookings: 156, safetyDays: 210, averageRating: 4.9, thisMonthBookings: 15, thisMonthRevenue: 3150000 },
      slaMetrics: { responseRate: 0.99, replacementRate: 0.97, satisfactionRate: 0.98 },
      createdAt: daysAgo(210),
      updatedAt: Timestamp.now(),
    },
  ];

  for (const hotel of hotels) {
    const { id, ...data } = hotel;
    await db.collection('hotels').doc(id).set(data);
    console.log(`  🏨 Hotel: ${hotel.name}`);
  }

  // === USERS ===
  // Hotel staff
  const staffGH = await createTestUser(
    'staff@grandhyatt.test', 'test1234', 'hotel_staff',
    { firstName: 'Minjun', lastName: 'Kim', phone: '+82-10-1111-0001' },
    { hotelId: 'hotel-grand-hyatt' }
  );
  console.log(`  👤 Hotel staff: Minjun Kim (Grand Hyatt) → ${staffGH}`);

  const staffFS = await createTestUser(
    'staff@fourseasons.test', 'test1234', 'hotel_staff',
    { firstName: 'Yuna', lastName: 'Park', phone: '+82-10-1111-0002' },
    { hotelId: 'hotel-four-seasons' }
  );
  console.log(`  👤 Hotel staff: Yuna Park (Four Seasons) → ${staffFS}`);

  // Parents
  const parent1 = await createTestUser(
    'parent1@test.com', 'test1234', 'parent',
    { firstName: 'Sarah', lastName: 'Johnson', phone: '+1-555-0101', nationality: 'US' },
    { parentInfo: { emergencyContact: 'Michael Johnson', emergencyPhone: '+1-555-0102' } }
  );
  console.log(`  👤 Parent: Sarah Johnson → ${parent1}`);

  const parent2 = await createTestUser(
    'parent2@test.com', 'test1234', 'parent',
    { firstName: 'Takeshi', lastName: 'Yamamoto', phone: '+81-90-1234-5678', nationality: 'JP', preferredLanguage: 'ja' },
    { parentInfo: { emergencyContact: 'Akiko Yamamoto', emergencyPhone: '+81-90-8765-4321' } }
  );
  console.log(`  👤 Parent: Takeshi Yamamoto → ${parent2}`);

  // Admin
  const adminId = await createTestUser(
    'admin@petitstay.com', 'admin1234', 'admin',
    { firstName: 'Jiwon', lastName: 'Lee', phone: '+82-10-9999-0001' }
  );
  console.log(`  👤 Admin: Jiwon Lee → ${adminId}`);

  // === SITTERS ===
  const sitter1Id = await createTestUser(
    'sitter1@test.com', 'test1234', 'sitter',
    { firstName: 'Eunji', lastName: 'Choi', phone: '+82-10-2222-0001' },
    { sitterInfo: { sitterId: 'sitter-eunji' } }
  );
  const sitters = [
    {
      id: 'sitter-eunji',
      userId: sitter1Id,
      tier: 'gold',
      status: 'active',
      profile: {
        displayName: 'Eunji Choi',
        bio: 'Certified childcare specialist with 8 years of experience in luxury hotel settings.',
        bioI18n: {
          ko: '럭셔리 호텔 환경에서 8년 경력의 공인 보육 전문가입니다.',
          ja: '高級ホテルで8年の経験を持つ認定チャイルドケアスペシャリスト。',
          zh: '在豪华酒店环境中拥有8年经验的认证儿童保育专家。',
        },
        avatar: '/images/sitters/eunji.jpg',
        languages: ['ko', 'en', 'ja'],
        experience: 8,
        specialties: ['infant_care', 'multilingual', 'first_aid'],
      },
      certifications: [
        { type: 'childcare', name: 'Korea Childcare Certificate Level 1', issuedBy: 'MOHW', issuedAt: daysAgo(730) },
        { type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(180) },
        { type: 'hotel_manner', name: 'Luxury Service Training', issuedBy: 'Petit Stay Academy', issuedAt: daysAgo(90) },
      ],
      verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(365) },
      availability: {
        monday: [{ start: '09:00', end: '21:00' }],
        tuesday: [{ start: '09:00', end: '21:00' }],
        wednesday: [{ start: '09:00', end: '21:00' }],
        thursday: [{ start: '09:00', end: '21:00' }],
        friday: [{ start: '09:00', end: '23:00' }],
        saturday: [{ start: '10:00', end: '23:00' }],
        sunday: [{ start: '10:00', end: '20:00' }],
        nightShift: true,
        holidayAvailable: true,
      },
      pricing: { hourlyRate: 90000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
      stats: { totalSessions: 312, totalHours: 1248, averageRating: 4.9, ratingCount: 287, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.72 },
      bankInfo: { bankName: 'KB Kookmin', accountNumber: '***-****-7890', accountHolder: 'Choi Eunji' },
      partnerHotels: ['hotel-grand-hyatt', 'hotel-four-seasons'],
      createdAt: daysAgo(365),
      updatedAt: Timestamp.now(),
    },
  ];

  const sitter2Id = await createTestUser(
    'sitter2@test.com', 'test1234', 'sitter',
    { firstName: 'Hana', lastName: 'Lee', phone: '+82-10-2222-0002' },
    { sitterInfo: { sitterId: 'sitter-hana' } }
  );
  sitters.push({
    id: 'sitter-hana',
    userId: sitter2Id,
    tier: 'silver',
    status: 'active',
    profile: {
      displayName: 'Hana Lee',
      bio: 'Early childhood education major with a warm approach to childcare. Fluent in Korean and English.',
      bioI18n: {
        ko: '따뜻한 돌봄을 지향하는 유아교육 전공자입니다. 한국어와 영어에 능통합니다.',
        ja: '温かいアプローチの幼児教育専攻。韓国語と英語に堪能。',
        zh: '幼儿教育专业，以温暖的方式照顾儿童。精通韩语和英语。',
      },
      avatar: '/images/sitters/hana.jpg',
      languages: ['ko', 'en'],
      experience: 3,
      specialties: ['toddler_care', 'creative_play'],
    },
    certifications: [
      { type: 'childcare', name: 'Korea Childcare Certificate Level 2', issuedBy: 'MOHW', issuedAt: daysAgo(400) },
      { type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(120) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(200) },
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '20:00' }],
      saturday: [{ start: '09:00', end: '22:00' }],
      sunday: [{ start: '09:00', end: '18:00' }],
      nightShift: false,
      holidayAvailable: false,
    },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 98, totalHours: 294, averageRating: 4.7, ratingCount: 89, safetyRecord: 100, noShowCount: 1, repeatClientRate: 0.58 },
    bankInfo: { bankName: 'Shinhan', accountNumber: '***-****-3456', accountHolder: 'Lee Hana' },
    partnerHotels: ['hotel-grand-hyatt'],
    createdAt: daysAgo(200),
    updatedAt: Timestamp.now(),
  });

  const sitter3Id = await createTestUser(
    'sitter3@test.com', 'test1234', 'sitter',
    { firstName: 'Yuki', lastName: 'Tanaka', phone: '+81-80-5555-1234', preferredLanguage: 'ja' },
    { sitterInfo: { sitterId: 'sitter-yuki' } }
  );
  sitters.push({
    id: 'sitter-yuki',
    userId: sitter3Id,
    tier: 'silver',
    status: 'active',
    profile: {
      displayName: 'Yuki Tanaka',
      bio: 'Bilingual Japanese-Korean childcare provider. Specializes in caring for traveling families from Japan.',
      bioI18n: {
        ko: '일본어-한국어 이중언어 보육 제공자. 일본에서 온 여행 가족 돌봄 전문.',
        ja: '日韓バイリンガルの保育士。日本からの旅行家族のケアを専門としています。',
        zh: '日韩双语儿童保育提供者。专门照顾来自日本的旅行家庭。',
      },
      avatar: '/images/sitters/yuki.jpg',
      languages: ['ja', 'ko', 'en'],
      experience: 5,
      specialties: ['multilingual', 'travel_families', 'infant_care'],
    },
    certifications: [
      { type: 'childcare', name: 'Hoikushi (保育士) National License', issuedBy: 'Japan MHLW', issuedAt: daysAgo(900) },
      { type: 'first_aid', name: 'First Aid Certification', issuedBy: 'Japanese Red Cross', issuedAt: daysAgo(200) },
      { type: 'hotel_manner', name: 'Luxury Service Training', issuedBy: 'Petit Stay Academy', issuedAt: daysAgo(60) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(150) },
    availability: {
      monday: [{ start: '08:00', end: '20:00' }],
      tuesday: [{ start: '08:00', end: '20:00' }],
      wednesday: [{ start: '08:00', end: '20:00' }],
      thursday: [{ start: '08:00', end: '20:00' }],
      friday: [{ start: '08:00', end: '22:00' }],
      saturday: [{ start: '09:00', end: '22:00' }],
      sunday: [{ start: '09:00', end: '19:00' }],
      nightShift: false,
      holidayAvailable: true,
    },
    pricing: { hourlyRate: 65000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 145, totalHours: 580, averageRating: 4.8, ratingCount: 132, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.65 },
    bankInfo: { bankName: 'Woori', accountNumber: '***-****-6789', accountHolder: 'Tanaka Yuki' },
    partnerHotels: ['hotel-four-seasons'],
    createdAt: daysAgo(150),
    updatedAt: Timestamp.now(),
  });

  for (const sitter of sitters) {
    const { id, ...data } = sitter;
    await db.collection('sitters').doc(id).set(data);
    console.log(`  👩‍🍼 Sitter: ${sitter.profile.displayName} (${sitter.tier})`);
  }

  // === CHILDREN ===
  const children = [
    {
      id: 'child-emma',
      parentId: parent1,
      firstName: 'Emma',
      age: 4,
      gender: 'female',
      allergies: ['peanuts'],
      medicalNotes: 'Carries EpiPen',
      specialNeeds: '',
      favoriteActivities: ['drawing', 'singing', 'puzzles'],
      dietaryRestrictions: ['nut-free'],
      consentGiven: true,
      consentTimestamp: daysAgo(7),
      autoDeleteAt: daysFromNow(90),
      createdAt: daysAgo(7),
    },
    {
      id: 'child-liam',
      parentId: parent1,
      firstName: 'Liam',
      age: 2,
      gender: 'male',
      allergies: [],
      favoriteActivities: ['blocks', 'car toys'],
      sleepSchedule: 'Nap at 13:00-15:00',
      consentGiven: true,
      consentTimestamp: daysAgo(7),
      autoDeleteAt: daysFromNow(90),
      createdAt: daysAgo(7),
    },
    {
      id: 'child-haru',
      parentId: parent2,
      firstName: 'Haru',
      age: 6,
      gender: 'male',
      allergies: ['dairy'],
      dietaryRestrictions: ['dairy-free'],
      favoriteActivities: ['origami', 'reading', 'lego'],
      consentGiven: true,
      consentTimestamp: daysAgo(3),
      autoDeleteAt: daysFromNow(90),
      createdAt: daysAgo(3),
    },
  ];

  for (const child of children) {
    const { id, ...data } = child;
    await db.collection('children').doc(id).set(data);
    console.log(`  👶 Child: ${child.firstName} (age ${child.age})`);
  }

  // === BOOKINGS (5 statuses) ===
  const bookings = [
    // 1. pending — future booking, no sitter yet
    {
      id: 'booking-pending',
      hotelId: 'hotel-grand-hyatt',
      parentId: parent1,
      confirmationCode: generateConfirmationCode(),
      status: 'pending',
      schedule: { date: daysFromNow(3), startTime: '14:00', endTime: '18:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '2305', floorNumber: 23 },
      children: [{ childId: 'child-emma', firstName: 'Emma', age: 4, allergies: ['peanuts'] }],
      requirements: { sitterTier: 'gold', preferredLanguages: ['en'], specialRequests: 'Child has peanut allergy — please be careful with snacks.' },
      pricing: { baseRate: 90000, hours: 4, baseTotal: 360000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 60000, subtotal: 420000, commission: 63000, total: 420000 },
      payment: { status: 'authorized', method: 'card' },
      trustProtocol: { safeWord: 'SUNSHINE' },
      metadata: { source: 'parent_app' },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    // 2. confirmed — sitter assigned, upcoming
    {
      id: 'booking-confirmed',
      hotelId: 'hotel-grand-hyatt',
      parentId: parent1,
      sitterId: 'sitter-eunji',
      confirmationCode: generateConfirmationCode(),
      status: 'confirmed',
      schedule: { date: daysFromNow(1), startTime: '10:00', endTime: '14:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '2305', floorNumber: 23 },
      children: [
        { childId: 'child-emma', firstName: 'Emma', age: 4, allergies: ['peanuts'] },
        { childId: 'child-liam', firstName: 'Liam', age: 2 },
      ],
      requirements: { sitterTier: 'gold', preferredLanguages: ['en', 'ko'] },
      pricing: { baseRate: 90000, hours: 4, baseTotal: 360000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 60000, subtotal: 420000, commission: 63000, total: 420000 },
      payment: { status: 'authorized', method: 'card' },
      trustProtocol: { safeWord: 'RAINBOW' },
      metadata: { source: 'concierge' },
      createdAt: daysAgo(2),
      updatedAt: Timestamp.now(),
    },
    // 3. in_progress — happening right now
    {
      id: 'booking-in-progress',
      hotelId: 'hotel-four-seasons',
      parentId: parent2,
      sitterId: 'sitter-yuki',
      confirmationCode: generateConfirmationCode(),
      status: 'in_progress',
      schedule: { date: Timestamp.now(), startTime: '09:00', endTime: '13:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'kids_room', kidsRoomName: 'Sunshine Room', floorNumber: 3 },
      children: [{ childId: 'child-haru', firstName: 'Haru', age: 6, allergies: ['dairy'] }],
      requirements: { sitterTier: 'any', preferredLanguages: ['ja'] },
      pricing: { baseRate: 65000, hours: 4, baseTotal: 260000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 260000, commission: 31200, total: 260000 },
      payment: { status: 'authorized', method: 'card' },
      trustProtocol: {
        safeWord: 'SAKURA',
        checkIn: {
          timestamp: hoursFromNow(-2),
          sitterVerified: true,
          parentVerified: true,
          roomSafetyChecked: true,
          childConditionNoted: true,
          emergencyConsentSigned: true,
          signatures: { parent: 'data:image/png;base64,...', sitter: 'data:image/png;base64,...' },
        },
      },
      metadata: { source: 'parent_app' },
      createdAt: daysAgo(1),
      updatedAt: Timestamp.now(),
    },
    // 4. completed — finished with review
    {
      id: 'booking-completed',
      hotelId: 'hotel-grand-hyatt',
      parentId: parent2,
      sitterId: 'sitter-hana',
      confirmationCode: generateConfirmationCode(),
      status: 'completed',
      schedule: { date: daysAgo(5), startTime: '15:00', endTime: '19:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '1812', floorNumber: 18 },
      children: [{ childId: 'child-haru', firstName: 'Haru', age: 6, allergies: ['dairy'] }],
      requirements: { sitterTier: 'any', preferredLanguages: ['ja', 'ko'] },
      pricing: { baseRate: 60000, hours: 4, baseTotal: 240000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 240000, commission: 36000, total: 240000 },
      payment: { status: 'captured', method: 'card', paidAt: daysAgo(5) },
      trustProtocol: {
        safeWord: 'BLOSSOM',
        checkIn: {
          timestamp: daysAgo(5),
          sitterVerified: true,
          parentVerified: true,
          roomSafetyChecked: true,
          childConditionNoted: true,
          emergencyConsentSigned: true,
          signatures: { parent: 'data:image/png;base64,...', sitter: 'data:image/png;base64,...' },
        },
        checkOut: {
          timestamp: daysAgo(5),
          childConditionNoted: true,
          itemsReturned: true,
          parentSatisfied: true,
          signatures: { parent: 'data:image/png;base64,...', sitter: 'data:image/png;base64,...' },
        },
      },
      review: {
        rating: 5,
        comment: 'Hana was wonderful with Haru! Very patient and creative with activities.',
        tags: ['patient', 'creative', 'punctual'],
        createdAt: daysAgo(4),
      },
      metadata: { source: 'concierge' },
      createdAt: daysAgo(10),
      updatedAt: daysAgo(4),
      completedAt: daysAgo(5),
    },
    // 5. cancelled — parent cancelled
    {
      id: 'booking-cancelled',
      hotelId: 'hotel-four-seasons',
      parentId: parent1,
      sitterId: 'sitter-eunji',
      confirmationCode: generateConfirmationCode(),
      status: 'cancelled',
      schedule: { date: daysAgo(2), startTime: '18:00', endTime: '22:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '3201', floorNumber: 32 },
      children: [{ childId: 'child-emma', firstName: 'Emma', age: 4, allergies: ['peanuts'] }],
      requirements: { sitterTier: 'gold', preferredLanguages: ['en'] },
      pricing: { baseRate: 90000, hours: 4, baseTotal: 360000, nightSurcharge: 45000, holidaySurcharge: 0, goldSurcharge: 60000, subtotal: 465000, commission: 55800, total: 465000 },
      payment: { status: 'refunded', method: 'card', refundedAt: daysAgo(3), refundAmount: 465000 },
      trustProtocol: { safeWord: 'STARLIGHT' },
      cancellation: {
        cancelledBy: 'parent',
        reason: 'Change of travel plans — flight rescheduled',
        timestamp: daysAgo(3),
        refundStatus: 'full',
        refundAmount: 465000,
        penaltyApplied: false,
      },
      metadata: { source: 'parent_app' },
      createdAt: daysAgo(7),
      updatedAt: daysAgo(3),
    },
  ];

  for (const booking of bookings) {
    const { id, ...data } = booking;
    await db.collection('bookings').doc(id).set(data);
    console.log(`  📋 Booking: ${booking.id} (${booking.status})`);
  }

  // === REVIEWS ===
  const reviews = [
    {
      id: 'review-1',
      bookingId: 'booking-completed',
      hotelId: 'hotel-grand-hyatt',
      parentId: parent2,
      sitterId: 'sitter-hana',
      rating: 5,
      comment: 'Hana was wonderful with Haru! Very patient and creative with activities. He didn\'t want to leave!',
      tags: ['patient', 'creative', 'punctual', 'child_loved_it'],
      createdAt: daysAgo(4),
    },
    {
      id: 'review-2',
      bookingId: 'booking-prev-1',
      hotelId: 'hotel-grand-hyatt',
      parentId: parent1,
      sitterId: 'sitter-eunji',
      rating: 5,
      comment: 'Eunji is absolutely amazing. Professional, warm, and incredibly attentive. Emma asks for her every time.',
      tags: ['professional', 'warm', 'attentive', 'repeat_booking'],
      response: {
        message: 'Thank you so much! Emma is a joy to care for. Looking forward to next time!',
        createdAt: daysAgo(12),
      },
      createdAt: daysAgo(14),
    },
    {
      id: 'review-3',
      bookingId: 'booking-prev-2',
      hotelId: 'hotel-four-seasons',
      parentId: parent2,
      sitterId: 'sitter-yuki',
      rating: 4,
      comment: 'Yuki was great with Haru. They communicated in Japanese which made Haru very comfortable. Slightly late arrival.',
      tags: ['bilingual', 'comfortable', 'good_communication'],
      createdAt: daysAgo(20),
    },
  ];

  for (const review of reviews) {
    const { id, ...data } = review;
    await db.collection('reviews').doc(id).set(data);
    console.log(`  ⭐ Review: ${review.rating}/5 for ${review.sitterId}`);
  }

  // === DONE ===
  console.log('\n✅ Seed complete!');
  console.log('   2 hotels, 7 users, 3 sitters, 3 children, 5 bookings, 3 reviews');
  console.log('\n📧 Test accounts (password: test1234):');
  console.log('   parent1@test.com    — Sarah Johnson (parent)');
  console.log('   parent2@test.com    — Takeshi Yamamoto (parent)');
  console.log('   sitter1@test.com    — Eunji Choi (gold sitter)');
  console.log('   sitter2@test.com    — Hana Lee (silver sitter)');
  console.log('   sitter3@test.com    — Yuki Tanaka (silver sitter)');
  console.log('   staff@grandhyatt.test — Minjun Kim (hotel staff)');
  console.log('   staff@fourseasons.test — Yuna Park (hotel staff)');
  console.log('   admin@petitstay.com — Jiwon Lee (admin, password: admin1234)');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
