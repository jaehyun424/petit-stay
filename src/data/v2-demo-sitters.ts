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
