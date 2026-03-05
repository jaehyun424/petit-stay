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
  console.log('Connected to Firebase Emulators');
} else {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or start emulators first.');
    console.error('   For emulators: FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/seed.ts');
    process.exit(1);
  }
  const serviceAccount = (await import(serviceAccountPath, { with: { type: 'json' } })).default as ServiceAccount;
  initializeApp({ credential: cert(serviceAccount) });
  console.log('Connected to production Firebase');
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

function monthsAgo(months: number): Timestamp {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return Timestamp.fromDate(date);
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
  console.log('\nSeeding Petit Stay database...\n');

  // === HOTELS (9 hotels matching demo data) ===
  const hotels = [
    {
      id: 'hotel-four-seasons',
      name: 'Four Seasons Seoul',
      nameI18n: { en: 'Four Seasons Seoul', ko: '포시즌스 서울', ja: 'フォーシーズンズソウル', zh: '首尔四季酒店' },
      tier: 'luxury', address: '97 Saemunan-ro, Jongno-gu, Seoul',
      coordinates: { lat: 37.5725, lng: 126.9753 },
      logo: '/images/hotels/four-seasons.png',
      contactEmail: 'concierge@fourseasons-seoul.com', contactPhone: '+82-2-6388-5000',
      timezone: 'Asia/Seoul', currency: 'KRW', commission: 15,
      settings: { autoAssign: false, requireGoldForInfant: true, maxAdvanceBookingDays: 60, minBookingHours: 3, cancellationPolicy: 'strict' },
      stats: { totalBookings: 312, safetyDays: 450, averageRating: 4.9, thisMonthBookings: 32, thisMonthRevenue: 5760000 },
      slaMetrics: { responseRate: 99, replacementRate: 97, satisfactionRate: 98 },
      createdAt: daysAgo(365), updatedAt: Timestamp.now(),
    },
    {
      id: 'hotel-the-shilla',
      name: 'The Shilla Seoul',
      nameI18n: { en: 'The Shilla Seoul', ko: '신라호텔 서울', ja: '新羅ホテルソウル', zh: '首尔新罗酒店' },
      tier: 'luxury', address: '249 Dongho-ro, Jung-gu, Seoul',
      coordinates: { lat: 37.5557, lng: 127.0012 },
      logo: '/images/hotels/the-shilla.png',
      contactEmail: 'concierge@shilla.net', contactPhone: '+82-2-2233-3131',
      timezone: 'Asia/Seoul', currency: 'KRW', commission: 15,
      settings: { autoAssign: true, requireGoldForInfant: true, maxAdvanceBookingDays: 30, minBookingHours: 2, cancellationPolicy: 'moderate' },
      stats: { totalBookings: 245, safetyDays: 380, averageRating: 4.8, thisMonthBookings: 28, thisMonthRevenue: 5040000 },
      slaMetrics: { responseRate: 98, replacementRate: 95, satisfactionRate: 97 },
      createdAt: daysAgo(300), updatedAt: Timestamp.now(),
    },
    {
      id: 'hotel-signiel',
      name: 'Signiel Seoul',
      nameI18n: { en: 'Signiel Seoul', ko: '시그니엘 서울', ja: 'シグニエルソウル', zh: '首尔Signiel酒店' },
      tier: 'luxury', address: '300 Olympic-ro, Songpa-gu, Seoul',
      coordinates: { lat: 37.5126, lng: 127.1025 },
      logo: '/images/hotels/signiel.png',
      contactEmail: 'concierge@signielseoul.com', contactPhone: '+82-2-3213-1000',
      timezone: 'Asia/Seoul', currency: 'KRW', commission: 15,
      settings: { autoAssign: true, requireGoldForInfant: true, maxAdvanceBookingDays: 45, minBookingHours: 2, cancellationPolicy: 'moderate' },
      stats: { totalBookings: 178, safetyDays: 210, averageRating: 4.85, thisMonthBookings: 22, thisMonthRevenue: 3960000 },
      slaMetrics: { responseRate: 97, replacementRate: 94, satisfactionRate: 96 },
      createdAt: daysAgo(250), updatedAt: Timestamp.now(),
    },
    {
      id: 'hotel-grand-hyatt',
      name: 'Grand Hyatt Seoul',
      nameI18n: { en: 'Grand Hyatt Seoul', ko: '그랜드 하얏트 서울', ja: 'グランドハイアットソウル', zh: '首尔君悦酒店' },
      tier: 'luxury', address: '322 Sowol-ro, Yongsan-gu, Seoul',
      coordinates: { lat: 37.5383, lng: 126.9989 },
      logo: '/images/hotels/grand-hyatt.png',
      contactEmail: 'concierge@grandhyattseoul.com', contactPhone: '+82-2-797-1234',
      timezone: 'Asia/Seoul', currency: 'KRW', commission: 15,
      settings: { autoAssign: true, requireGoldForInfant: true, maxAdvanceBookingDays: 30, minBookingHours: 2, cancellationPolicy: 'moderate' },
      stats: { totalBookings: 284, safetyDays: 365, averageRating: 4.8, thisMonthBookings: 19, thisMonthRevenue: 3420000 },
      slaMetrics: { responseRate: 98, replacementRate: 95, satisfactionRate: 97 },
      createdAt: daysAgo(365), updatedAt: Timestamp.now(),
    },
    {
      id: 'hotel-park-hyatt-seoul',
      name: 'Park Hyatt Seoul',
      nameI18n: { en: 'Park Hyatt Seoul', ko: '파크 하얏트 서울', ja: 'パークハイアットソウル', zh: '首尔柏悦酒店' },
      tier: 'luxury', address: '606 Teheran-ro, Gangnam-gu, Seoul',
      coordinates: { lat: 37.5085, lng: 127.0602 },
      logo: '/images/hotels/park-hyatt.png',
      contactEmail: 'concierge@parkhyattseoul.com', contactPhone: '+82-2-2016-1234',
      timezone: 'Asia/Seoul', currency: 'KRW', commission: 15,
      settings: { autoAssign: false, requireGoldForInfant: true, maxAdvanceBookingDays: 30, minBookingHours: 3, cancellationPolicy: 'strict' },
      stats: { totalBookings: 156, safetyDays: 200, averageRating: 4.87, thisMonthBookings: 15, thisMonthRevenue: 2700000 },
      slaMetrics: { responseRate: 99, replacementRate: 96, satisfactionRate: 98 },
      createdAt: daysAgo(200), updatedAt: Timestamp.now(),
    },
  ];

  for (const hotel of hotels) {
    const { id, ...data } = hotel;
    await db.collection('hotels').doc(id).set(data);
    console.log(`  Hotel: ${hotel.name}`);
  }

  // === USERS ===
  const staffFS = await createTestUser(
    'staff@fourseasons.test', 'test1234', 'hotel_staff',
    { firstName: 'Yuna', lastName: 'Park', phone: '+82-10-1111-0002' },
    { hotelId: 'hotel-four-seasons' }
  );
  console.log(`  Hotel staff: Yuna Park (Four Seasons) -> ${staffFS}`);

  const staffSH = await createTestUser(
    'staff@shilla.test', 'test1234', 'hotel_staff',
    { firstName: 'Minjun', lastName: 'Kim', phone: '+82-10-1111-0001' },
    { hotelId: 'hotel-the-shilla' }
  );
  console.log(`  Hotel staff: Minjun Kim (The Shilla) -> ${staffSH}`);

  // Parents
  const parent1 = await createTestUser(
    'parent1@test.com', 'test1234', 'parent',
    { firstName: 'Sarah', lastName: 'Johnson', phone: '+1-415-555-0173', nationality: 'US' },
    { parentInfo: { emergencyContact: 'Michael Johnson', emergencyPhone: '+1-415-555-0174' } }
  );
  console.log(`  Parent: Sarah Johnson -> ${parent1}`);

  const parent2 = await createTestUser(
    'parent2@test.com', 'test1234', 'parent',
    { firstName: 'Yuki', lastName: 'Tanaka', phone: '+81-90-1234-5678', nationality: 'JP', preferredLanguage: 'ja' },
    { parentInfo: { emergencyContact: 'Takeshi Tanaka', emergencyPhone: '+81-90-8765-4321' } }
  );
  console.log(`  Parent: Tanaka Yuki -> ${parent2}`);

  const parent3 = await createTestUser(
    'parent3@test.com', 'test1234', 'parent',
    { firstName: 'Wei', lastName: 'Zhang', phone: '+86-138-2188-6600', nationality: 'CN', preferredLanguage: 'zh' },
    { parentInfo: { emergencyContact: 'Li Zhang', emergencyPhone: '+86-138-2188-6601' } }
  );
  console.log(`  Parent: Zhang Wei -> ${parent3}`);

  const parent4 = await createTestUser(
    'parent4@test.com', 'test1234', 'parent',
    { firstName: 'Pierre', lastName: 'Dubois', phone: '+33-6-12-34-56-78', nationality: 'FR' },
    { parentInfo: { emergencyContact: 'Marie Dubois', emergencyPhone: '+33-6-12-34-56-79' } }
  );
  console.log(`  Parent: Pierre Dubois -> ${parent4}`);

  const parent5 = await createTestUser(
    'parent5@test.com', 'test1234', 'parent',
    { firstName: 'Maria', lastName: 'Garcia', phone: '+34-612-345-678', nationality: 'ES' },
    { parentInfo: { emergencyContact: 'Carlos Garcia', emergencyPhone: '+34-612-345-679' } }
  );
  console.log(`  Parent: Maria Garcia -> ${parent5}`);

  // Admin
  const adminId = await createTestUser(
    'admin@petitstay.com', 'admin1234', 'admin',
    { firstName: 'Jiwon', lastName: 'Lee', phone: '+82-10-9999-0001' }
  );
  console.log(`  Admin: Jiwon Lee -> ${adminId}`);

  // === SITTERS (8 sitters: 3 gold, 5 silver) ===
  const sitterUsers: { id: string; userId: string; data: Record<string, unknown> }[] = [];

  // Gold 1: Kim Minjung
  const s1 = await createTestUser('sitter1@test.com', 'test1234', 'sitter',
    { firstName: 'Minjung', lastName: 'Kim', phone: '+82-10-2222-0001' },
    { sitterInfo: { sitterId: 'sitter-minjung' } });
  sitterUsers.push({ id: 'sitter-minjung', userId: s1, data: {
    tier: 'gold', status: 'active',
    profile: { displayName: 'Kim Minjung', bio: 'Certified childcare specialist with 8 years of luxury hotel experience. Specializes in infant and toddler care with multilingual communication.', bioI18n: { ko: '럭셔리 호텔 환경에서 8년 경력의 공인 보육 전문가입니다.', ja: '高級ホテルで8年の経験を持つ認定チャイルドケアスペシャリスト。', zh: '在豪华酒店环境中拥有8年经验的认证儿童保育专家。' }, avatar: '/images/sitters/minjung.jpg', languages: ['ko', 'en', 'ja'], experience: 8, specialties: ['infant_care', 'multilingual', 'first_aid'] },
    certifications: [
      { type: 'childcare', name: 'Korea Childcare Certificate Level 1', issuedBy: 'MOHW', issuedAt: daysAgo(730) },
      { type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(180) },
      { type: 'cpr', name: 'Child Psychology Certificate', issuedBy: 'Seoul National University', issuedAt: daysAgo(365) },
      { type: 'hotel_manner', name: 'Luxury Service Training', issuedBy: 'Petit Stay Academy', issuedAt: daysAgo(90) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(450) },
    availability: { monday: [{ start: '09:00', end: '21:00' }], tuesday: [{ start: '09:00', end: '21:00' }], wednesday: [{ start: '09:00', end: '21:00' }], thursday: [{ start: '09:00', end: '21:00' }], friday: [{ start: '09:00', end: '23:00' }], saturday: [{ start: '10:00', end: '23:00' }], sunday: [{ start: '10:00', end: '20:00' }], nightShift: true, holidayAvailable: true },
    pricing: { hourlyRate: 90000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 312, totalHours: 1248, averageRating: 4.95, ratingCount: 287, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.72 },
    bankInfo: { bankName: 'KB Kookmin', accountNumber: '***-****-7890', accountHolder: 'Kim Minjung' },
    partnerHotels: ['hotel-four-seasons', 'hotel-the-shilla', 'hotel-grand-hyatt', 'hotel-signiel'],
  }});

  // Gold 2: Park Sooyeon
  const s2 = await createTestUser('sitter2@test.com', 'test1234', 'sitter',
    { firstName: 'Sooyeon', lastName: 'Park', phone: '+82-10-2222-0002' },
    { sitterInfo: { sitterId: 'sitter-sooyeon' } });
  sitterUsers.push({ id: 'sitter-sooyeon', userId: s2, data: {
    tier: 'gold', status: 'active',
    profile: { displayName: 'Park Sooyeon', bio: 'Former kindergarten teacher turned premium childcare provider. Montessori-trained with a focus on creative play and early learning.', avatar: '/images/sitters/sooyeon.jpg', languages: ['ko', 'en', 'zh'], experience: 6, specialties: ['montessori', 'creative_play', 'early_learning'] },
    certifications: [
      { type: 'childcare', name: 'Montessori Level 1', issuedBy: 'AMI Korea', issuedAt: daysAgo(600) },
      { type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(150) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(380) },
    availability: { monday: [{ start: '09:00', end: '20:00' }], tuesday: [{ start: '09:00', end: '20:00' }], wednesday: [{ start: '09:00', end: '20:00' }], thursday: [{ start: '09:00', end: '20:00' }], friday: [{ start: '09:00', end: '23:00' }], saturday: [{ start: '10:00', end: '23:00' }], sunday: [{ start: '10:00', end: '19:00' }], nightShift: true, holidayAvailable: true },
    pricing: { hourlyRate: 85000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 247, totalHours: 988, averageRating: 4.88, ratingCount: 223, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.68 },
    bankInfo: { bankName: 'Shinhan', accountNumber: '***-****-3456', accountHolder: 'Park Sooyeon' },
    partnerHotels: ['hotel-four-seasons', 'hotel-the-shilla', 'hotel-signiel'],
  }});

  // Gold 3: Sato Haruka
  const s3 = await createTestUser('sitter3@test.com', 'test1234', 'sitter',
    { firstName: 'Haruka', lastName: 'Sato', phone: '+81-80-5555-1234', preferredLanguage: 'ja' },
    { sitterInfo: { sitterId: 'sitter-haruka' } });
  sitterUsers.push({ id: 'sitter-haruka', userId: s3, data: {
    tier: 'gold', status: 'active',
    profile: { displayName: 'Sato Haruka', bio: 'Licensed Hoikushi (nursery teacher) from Tokyo with 7 years experience. Expert in bilingual childcare for Japanese-speaking families.', avatar: '/images/sitters/haruka.jpg', languages: ['ja', 'en', 'ko'], experience: 7, specialties: ['multilingual', 'travel_families', 'infant_care'] },
    certifications: [
      { type: 'childcare', name: 'Hoikushi National License', issuedBy: 'Japan MHLW', issuedAt: daysAgo(900) },
      { type: 'first_aid', name: 'First Aid Certification', issuedBy: 'Japanese Red Cross', issuedAt: daysAgo(200) },
      { type: 'hotel_manner', name: 'Luxury Service Training', issuedBy: 'Petit Stay Academy', issuedAt: daysAgo(60) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(520) },
    availability: { monday: [{ start: '08:00', end: '20:00' }], tuesday: [{ start: '08:00', end: '20:00' }], wednesday: [{ start: '08:00', end: '20:00' }], thursday: [{ start: '08:00', end: '20:00' }], friday: [{ start: '08:00', end: '22:00' }], saturday: [{ start: '09:00', end: '22:00' }], sunday: [{ start: '09:00', end: '19:00' }], nightShift: false, holidayAvailable: true },
    pricing: { hourlyRate: 90000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 289, totalHours: 1156, averageRating: 4.92, ratingCount: 264, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.65 },
    bankInfo: { bankName: 'Woori', accountNumber: '***-****-6789', accountHolder: 'Sato Haruka' },
    partnerHotels: ['hotel-four-seasons', 'hotel-signiel', 'hotel-park-hyatt-seoul'],
  }});

  // Silver 1: Chen Yuxi
  const s4 = await createTestUser('sitter4@test.com', 'test1234', 'sitter',
    { firstName: 'Yuxi', lastName: 'Chen', phone: '+86-138-0000-1234', preferredLanguage: 'zh' },
    { sitterInfo: { sitterId: 'sitter-yuxi' } });
  sitterUsers.push({ id: 'sitter-yuxi', userId: s4, data: {
    tier: 'silver', status: 'active',
    profile: { displayName: 'Chen Yuxi', bio: 'Native Mandarin speaker with early childhood education background. Great with shy children and first-time hotel childcare families.', avatar: '/images/sitters/yuxi.jpg', languages: ['zh', 'en', 'ko'], experience: 2, specialties: ['mandarin', 'shy_children'] },
    certifications: [{ type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(120) }],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(140) },
    availability: { monday: [{ start: '10:00', end: '18:00' }], tuesday: [{ start: '10:00', end: '18:00' }], wednesday: [], thursday: [{ start: '10:00', end: '18:00' }], friday: [{ start: '10:00', end: '22:00' }], saturday: [{ start: '09:00', end: '22:00' }], sunday: [{ start: '09:00', end: '18:00' }], nightShift: false, holidayAvailable: false },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 95, totalHours: 285, averageRating: 4.65, ratingCount: 82, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.52 },
    bankInfo: { bankName: 'Hana', accountNumber: '***-****-2345', accountHolder: 'Chen Yuxi' },
    partnerHotels: ['hotel-four-seasons', 'hotel-the-shilla'],
  }});

  // Silver 2: Lee Jihye
  const s5 = await createTestUser('sitter5@test.com', 'test1234', 'sitter',
    { firstName: 'Jihye', lastName: 'Lee', phone: '+82-10-2222-0005' },
    { sitterInfo: { sitterId: 'sitter-jihye' } });
  sitterUsers.push({ id: 'sitter-jihye', userId: s5, data: {
    tier: 'silver', status: 'active',
    profile: { displayName: 'Lee Jihye', bio: 'Psychology graduate specializing in child behavior. Known for calm demeanor and excellent communication with parents.', avatar: '/images/sitters/jihye.jpg', languages: ['ko', 'en'], experience: 3, specialties: ['child_psychology', 'communication'] },
    certifications: [
      { type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(150) },
      { type: 'childcare', name: 'Child Psychology Certificate', issuedBy: 'Yonsei University', issuedAt: daysAgo(400) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(210) },
    availability: { monday: [{ start: '10:00', end: '19:00' }], tuesday: [{ start: '10:00', end: '19:00' }], wednesday: [{ start: '10:00', end: '19:00' }], thursday: [{ start: '10:00', end: '19:00' }], friday: [{ start: '10:00', end: '22:00' }], saturday: [{ start: '10:00', end: '22:00' }], sunday: [], nightShift: false, holidayAvailable: false },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 156, totalHours: 468, averageRating: 4.72, ratingCount: 140, safetyRecord: 100, noShowCount: 1, repeatClientRate: 0.58 },
    bankInfo: { bankName: 'Shinhan', accountNumber: '***-****-5678', accountHolder: 'Lee Jihye' },
    partnerHotels: ['hotel-four-seasons', 'hotel-grand-hyatt'],
  }});

  // Silver 3-5 (abbreviated for seed - Yamamoto Rina, Jeong Nayoung, Bae Jisoo)
  const s6 = await createTestUser('sitter6@test.com', 'test1234', 'sitter',
    { firstName: 'Rina', lastName: 'Yamamoto', phone: '+81-80-6666-1234', preferredLanguage: 'ja' },
    { sitterInfo: { sitterId: 'sitter-rina' } });
  sitterUsers.push({ id: 'sitter-rina', userId: s6, data: {
    tier: 'silver', status: 'active',
    profile: { displayName: 'Yamamoto Rina', bio: 'Bilingual Japanese-Korean caregiver. Passionate about arts and crafts activities with children.', avatar: '/images/sitters/rina.jpg', languages: ['ja', 'ko'], experience: 1, specialties: ['arts_crafts', 'bilingual'] },
    certifications: [{ type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(90) }],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(95) },
    availability: { monday: [{ start: '14:00', end: '22:00' }], tuesday: [{ start: '14:00', end: '22:00' }], wednesday: [{ start: '14:00', end: '22:00' }], thursday: [{ start: '14:00', end: '22:00' }], friday: [{ start: '14:00', end: '23:00' }], saturday: [{ start: '10:00', end: '23:00' }], sunday: [{ start: '10:00', end: '20:00' }], nightShift: false, holidayAvailable: true },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 78, totalHours: 234, averageRating: 4.45, ratingCount: 68, safetyRecord: 100, noShowCount: 1, repeatClientRate: 0.45 },
    bankInfo: { bankName: 'Woori', accountNumber: '***-****-9012', accountHolder: 'Yamamoto Rina' },
    partnerHotels: ['hotel-four-seasons', 'hotel-the-shilla'],
  }});

  const s7 = await createTestUser('sitter7@test.com', 'test1234', 'sitter',
    { firstName: 'Nayoung', lastName: 'Jeong', phone: '+82-10-2222-0007' },
    { sitterInfo: { sitterId: 'sitter-nayoung' } });
  sitterUsers.push({ id: 'sitter-nayoung', userId: s7, data: {
    tier: 'silver', status: 'active',
    profile: { displayName: 'Jeong Nayoung', bio: 'Early childhood education degree from Ewha Womans University. Trilingual with experience caring for European families.', avatar: '/images/sitters/nayoung.jpg', languages: ['ko', 'en', 'fr'], experience: 4, specialties: ['trilingual', 'european_families', 'early_education'] },
    certifications: [
      { type: 'childcare', name: 'Early Childhood Education Degree', issuedBy: 'Ewha Womans University', issuedAt: daysAgo(500) },
      { type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(100) },
    ],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(175) },
    availability: { monday: [{ start: '09:00', end: '18:00' }], tuesday: [{ start: '09:00', end: '18:00' }], wednesday: [{ start: '09:00', end: '18:00' }], thursday: [{ start: '09:00', end: '18:00' }], friday: [{ start: '09:00', end: '21:00' }], saturday: [{ start: '10:00', end: '21:00' }], sunday: [], nightShift: false, holidayAvailable: false },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 112, totalHours: 336, averageRating: 4.58, ratingCount: 98, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.55 },
    bankInfo: { bankName: 'KB Kookmin', accountNumber: '***-****-3456', accountHolder: 'Jeong Nayoung' },
    partnerHotels: ['hotel-four-seasons', 'hotel-grand-hyatt', 'hotel-park-hyatt-seoul'],
  }});

  const s8 = await createTestUser('sitter8@test.com', 'test1234', 'sitter',
    { firstName: 'Jisoo', lastName: 'Bae', phone: '+82-10-2222-0008' },
    { sitterInfo: { sitterId: 'sitter-jisoo' } });
  sitterUsers.push({ id: 'sitter-jisoo', userId: s8, data: {
    tier: 'silver', status: 'active',
    profile: { displayName: 'Bae Jisoo', bio: 'Energetic and creative caregiver. Former after-school program coordinator with a talent for storytelling and music activities.', avatar: '/images/sitters/jisoo.jpg', languages: ['ko', 'en'], experience: 2, specialties: ['storytelling', 'music', 'creative_play'] },
    certifications: [{ type: 'first_aid', name: 'CPR/First Aid', issuedBy: 'Korean Red Cross', issuedAt: daysAgo(80) }],
    verification: { identity: 'verified', background: 'verified', training: 'completed', verifiedAt: daysAgo(80) },
    availability: { monday: [{ start: '14:00', end: '21:00' }], tuesday: [{ start: '14:00', end: '21:00' }], wednesday: [{ start: '14:00', end: '21:00' }], thursday: [{ start: '14:00', end: '21:00' }], friday: [{ start: '14:00', end: '22:00' }], saturday: [{ start: '10:00', end: '22:00' }], sunday: [{ start: '10:00', end: '18:00' }], nightShift: false, holidayAvailable: true },
    pricing: { hourlyRate: 60000, nightMultiplier: 1.5, holidayMultiplier: 1.3 },
    stats: { totalSessions: 64, totalHours: 192, averageRating: 4.35, ratingCount: 55, safetyRecord: 100, noShowCount: 0, repeatClientRate: 0.42 },
    bankInfo: { bankName: 'Hana', accountNumber: '***-****-7890', accountHolder: 'Bae Jisoo' },
    partnerHotels: ['hotel-the-shilla', 'hotel-grand-hyatt'],
  }});

  for (const s of sitterUsers) {
    await db.collection('sitters').doc(s.id).set({ userId: s.userId, ...s.data, createdAt: daysAgo(365), updatedAt: Timestamp.now() });
    console.log(`  Sitter: ${(s.data.profile as { displayName: string }).displayName} (${s.data.tier})`);
  }

  // === CHILDREN ===
  const children = [
    { id: 'child-emma', parentId: parent1, firstName: 'Emma', age: 5, gender: 'female', allergies: ['peanuts'], medicalNotes: 'Carries EpiPen', favoriteActivities: ['drawing', 'singing', 'puzzles'], dietaryRestrictions: ['nut-free'], consentGiven: true, consentTimestamp: daysAgo(7), autoDeleteAt: daysFromNow(90), createdAt: daysAgo(7) },
    { id: 'child-lily', parentId: parent1, firstName: 'Lily', age: 3, gender: 'female', allergies: ['dairy'], favoriteActivities: ['blocks', 'dolls'], dietaryRestrictions: ['dairy-free'], consentGiven: true, consentTimestamp: daysAgo(7), autoDeleteAt: daysFromNow(90), createdAt: daysAgo(7) },
    { id: 'child-yui', parentId: parent2, firstName: 'Yui', age: 4, gender: 'female', allergies: [], favoriteActivities: ['origami', 'coloring'], consentGiven: true, consentTimestamp: daysAgo(5), autoDeleteAt: daysFromNow(90), createdAt: daysAgo(5) },
    { id: 'child-xiaoming', parentId: parent3, firstName: 'Xiaoming', age: 3, gender: 'male', allergies: ['shellfish'], favoriteActivities: ['blocks', 'cartoon'], dietaryRestrictions: ['shellfish-free'], consentGiven: true, consentTimestamp: daysAgo(3), autoDeleteAt: daysFromNow(90), createdAt: daysAgo(3) },
    { id: 'child-camille', parentId: parent4, firstName: 'Camille', age: 7, gender: 'female', allergies: [], favoriteActivities: ['reading', 'puzzles', 'drawing'], consentGiven: true, consentTimestamp: daysAgo(2), autoDeleteAt: daysFromNow(90), createdAt: daysAgo(2) },
    { id: 'child-lucas', parentId: parent5, firstName: 'Lucas', age: 7, gender: 'male', allergies: [], favoriteActivities: ['lego', 'stories'], consentGiven: true, consentTimestamp: daysAgo(4), autoDeleteAt: daysFromNow(90), createdAt: daysAgo(4) },
  ];

  for (const child of children) {
    const { id, ...data } = child;
    await db.collection('children').doc(id).set(data);
    console.log(`  Child: ${child.firstName} (age ${child.age})`);
  }

  // === BOOKINGS (8 covering all statuses) ===
  const bookings = [
    { id: 'booking-pending', hotelId: 'hotel-four-seasons', parentId: parent4, confirmationCode: generateConfirmationCode(), status: 'pending',
      schedule: { date: daysFromNow(0), startTime: '21:00', endTime: '01:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '4201', floorNumber: 42 },
      children: [{ childId: 'child-camille', firstName: 'Camille', age: 7 }],
      requirements: { sitterTier: 'any', preferredLanguages: ['fr', 'en'] },
      pricing: { baseRate: 60000, hours: 4, baseTotal: 240000, nightSurcharge: 30000, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 270000, commission: 40500, total: 270000 },
      payment: { status: 'authorized', method: 'card' }, trustProtocol: { safeWord: 'PAPILLON' }, metadata: { source: 'concierge' },
      createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
    { id: 'booking-confirmed', hotelId: 'hotel-four-seasons', parentId: parent1, sitterId: 'sitter-minjung', confirmationCode: generateConfirmationCode(), status: 'confirmed',
      schedule: { date: daysFromNow(1), startTime: '10:00', endTime: '14:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '2203', floorNumber: 22 },
      children: [{ childId: 'child-emma', firstName: 'Emma', age: 5, allergies: ['peanuts'] }, { childId: 'child-lily', firstName: 'Lily', age: 3, allergies: ['dairy'] }],
      requirements: { sitterTier: 'gold', preferredLanguages: ['en', 'ko'] },
      pricing: { baseRate: 90000, hours: 4, baseTotal: 360000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 60000, subtotal: 420000, commission: 63000, total: 420000 },
      payment: { status: 'authorized', method: 'card' }, trustProtocol: { safeWord: 'RAINBOW' }, metadata: { source: 'parent_app' },
      createdAt: daysAgo(2), updatedAt: Timestamp.now() },
    { id: 'booking-in-progress', hotelId: 'hotel-four-seasons', parentId: parent1, sitterId: 'sitter-minjung', confirmationCode: 'KCP-2026-0042', status: 'in_progress',
      schedule: { date: Timestamp.now(), startTime: '18:00', endTime: '22:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '2305', floorNumber: 23 },
      children: [{ childId: 'child-emma', firstName: 'Emma', age: 5, allergies: ['peanuts'] }],
      requirements: { sitterTier: 'gold', preferredLanguages: ['en'] },
      pricing: { baseRate: 90000, hours: 4, baseTotal: 360000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 360000, commission: 54000, total: 360000 },
      payment: { status: 'authorized', method: 'card' },
      trustProtocol: { safeWord: 'SUNSHINE', checkIn: { timestamp: hoursFromNow(-3), sitterVerified: true, parentVerified: true, roomSafetyChecked: true, childConditionNoted: true, emergencyConsentSigned: true, signatures: { parent: 'data:image/png;base64,...', sitter: 'data:image/png;base64,...' } } },
      metadata: { source: 'parent_app' }, createdAt: daysAgo(1), updatedAt: Timestamp.now() },
    { id: 'booking-completed-1', hotelId: 'hotel-the-shilla', parentId: parent5, sitterId: 'sitter-jihye', confirmationCode: generateConfirmationCode(), status: 'completed',
      schedule: { date: daysAgo(1), startTime: '17:00', endTime: '21:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '2108', floorNumber: 21 },
      children: [{ childId: 'child-lucas', firstName: 'Lucas', age: 7 }],
      requirements: { sitterTier: 'any', preferredLanguages: ['en'] },
      pricing: { baseRate: 60000, hours: 4, baseTotal: 240000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 240000, commission: 36000, total: 240000 },
      payment: { status: 'captured', method: 'card', paidAt: daysAgo(1) },
      trustProtocol: { safeWord: 'ESTRELLA', checkIn: { timestamp: daysAgo(1), sitterVerified: true, parentVerified: true, roomSafetyChecked: true, childConditionNoted: true, emergencyConsentSigned: true, signatures: { parent: 'data:...', sitter: 'data:...' } }, checkOut: { timestamp: daysAgo(1), childConditionNoted: true, itemsReturned: true, parentSatisfied: true, signatures: { parent: 'data:...', sitter: 'data:...' } } },
      review: { rating: 4, comment: 'Jihye was great with Lucas. Professional and punctual.', tags: ['professional', 'punctual'], createdAt: daysAgo(1) },
      metadata: { source: 'concierge' }, createdAt: daysAgo(5), updatedAt: daysAgo(1), completedAt: daysAgo(1) },
    { id: 'booking-completed-2', hotelId: 'hotel-signiel', parentId: parent2, sitterId: 'sitter-haruka', confirmationCode: generateConfirmationCode(), status: 'completed',
      schedule: { date: daysAgo(5), startTime: '18:00', endTime: '22:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '1507', floorNumber: 15 },
      children: [{ childId: 'child-yui', firstName: 'Yui', age: 4 }],
      requirements: { sitterTier: 'gold', preferredLanguages: ['ja'] },
      pricing: { baseRate: 90000, hours: 4, baseTotal: 360000, nightSurcharge: 0, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 360000, commission: 54000, total: 360000 },
      payment: { status: 'captured', method: 'card', paidAt: daysAgo(5) },
      trustProtocol: { safeWord: 'SAKURA', checkIn: { timestamp: daysAgo(5), sitterVerified: true, parentVerified: true, roomSafetyChecked: true, childConditionNoted: true, emergencyConsentSigned: true, signatures: { parent: 'data:...', sitter: 'data:...' } }, checkOut: { timestamp: daysAgo(5), childConditionNoted: true, itemsReturned: true, parentSatisfied: true, signatures: { parent: 'data:...', sitter: 'data:...' } } },
      review: { rating: 5, comment: 'Haruka spoke Japanese with Yui which made her so comfortable. Wonderful experience!', tags: ['multilingual', 'warm', 'highly_recommended'], createdAt: daysAgo(4) },
      metadata: { source: 'parent_app' }, createdAt: daysAgo(10), updatedAt: daysAgo(4), completedAt: daysAgo(5) },
    { id: 'booking-cancelled', hotelId: 'hotel-four-seasons', parentId: parent1, sitterId: 'sitter-sooyeon', confirmationCode: generateConfirmationCode(), status: 'cancelled',
      schedule: { date: daysAgo(2), startTime: '20:00', endTime: '24:00', duration: 4, timezone: 'Asia/Seoul' },
      location: { type: 'room', roomNumber: '1903', floorNumber: 19 },
      children: [{ childId: 'child-emma', firstName: 'Emma', age: 5, allergies: ['peanuts'] }],
      requirements: { sitterTier: 'gold', preferredLanguages: ['en'] },
      pricing: { baseRate: 85000, hours: 4, baseTotal: 340000, nightSurcharge: 42500, holidaySurcharge: 0, goldSurcharge: 0, subtotal: 382500, commission: 57375, total: 382500 },
      payment: { status: 'refunded', method: 'card', refundedAt: daysAgo(3), refundAmount: 382500 },
      trustProtocol: { safeWord: 'STARLIGHT' },
      cancellation: { cancelledBy: 'parent', reason: 'Change of travel plans - flight rescheduled', timestamp: daysAgo(3), refundStatus: 'full', refundAmount: 382500, penaltyApplied: false },
      metadata: { source: 'parent_app' }, createdAt: daysAgo(7), updatedAt: daysAgo(3) },
  ];

  for (const booking of bookings) {
    const { id, ...data } = booking;
    await db.collection('bookings').doc(id).set(data);
    console.log(`  Booking: ${booking.id} (${booking.status})`);
  }

  // === REVIEWS ===
  const reviews = [
    { id: 'review-1', bookingId: 'booking-completed-2', hotelId: 'hotel-signiel', parentId: parent2, sitterId: 'sitter-haruka', rating: 5, comment: 'Haruka spoke Japanese with Yui which made her so comfortable. She even taught origami. The Signiel concierge recommended Petit Stay and we are so glad.', tags: ['multilingual', 'creative', 'warm'], createdAt: daysAgo(4), response: { message: 'It was my pleasure! Yui is such a bright child. The origami crane she made was beautiful!', createdAt: daysAgo(3) } },
    { id: 'review-2', bookingId: 'booking-completed-1', hotelId: 'hotel-the-shilla', parentId: parent5, sitterId: 'sitter-jihye', rating: 4, comment: 'Jihye was great with Lucas. He enjoyed the storytelling session. Professional and punctual. Activity log updates could be more frequent.', tags: ['professional', 'punctual', 'storytelling'], createdAt: daysAgo(1) },
    { id: 'review-3', bookingId: 'booking-prev-1', hotelId: 'hotel-four-seasons', parentId: parent1, sitterId: 'sitter-minjung', rating: 5, comment: 'Minjung is consistently outstanding. Emma adores her. The trust protocol gives us peace of mind every time.', tags: ['consistent', 'trustworthy', 'repeat_booking'], response: { message: 'Thank you, Sarah! Emma is such a joy!', createdAt: daysAgo(12) }, createdAt: daysAgo(14) },
    { id: 'review-4', bookingId: 'booking-prev-2', hotelId: 'hotel-four-seasons', parentId: parent3, sitterId: 'sitter-yuxi', rating: 4, comment: 'Xiaoming really enjoyed the Mandarin storytime. Yuxi was patient and warm. Shellfish allergy carefully managed.', tags: ['patient', 'warm', 'mandarin_speaking'], response: { message: 'Thank you! I will send more photo updates next time.', createdAt: daysAgo(7) }, createdAt: daysAgo(8) },
    { id: 'review-5', bookingId: 'booking-prev-3', hotelId: 'hotel-four-seasons', parentId: parent4, sitterId: 'sitter-nayoung', rating: 4, comment: 'Nayoung spoke French with our children which was a wonderful surprise. Very responsible and organized.', tags: ['french_speaking', 'organized', 'responsible'], createdAt: daysAgo(18) },
  ];

  for (const review of reviews) {
    const { id, ...data } = review;
    await db.collection('reviews').doc(id).set(data);
    console.log(`  Review: ${review.rating}/5 for ${review.sitterId}`);
  }

  // === INCIDENTS ===
  const incidents = [
    { id: 'incident-1', bookingId: 'booking-prev-4', sessionId: 'session-prev-4', hotelId: 'hotel-the-shilla', sitterId: 'sitter-jihye', parentId: parent5,
      severity: 'low', category: 'injury',
      report: { summary: 'Minor bruise on left knee from tripping while running.', details: 'Child tripped on carpet edge while running in play area. Ice applied immediately. Child resumed playing within 5 minutes.', reportedBy: 'sitter', reportedAt: daysAgo(2) },
      response: { firstResponseAt: daysAgo(2), respondedBy: 'ops-team', actions: [{ action: 'First aid applied', takenBy: 'sitter-jihye', timestamp: daysAgo(2) }] },
      resolution: { status: 'resolved', outcome: 'Minor injury, no medical attention needed', resolvedAt: daysAgo(2), resolvedBy: 'ops-team' },
      documentation: { photos: [], medicalReports: [], witnessStatements: [], internalNotes: ['Standard bruise protocol followed'] },
      followUp: { parentContacted: true, parentSatisfied: true, sitterAction: 'none' },
      createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { id: 'incident-2', bookingId: 'booking-prev-5', sessionId: 'session-prev-5', hotelId: 'hotel-four-seasons', sitterId: 'sitter-yuxi', parentId: parent3,
      severity: 'medium', category: 'illness',
      report: { summary: 'Mild allergic reaction after contact with hotel lotion.', details: 'Skin rash on arms after contact with hotel bathroom lotion. Antihistamine administered per parent authorization. Rash subsided within 30 minutes.', reportedBy: 'sitter', reportedAt: daysAgo(5) },
      response: { firstResponseAt: daysAgo(5), respondedBy: 'ops-team', actions: [{ action: 'Antihistamine administered', takenBy: 'sitter-yuxi', timestamp: daysAgo(5) }, { action: 'Hotel notified to remove lotion', takenBy: 'ops-team', timestamp: daysAgo(5) }] },
      resolution: { status: 'resolved', outcome: 'Allergic reaction resolved. Hotel removed lotion from room.', resolvedAt: daysAgo(5), resolvedBy: 'ops-team' },
      documentation: { photos: [], medicalReports: [], witnessStatements: [], internalNotes: ['Hotel to review bathroom amenity allergy warnings'] },
      followUp: { parentContacted: true, parentSatisfied: true, preventiveMeasures: ['Check room amenities before session start'], sitterAction: 'none' },
      createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  ];

  for (const incident of incidents) {
    const { id, ...data } = incident;
    await db.collection('incidents').doc(id).set(data);
    console.log(`  Incident: ${incident.id} (${incident.severity})`);
  }

  // === DONE ===
  console.log('\nSeed complete!');
  console.log('   5 hotels, 12 users, 8 sitters, 6 children, 6 bookings, 5 reviews, 2 incidents');
  console.log('\nTest accounts (password: test1234):');
  console.log('   parent1@test.com    - Sarah Johnson (parent, US)');
  console.log('   parent2@test.com    - Tanaka Yuki (parent, JP)');
  console.log('   parent3@test.com    - Zhang Wei (parent, CN)');
  console.log('   parent4@test.com    - Pierre Dubois (parent, FR)');
  console.log('   parent5@test.com    - Maria Garcia (parent, ES)');
  console.log('   sitter1@test.com    - Kim Minjung (gold sitter)');
  console.log('   sitter2@test.com    - Park Sooyeon (gold sitter)');
  console.log('   sitter3@test.com    - Sato Haruka (gold sitter)');
  console.log('   sitter4@test.com    - Chen Yuxi (silver sitter)');
  console.log('   sitter5@test.com    - Lee Jihye (silver sitter)');
  console.log('   sitter6@test.com    - Yamamoto Rina (silver sitter)');
  console.log('   sitter7@test.com    - Jeong Nayoung (silver sitter)');
  console.log('   sitter8@test.com    - Bae Jisoo (silver sitter)');
  console.log('   staff@fourseasons.test - Yuna Park (hotel staff)');
  console.log('   staff@shilla.test   - Minjun Kim (hotel staff)');
  console.log('   admin@petitstay.com - Jiwon Lee (admin, password: admin1234)');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
