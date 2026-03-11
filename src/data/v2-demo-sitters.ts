// Demo sitter data for V2 landing page
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
  },
];
