// Demo review data for V2 landing page testimonials

export interface DemoReview {
  id: string;
  parentName: string;
  parentNameKo: string;
  country: string;
  countryKo: string;
  rating: number;
  quote: string;
  quoteKo: string;
  initials: string;
  childAge: string;
  childAgeKo: string;
}

export const demoReviews: DemoReview[] = [
  {
    id: 'review-001',
    parentName: 'Sarah & James',
    parentNameKo: 'Sarah & James',
    country: 'San Francisco, USA',
    countryKo: '미국 샌프란시스코',
    rating: 5,
    quote: 'Emily absolutely loved Yuna. We were nervous about leaving her with someone new in a foreign country, but the verified profile and video intro made all the difference. We got real-time updates during dinner — best night out in Seoul!',
    quoteKo: '에밀리가 유나 선생님을 정말 좋아했어요. 낯선 나라에서 아이를 맡기는 게 걱정됐는데, 검증된 프로필과 영상 소개가 정말 큰 도움이 됐어요. 저녁 식사 중에 실시간으로 소식을 받을 수 있었고, 서울에서 최고의 저녁이었어요!',
    initials: 'SJ',
    childAge: 'Daughter, 5',
    childAgeKo: '딸, 5세',
  },
  {
    id: 'review-002',
    parentName: 'Kenji & Akiko',
    parentNameKo: 'Kenji & Akiko',
    country: 'Tokyo, Japan',
    countryKo: '일본 도쿄',
    rating: 5,
    quote: 'Saki spoke Japanese with our son, which made him so comfortable. The session report afterwards was detailed and thoughtful. We rebooked her for the next evening immediately.',
    quoteKo: '사키 선생님이 아들에게 일본어로 대화해줘서 아이가 정말 편안해했어요. 세션 리포트도 세심하고 꼼꼼했어요. 바로 다음 날 저녁도 예약했어요.',
    initials: 'KA',
    childAge: 'Son, 4',
    childAgeKo: '아들, 4세',
  },
  {
    id: 'review-003',
    parentName: 'David & Rachel',
    parentNameKo: 'David & Rachel',
    country: 'London, UK',
    countryKo: '영국 런던',
    rating: 5,
    quote: "We didn't know this kind of service existed in Seoul. Found it through our hotel's QR code. The whole process took maybe 3 minutes. Both kids were happy and asleep by the time we got back.",
    quoteKo: '서울에 이런 서비스가 있는 줄 몰랐어요. 호텔 QR 코드로 알게 됐는데, 전체 과정이 3분도 안 걸렸어요. 돌아왔을 때 두 아이 모두 행복하게 잠들어 있었어요.',
    initials: 'DR',
    childAge: 'Son 6, Daughter 4',
    childAgeKo: '아들 6세, 딸 4세',
  },
];
