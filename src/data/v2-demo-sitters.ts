// Demo sitter data for V2 marketplace
// These are fictional profiles for demonstration purposes

export interface DemoSitter {
  id: string;
  name: string;
  nameKo: string;
  photo: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  badges: string[];
  shortBio: string;
  shortBioKo: string;
  ageMin: number;
  ageMax: number;
  areas: string[];
  certified: boolean;
}

// Extended profile data for /sitters/:id detail page
export interface SitterProfileDetail extends DemoSitter {
  ageGroup: string;
  introVideo: boolean;
  languageLevels: { lang: string; level: 'L1' | 'L2' | 'L3' }[];
  experienceYears: number;
  ageExperience: { range: string; level: 'none' | 'basic' | 'experienced' }[];
  services: string[];
  nightAvailable: boolean;
  availability: { day: string; slots: string[] }[];
  stats: {
    responseRate: number;
    acceptRate: number;
    cancelRate: number;
    rebookRate: number;
  };
  verifications: {
    backgroundCheck: boolean;
    cpr: boolean;
    reference: boolean;
    videoIntro: boolean;
  };
  reviews: {
    parentName: string;
    rating: number;
    comment: string;
    commentKo: string;
    date: string;
  }[];
}

export const demoSitters: DemoSitter[] = [
  {
    id: 'sitter-001',
    name: 'Yuna Park',
    nameKo: '박유나',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    languages: ['English', 'Korean', 'Japanese'],
    rating: 4.9,
    reviewCount: 47,
    hourlyRate: 35000,
    badges: ['Certified', 'CPR', 'Background Check'],
    shortBio: '5 years of childcare experience. Early childhood education major.',
    shortBioKo: '아동 돌봄 경력 5년. 유아교육 전공.',
    ageMin: 3,
    ageMax: 8,
    areas: ['Itaewon', 'Gangnam'],
    certified: true,
  },
  {
    id: 'sitter-002',
    name: 'Minji Lee',
    nameKo: '이민지',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    languages: ['English', 'Korean'],
    rating: 4.8,
    reviewCount: 32,
    hourlyRate: 30000,
    badges: ['Certified', 'Background Check'],
    shortBio: 'Bilingual educator. Loves arts & crafts with kids.',
    shortBioKo: '이중언어 교육자. 아이들과 미술 놀이를 좋아해요.',
    ageMin: 3,
    ageMax: 6,
    areas: ['Myeongdong', 'Jongno'],
    certified: true,
  },
  {
    id: 'sitter-003',
    name: 'Saki Tanaka',
    nameKo: '타나카 사키',
    photo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80',
    languages: ['Japanese', 'English', 'Korean'],
    rating: 5.0,
    reviewCount: 28,
    hourlyRate: 40000,
    badges: ['Certified', 'CPR', 'Background Check', 'Video Intro'],
    shortBio: 'Japanese native. Nursery teacher license. Calm and attentive.',
    shortBioKo: '일본어 원어민. 보육교사 자격증. 차분하고 세심해요.',
    ageMin: 3,
    ageMax: 8,
    areas: ['Itaewon', 'Hongdae'],
    certified: true,
  },
  {
    id: 'sitter-004',
    name: 'Haeun Choi',
    nameKo: '최하은',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    languages: ['English', 'Korean', 'Chinese'],
    rating: 4.7,
    reviewCount: 19,
    hourlyRate: 28000,
    badges: ['Background Check', 'CPR'],
    shortBio: 'Trilingual. Great with shy children. Patient and warm.',
    shortBioKo: '3개 국어 가능. 낯가리는 아이도 잘 다뤄요.',
    ageMin: 3,
    ageMax: 7,
    areas: ['Gangnam', 'Jamsil'],
    certified: false,
  },
  {
    id: 'sitter-005',
    name: 'Jiwon Kim',
    nameKo: '김지원',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    languages: ['English', 'Korean'],
    rating: 4.6,
    reviewCount: 14,
    hourlyRate: 25000,
    badges: ['Background Check'],
    shortBio: 'Child psychology student. Playful and energetic.',
    shortBioKo: '아동심리학과 재학. 활발하고 에너지 넘쳐요.',
    ageMin: 4,
    ageMax: 8,
    areas: ['Hongdae', 'Mapo'],
    certified: false,
  },
  {
    id: 'sitter-006',
    name: 'Mei Lin Chen',
    nameKo: '첸메이린',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    languages: ['Chinese', 'English', 'Korean'],
    rating: 4.9,
    reviewCount: 36,
    hourlyRate: 38000,
    badges: ['Certified', 'CPR', 'Background Check', 'Video Intro'],
    shortBio: 'Mandarin native. Hotel childcare specialist. 4 years experience.',
    shortBioKo: '중국어 원어민. 호텔 돌봄 전문. 경력 4년.',
    ageMin: 3,
    ageMax: 8,
    areas: ['Myeongdong', 'Gangnam'],
    certified: true,
  },
  {
    id: 'sitter-007',
    name: 'Sooyeon Bae',
    nameKo: '배수연',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    languages: ['Korean', 'English', 'Japanese'],
    rating: 4.8,
    reviewCount: 41,
    hourlyRate: 32000,
    badges: ['Certified', 'Background Check', 'CPR'],
    shortBio: 'Former kindergarten teacher. Bedtime routine expert.',
    shortBioKo: '전직 유치원 교사. 수면 루틴 전문가.',
    ageMin: 3,
    ageMax: 6,
    areas: ['Itaewon', 'Yongsan'],
    certified: true,
  },
  {
    id: 'sitter-008',
    name: 'Emma Yoshida',
    nameKo: '요시다 에마',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    languages: ['Japanese', 'English'],
    rating: 4.5,
    reviewCount: 8,
    hourlyRate: 27000,
    badges: ['Background Check'],
    shortBio: 'Friendly and creative. Loves storytelling and music.',
    shortBioKo: '다정하고 창의적이에요. 동화 읽기와 음악을 좋아해요.',
    ageMin: 3,
    ageMax: 8,
    areas: ['Hongdae', 'Sinchon'],
    certified: false,
  },
];

// Detailed profile data keyed by sitter ID
export const sitterProfiles: Record<string, SitterProfileDetail> = {
  'sitter-001': {
    ...demoSitters[0],
    ageGroup: '20s',
    introVideo: false,
    languageLevels: [
      { lang: 'English', level: 'L3' },
      { lang: 'Korean', level: 'L3' },
      { lang: 'Japanese', level: 'L2' },
    ],
    experienceYears: 5,
    ageExperience: [
      { range: '0-2', level: 'basic' },
      { range: '3-5', level: 'experienced' },
      { range: '6-8', level: 'experienced' },
    ],
    services: ['play', 'meal', 'sleep', 'safety'],
    nightAvailable: true,
    availability: [
      { day: 'Mon', slots: ['18:00-22:00'] },
      { day: 'Tue', slots: ['18:00-22:00'] },
      { day: 'Thu', slots: ['18:00-23:00'] },
      { day: 'Fri', slots: ['17:00-23:00'] },
      { day: 'Sat', slots: ['16:00-23:00'] },
    ],
    stats: { responseRate: 98, acceptRate: 94, cancelRate: 2, rebookRate: 45 },
    verifications: { backgroundCheck: true, cpr: true, reference: true, videoIntro: false },
    reviews: [
      { parentName: 'Sarah M.', rating: 5, comment: 'Yuna was absolutely wonderful with our 4-year-old. She arrived on time and had creative activities prepared. Our daughter didn\'t want her to leave!', commentKo: '유나 씨가 4살 딸아이를 정말 잘 돌봐줬어요. 시간도 정확했고 놀이도 준비해왔어요.', date: '2026-03-01' },
      { parentName: 'Kenji T.', rating: 5, comment: 'Perfect experience. Yuna spoke Japanese fluently which made our kids feel comfortable right away. Professional and warm.', commentKo: '완벽한 경험이었어요. 일본어도 잘해서 아이들이 바로 편안해했어요.', date: '2026-02-22' },
      { parentName: 'Emily R.', rating: 5, comment: 'Second time booking Yuna. She remembered our son\'s favorite games. Truly caring sitter.', commentKo: '두 번째 예약이에요. 아들이 좋아하는 놀이도 기억하고 있었어요.', date: '2026-02-15' },
      { parentName: 'David L.', rating: 4, comment: 'Great sitter overall. Kids loved her. Would definitely book again.', commentKo: '전반적으로 훌륭한 시터에요. 아이들이 좋아했어요.', date: '2026-02-08' },
    ],
  },
  'sitter-002': {
    ...demoSitters[1],
    ageGroup: '20s',
    introVideo: false,
    languageLevels: [
      { lang: 'English', level: 'L3' },
      { lang: 'Korean', level: 'L3' },
    ],
    experienceYears: 3,
    ageExperience: [
      { range: '0-2', level: 'none' },
      { range: '3-5', level: 'experienced' },
      { range: '6-8', level: 'basic' },
    ],
    services: ['play', 'meal', 'safety'],
    nightAvailable: false,
    availability: [
      { day: 'Mon', slots: ['18:00-21:00'] },
      { day: 'Wed', slots: ['18:00-22:00'] },
      { day: 'Fri', slots: ['18:00-22:00'] },
      { day: 'Sat', slots: ['17:00-22:00'] },
    ],
    stats: { responseRate: 95, acceptRate: 88, cancelRate: 4, rebookRate: 38 },
    verifications: { backgroundCheck: true, cpr: false, reference: true, videoIntro: false },
    reviews: [
      { parentName: 'Amy K.', rating: 5, comment: 'Minji did amazing arts & crafts with our kids. They were so proud of what they made!', commentKo: '민지 씨가 미술 놀이를 정말 잘 해줬어요. 아이들이 만든 작품을 자랑했어요.', date: '2026-02-28' },
      { parentName: 'Tom W.', rating: 5, comment: 'Very responsible and punctual. Our 5-year-old had a great time.', commentKo: '책임감 있고 시간도 잘 지켜요. 5살 아이가 즐거워했어요.', date: '2026-02-18' },
      { parentName: 'Lisa P.', rating: 4, comment: 'Good experience. Minji was patient and kind with our shy daughter.', commentKo: '좋은 경험이었어요. 낯가리는 딸에게 인내심 있게 대해줬어요.', date: '2026-02-05' },
    ],
  },
  'sitter-003': {
    ...demoSitters[2],
    ageGroup: '30s',
    introVideo: true,
    languageLevels: [
      { lang: 'Japanese', level: 'L3' },
      { lang: 'English', level: 'L2' },
      { lang: 'Korean', level: 'L1' },
    ],
    experienceYears: 7,
    ageExperience: [
      { range: '0-2', level: 'experienced' },
      { range: '3-5', level: 'experienced' },
      { range: '6-8', level: 'experienced' },
    ],
    services: ['play', 'meal', 'sleep', 'safety'],
    nightAvailable: true,
    availability: [
      { day: 'Mon', slots: ['18:00-23:00'] },
      { day: 'Tue', slots: ['18:00-23:00'] },
      { day: 'Wed', slots: ['18:00-23:00'] },
      { day: 'Thu', slots: ['18:00-23:00'] },
      { day: 'Fri', slots: ['17:00-23:00'] },
      { day: 'Sat', slots: ['16:00-23:00'] },
      { day: 'Sun', slots: ['16:00-22:00'] },
    ],
    stats: { responseRate: 100, acceptRate: 96, cancelRate: 0, rebookRate: 52 },
    verifications: { backgroundCheck: true, cpr: true, reference: true, videoIntro: true },
    reviews: [
      { parentName: 'Yuki S.', rating: 5, comment: 'Saki-san is the best! Our children adored her. As a Japanese family, having a native speaker was invaluable.', commentKo: '사키 씨가 최고에요! 일본어 원어민이라 아이들이 편안해했어요.', date: '2026-03-05' },
      { parentName: 'Robert H.', rating: 5, comment: 'Incredibly professional. Saki had everything organized and our kids were asleep on schedule.', commentKo: '정말 전문적이에요. 모든 게 체계적이고 아이들도 제시간에 잠들었어요.', date: '2026-02-25' },
      { parentName: 'Mika A.', rating: 5, comment: 'Third time booking. Saki is part of our Seoul travel routine now. Calm, reliable, wonderful.', commentKo: '세 번째 예약이에요. 서울 여행 때 꼭 찾게 되는 시터에요.', date: '2026-02-12' },
    ],
  },
  'sitter-004': {
    ...demoSitters[3],
    ageGroup: '20s',
    introVideo: false,
    languageLevels: [
      { lang: 'English', level: 'L2' },
      { lang: 'Korean', level: 'L3' },
      { lang: 'Chinese', level: 'L2' },
    ],
    experienceYears: 2,
    ageExperience: [
      { range: '0-2', level: 'none' },
      { range: '3-5', level: 'experienced' },
      { range: '6-8', level: 'basic' },
    ],
    services: ['play', 'meal', 'safety'],
    nightAvailable: false,
    availability: [
      { day: 'Tue', slots: ['18:00-21:00'] },
      { day: 'Thu', slots: ['18:00-21:00'] },
      { day: 'Sat', slots: ['17:00-22:00'] },
    ],
    stats: { responseRate: 90, acceptRate: 82, cancelRate: 6, rebookRate: 28 },
    verifications: { backgroundCheck: true, cpr: true, reference: false, videoIntro: false },
    reviews: [
      { parentName: 'Wei C.', rating: 5, comment: 'Haeun was great with our shy 4-year-old. Speaking Chinese really helped.', commentKo: '하은 씨가 낯가리는 4살 아이를 잘 다뤄줬어요.', date: '2026-02-20' },
      { parentName: 'Jane F.', rating: 4, comment: 'Kind and patient. Good experience for our family.', commentKo: '친절하고 인내심 있었어요. 좋은 경험이었습니다.', date: '2026-02-10' },
    ],
  },
  'sitter-005': {
    ...demoSitters[4],
    ageGroup: '20s',
    introVideo: false,
    languageLevels: [
      { lang: 'English', level: 'L2' },
      { lang: 'Korean', level: 'L3' },
    ],
    experienceYears: 1,
    ageExperience: [
      { range: '0-2', level: 'none' },
      { range: '3-5', level: 'basic' },
      { range: '6-8', level: 'experienced' },
    ],
    services: ['play', 'safety'],
    nightAvailable: false,
    availability: [
      { day: 'Mon', slots: ['18:00-21:00'] },
      { day: 'Wed', slots: ['18:00-21:00'] },
      { day: 'Sat', slots: ['16:00-22:00'] },
      { day: 'Sun', slots: ['16:00-21:00'] },
    ],
    stats: { responseRate: 88, acceptRate: 78, cancelRate: 8, rebookRate: 22 },
    verifications: { backgroundCheck: true, cpr: false, reference: false, videoIntro: false },
    reviews: [
      { parentName: 'Mark J.', rating: 5, comment: 'Jiwon brought so much energy! Our 7-year-old had a blast playing together.', commentKo: '지원 씨가 에너지 넘쳤어요! 7살 아이가 정말 즐거워했어요.', date: '2026-02-15' },
      { parentName: 'Karen B.', rating: 4, comment: 'Fun and creative sitter. Great with older kids.', commentKo: '재미있고 창의적인 시터에요. 큰 아이랑 잘 맞아요.', date: '2026-01-28' },
    ],
  },
  'sitter-006': {
    ...demoSitters[5],
    ageGroup: '20s',
    introVideo: true,
    languageLevels: [
      { lang: 'Chinese', level: 'L3' },
      { lang: 'English', level: 'L3' },
      { lang: 'Korean', level: 'L2' },
    ],
    experienceYears: 4,
    ageExperience: [
      { range: '0-2', level: 'basic' },
      { range: '3-5', level: 'experienced' },
      { range: '6-8', level: 'experienced' },
    ],
    services: ['play', 'meal', 'sleep', 'safety'],
    nightAvailable: true,
    availability: [
      { day: 'Mon', slots: ['18:00-23:00'] },
      { day: 'Wed', slots: ['18:00-23:00'] },
      { day: 'Fri', slots: ['17:00-23:00'] },
      { day: 'Sat', slots: ['16:00-23:00'] },
      { day: 'Sun', slots: ['16:00-22:00'] },
    ],
    stats: { responseRate: 97, acceptRate: 92, cancelRate: 1, rebookRate: 48 },
    verifications: { backgroundCheck: true, cpr: true, reference: true, videoIntro: true },
    reviews: [
      { parentName: 'Lin W.', rating: 5, comment: 'Mei Lin was perfect for our Mandarin-speaking family. Hotel experience really shows.', commentKo: '메이린 씨가 중국어 가족에게 딱이에요. 호텔 경력이 느껴졌어요.', date: '2026-03-02' },
      { parentName: 'James P.', rating: 5, comment: 'Outstanding professionalism. Kids were happy and safe the whole evening.', commentKo: '전문성이 뛰어나요. 아이들이 저녁 내내 행복하고 안전했어요.', date: '2026-02-22' },
      { parentName: 'Hui Z.', rating: 5, comment: 'Booked twice during our Seoul trip. Mei Lin is reliable and warm.', commentKo: '서울 여행 중 두 번 예약했어요. 신뢰가 가고 따뜻해요.', date: '2026-02-14' },
      { parentName: 'Rachel G.', rating: 4, comment: 'Very good experience. Mei Lin handled bedtime routine beautifully.', commentKo: '매우 좋은 경험이에요. 수면 루틴도 잘 해줬어요.', date: '2026-02-02' },
    ],
  },
  'sitter-007': {
    ...demoSitters[6],
    ageGroup: '30s',
    introVideo: false,
    languageLevels: [
      { lang: 'Korean', level: 'L3' },
      { lang: 'English', level: 'L2' },
      { lang: 'Japanese', level: 'L2' },
    ],
    experienceYears: 6,
    ageExperience: [
      { range: '0-2', level: 'experienced' },
      { range: '3-5', level: 'experienced' },
      { range: '6-8', level: 'basic' },
    ],
    services: ['play', 'meal', 'sleep', 'safety'],
    nightAvailable: true,
    availability: [
      { day: 'Tue', slots: ['18:00-23:00'] },
      { day: 'Wed', slots: ['18:00-23:00'] },
      { day: 'Thu', slots: ['18:00-23:00'] },
      { day: 'Sat', slots: ['16:00-23:00'] },
    ],
    stats: { responseRate: 96, acceptRate: 91, cancelRate: 3, rebookRate: 42 },
    verifications: { backgroundCheck: true, cpr: true, reference: true, videoIntro: false },
    reviews: [
      { parentName: 'Naomi K.', rating: 5, comment: 'Sooyeon\'s kindergarten background really shows. Our 3-year-old fell asleep perfectly.', commentKo: '수연 씨의 유치원 경력이 느껴져요. 3살 아이가 잘 잠들었어요.', date: '2026-03-03' },
      { parentName: 'Chris D.', rating: 5, comment: 'Best bedtime routine ever. Both kids were asleep within 20 minutes.', commentKo: '수면 루틴이 최고에요. 두 아이 모두 20분 만에 잠들었어요.', date: '2026-02-20' },
      { parentName: 'Yuko M.', rating: 4, comment: 'Very experienced sitter. Calm and reassuring presence.', commentKo: '경험 많은 시터에요. 차분하고 안심이 되었어요.', date: '2026-02-08' },
    ],
  },
  'sitter-008': {
    ...demoSitters[7],
    ageGroup: '20s',
    introVideo: false,
    languageLevels: [
      { lang: 'Japanese', level: 'L3' },
      { lang: 'English', level: 'L2' },
    ],
    experienceYears: 1,
    ageExperience: [
      { range: '0-2', level: 'none' },
      { range: '3-5', level: 'basic' },
      { range: '6-8', level: 'basic' },
    ],
    services: ['play', 'safety'],
    nightAvailable: false,
    availability: [
      { day: 'Fri', slots: ['18:00-21:00'] },
      { day: 'Sat', slots: ['16:00-22:00'] },
      { day: 'Sun', slots: ['16:00-21:00'] },
    ],
    stats: { responseRate: 85, acceptRate: 75, cancelRate: 10, rebookRate: 18 },
    verifications: { backgroundCheck: true, cpr: false, reference: false, videoIntro: false },
    reviews: [
      { parentName: 'Takeshi N.', rating: 5, comment: 'Emma was so creative with storytelling. Our daughter loved it!', commentKo: '에마 씨가 동화를 정말 재미있게 들려줬어요. 딸이 좋아했어요.', date: '2026-02-18' },
      { parentName: 'Sandra L.', rating: 4, comment: 'Friendly and fun. Great first experience with Petit Stay.', commentKo: '친절하고 재미있었어요. Petit Stay 첫 이용인데 좋았어요.', date: '2026-02-05' },
    ],
  },
};
