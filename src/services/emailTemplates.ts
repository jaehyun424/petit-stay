// ============================================
// Petit Stay - Email Templates
// Multilingual email templates for notifications
// ============================================

import type { Language } from '../types';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ----------------------------------------
// Shared styles and layout
// ----------------------------------------
const brandColors = {
  charcoal: '#2C2C2C',
  cream: '#FAF8F5',
  gold: '#C9A96E',
  darkGold: '#B8944D',
  lightGray: '#E8E4E0',
};

function wrapInLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: ${brandColors.cream}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: ${brandColors.charcoal}; padding: 24px 32px; text-align: center; }
    .header h1 { color: ${brandColors.gold}; font-size: 24px; margin: 0; font-style: italic; letter-spacing: 1px; }
    .body { padding: 32px; color: ${brandColors.charcoal}; line-height: 1.6; font-size: 15px; }
    .body h2 { font-size: 20px; margin: 0 0 16px 0; color: ${brandColors.charcoal}; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid ${brandColors.lightGray}; }
    .detail-label { font-weight: 600; min-width: 140px; color: ${brandColors.charcoal}; }
    .detail-value { color: #555; }
    .cta-button { display: inline-block; background-color: ${brandColors.gold}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: ${brandColors.cream}; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
    .divider { height: 1px; background-color: ${brandColors.lightGray}; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>petit stay</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 Petit Stay. All rights reserved.</p>
      <p>Premium Hotel Childcare Infrastructure</p>
    </div>
  </div>
</body>
</html>`;
}

// ----------------------------------------
// i18n content maps
// ----------------------------------------
interface BookingData {
  confirmationCode: string;
  hotelName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  childrenNames?: string[];
  total?: number;
  currency?: string;
}

interface SitterData {
  displayName: string;
  tier?: string;
  languages?: string[];
}

interface SessionData {
  confirmationCode?: string;
  hotelName?: string;
  sitterName?: string;
  startTime?: string;
  endTime?: string;
}

const i18n: Record<Language, {
  bookingConfirmation: {
    subject: string;
    greeting: string;
    intro: string;
    code: string;
    hotel: string;
    date: string;
    time: string;
    children: string;
    total: string;
    nextSteps: string;
    nextStepsBody: string;
  };
  sitterAssigned: {
    subject: string;
    greeting: string;
    intro: string;
    sitterName: string;
    tier: string;
    languages: string;
    prepared: string;
  };
  careStarted: {
    subject: string;
    greeting: string;
    intro: string;
    sitter: string;
    startTime: string;
    updates: string;
  };
  careCompleted: {
    subject: string;
    greeting: string;
    intro: string;
    endTime: string;
    review: string;
    reviewBody: string;
  };
  reviewRequest: {
    subject: string;
    greeting: string;
    intro: string;
    ctaLabel: string;
    thanks: string;
  };
}> = {
  en: {
    bookingConfirmation: {
      subject: 'Booking Confirmed — Petit Stay',
      greeting: 'Your booking is confirmed!',
      intro: 'Thank you for choosing Petit Stay. Here are your booking details:',
      code: 'Confirmation Code',
      hotel: 'Hotel',
      date: 'Date',
      time: 'Time',
      children: 'Children',
      total: 'Total',
      nextSteps: 'What happens next?',
      nextStepsBody: 'A certified childcare specialist will be assigned to your booking. You will receive a notification once your specialist is confirmed.',
    },
    sitterAssigned: {
      subject: 'Specialist Assigned — Petit Stay',
      greeting: 'Your specialist has been assigned!',
      intro: 'Great news! A childcare specialist has been assigned to your upcoming booking.',
      sitterName: 'Specialist',
      tier: 'Tier',
      languages: 'Languages',
      prepared: 'Your specialist is prepared and will arrive at your room on the scheduled date and time.',
    },
    careStarted: {
      subject: 'Care Session Started — Petit Stay',
      greeting: 'Care session has begun!',
      intro: 'Your child is now in the care of our specialist.',
      sitter: 'Specialist',
      startTime: 'Started at',
      updates: 'You will receive real-time updates through the Petit Stay app during the session.',
    },
    careCompleted: {
      subject: 'Care Session Completed — Petit Stay',
      greeting: 'Care session is complete!',
      intro: 'Your care session has been successfully completed.',
      endTime: 'Ended at',
      review: 'Share your feedback',
      reviewBody: 'We would love to hear about your experience. Please take a moment to review your specialist.',
    },
    reviewRequest: {
      subject: 'How was your experience? — Petit Stay',
      greeting: 'We value your feedback!',
      intro: 'Your recent care session has been completed. Please take a moment to share your experience.',
      ctaLabel: 'Leave a Review',
      thanks: 'Your feedback helps us maintain the highest standard of childcare service.',
    },
  },
  ko: {
    bookingConfirmation: {
      subject: '예약 확인 — Petit Stay',
      greeting: '예약이 확인되었습니다!',
      intro: 'Petit Stay를 선택해 주셔서 감사합니다. 예약 상세 정보를 확인해 주세요:',
      code: '확인 코드',
      hotel: '호텔',
      date: '날짜',
      time: '시간',
      children: '자녀',
      total: '합계',
      nextSteps: '다음 단계',
      nextStepsBody: '인증된 돌봄 전문가가 예약에 배정됩니다. 전문가가 확정되면 알림을 보내드립니다.',
    },
    sitterAssigned: {
      subject: '전문가 배정 완료 — Petit Stay',
      greeting: '전문가가 배정되었습니다!',
      intro: '좋은 소식입니다! 예약에 돌봄 전문가가 배정되었습니다.',
      sitterName: '전문가',
      tier: '등급',
      languages: '언어',
      prepared: '전문가가 준비를 마쳤으며, 예정된 날짜와 시간에 객실로 방문합니다.',
    },
    careStarted: {
      subject: '돌봄 세션 시작 — Petit Stay',
      greeting: '돌봄 세션이 시작되었습니다!',
      intro: '자녀가 전문가의 돌봄을 받고 있습니다.',
      sitter: '전문가',
      startTime: '시작 시간',
      updates: '세션 중 Petit Stay 앱을 통해 실시간 업데이트를 받으실 수 있습니다.',
    },
    careCompleted: {
      subject: '돌봄 세션 완료 — Petit Stay',
      greeting: '돌봄 세션이 완료되었습니다!',
      intro: '돌봄 세션이 성공적으로 완료되었습니다.',
      endTime: '종료 시간',
      review: '후기를 남겨주세요',
      reviewBody: '경험에 대한 의견을 듣고 싶습니다. 전문가에 대한 리뷰를 남겨주세요.',
    },
    reviewRequest: {
      subject: '경험은 어떠셨나요? — Petit Stay',
      greeting: '소중한 의견을 기다립니다!',
      intro: '최근 돌봄 세션이 완료되었습니다. 경험을 공유해 주세요.',
      ctaLabel: '리뷰 작성하기',
      thanks: '여러분의 피드백은 최고 수준의 돌봄 서비스를 유지하는 데 도움이 됩니다.',
    },
  },
  ja: {
    bookingConfirmation: {
      subject: '予約確認 — Petit Stay',
      greeting: 'ご予約が確認されました！',
      intro: 'Petit Stayをご利用いただきありがとうございます。予約の詳細をご確認ください：',
      code: '確認コード',
      hotel: 'ホテル',
      date: '日付',
      time: '時間',
      children: 'お子様',
      total: '合計',
      nextSteps: '次のステップ',
      nextStepsBody: '認定チャイルドケアスペシャリストがご予約に配属されます。スペシャリストが確定次第、通知いたします。',
    },
    sitterAssigned: {
      subject: 'スペシャリスト配属完了 — Petit Stay',
      greeting: 'スペシャリストが配属されました！',
      intro: 'お知らせです！ご予約にチャイルドケアスペシャリストが配属されました。',
      sitterName: 'スペシャリスト',
      tier: 'ティア',
      languages: '言語',
      prepared: 'スペシャリストは準備が整っており、予定の日時にお部屋にお伺いします。',
    },
    careStarted: {
      subject: 'ケアセッション開始 — Petit Stay',
      greeting: 'ケアセッションが始まりました！',
      intro: 'お子様は現在、スペシャリストのケアを受けています。',
      sitter: 'スペシャリスト',
      startTime: '開始時刻',
      updates: 'セッション中はPetit Stayアプリでリアルタイムの更新をご確認いただけます。',
    },
    careCompleted: {
      subject: 'ケアセッション完了 — Petit Stay',
      greeting: 'ケアセッションが完了しました！',
      intro: 'ケアセッションが正常に完了しました。',
      endTime: '終了時刻',
      review: 'フィードバックをお寄せください',
      reviewBody: 'ご利用体験についてお聞かせください。スペシャリストのレビューをお願いいたします。',
    },
    reviewRequest: {
      subject: 'ご利用はいかがでしたか？ — Petit Stay',
      greeting: 'ご意見をお待ちしております！',
      intro: '最近のケアセッションが完了しました。ご体験をお聞かせください。',
      ctaLabel: 'レビューを書く',
      thanks: 'お客様のフィードバックは、最高水準のチャイルドケアサービスの維持に役立ちます。',
    },
  },
  zh: {
    bookingConfirmation: {
      subject: '预约确认 — Petit Stay',
      greeting: '您的预约已确认！',
      intro: '感谢您选择Petit Stay。请查看您的预约详情：',
      code: '确认码',
      hotel: '酒店',
      date: '日期',
      time: '时间',
      children: '儿童',
      total: '总计',
      nextSteps: '下一步',
      nextStepsBody: '经认证的儿童看护专家将被分配到您的预约。专家确认后，我们将发送通知。',
    },
    sitterAssigned: {
      subject: '专家已分配 — Petit Stay',
      greeting: '您的专家已分配！',
      intro: '好消息！一位儿童看护专家已被分配到您即将到来的预约。',
      sitterName: '专家',
      tier: '等级',
      languages: '语言',
      prepared: '您的专家已做好准备，将在预定日期和时间到达您的房间。',
    },
    careStarted: {
      subject: '看护服务已开始 — Petit Stay',
      greeting: '看护服务已开始！',
      intro: '您的孩子目前正在我们专家的看护中。',
      sitter: '专家',
      startTime: '开始时间',
      updates: '在看护期间，您可以通过Petit Stay应用程序接收实时更新。',
    },
    careCompleted: {
      subject: '看护服务已完成 — Petit Stay',
      greeting: '看护服务已完成！',
      intro: '您的看护服务已成功完成。',
      endTime: '结束时间',
      review: '分享您的反馈',
      reviewBody: '我们很想听听您的体验。请花一点时间评价您的专家。',
    },
    reviewRequest: {
      subject: '您的体验如何？ — Petit Stay',
      greeting: '我们重视您的反馈！',
      intro: '您最近的看护服务已完成。请花一点时间分享您的体验。',
      ctaLabel: '撰写评价',
      thanks: '您的反馈帮助我们维持最高标准的儿童看护服务。',
    },
  },
};

// ----------------------------------------
// Template: Booking Confirmation
// ----------------------------------------
export function bookingConfirmation(booking: BookingData, locale: Language = 'en'): EmailTemplate {
  const t = i18n[locale].bookingConfirmation;
  const childrenList = booking.childrenNames?.join(', ') || '—';
  const totalFormatted = booking.total != null
    ? `${booking.currency || 'KRW'} ${booking.total.toLocaleString()}`
    : '—';

  const html = wrapInLayout(`
    <h2>${t.greeting}</h2>
    <p>${t.intro}</p>
    <div class="divider"></div>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:8px 0; font-weight:600;">${t.code}</td><td style="padding:8px 0;">${booking.confirmationCode}</td></tr>
      ${booking.hotelName ? `<tr><td style="padding:8px 0; font-weight:600;">${t.hotel}</td><td style="padding:8px 0;">${booking.hotelName}</td></tr>` : ''}
      ${booking.date ? `<tr><td style="padding:8px 0; font-weight:600;">${t.date}</td><td style="padding:8px 0;">${booking.date}</td></tr>` : ''}
      ${booking.startTime ? `<tr><td style="padding:8px 0; font-weight:600;">${t.time}</td><td style="padding:8px 0;">${booking.startTime} — ${booking.endTime || ''}</td></tr>` : ''}
      <tr><td style="padding:8px 0; font-weight:600;">${t.children}</td><td style="padding:8px 0;">${childrenList}</td></tr>
      <tr><td style="padding:8px 0; font-weight:600;">${t.total}</td><td style="padding:8px 0; font-weight:600; color:${brandColors.gold};">${totalFormatted}</td></tr>
    </table>
    <div class="divider"></div>
    <h2 style="font-size:16px;">${t.nextSteps}</h2>
    <p>${t.nextStepsBody}</p>
  `);

  const text = `${t.greeting}\n\n${t.intro}\n\n${t.code}: ${booking.confirmationCode}\n${t.hotel}: ${booking.hotelName || '—'}\n${t.date}: ${booking.date || '—'}\n${t.time}: ${booking.startTime || '—'} — ${booking.endTime || ''}\n${t.children}: ${childrenList}\n${t.total}: ${totalFormatted}\n\n${t.nextSteps}\n${t.nextStepsBody}`;

  return { subject: t.subject, html, text };
}

// ----------------------------------------
// Template: Sitter Assigned
// ----------------------------------------
export function sitterAssigned(_booking: BookingData, sitter: SitterData, locale: Language = 'en'): EmailTemplate {
  const t = i18n[locale].sitterAssigned;
  const tierDisplay = sitter.tier ? sitter.tier.charAt(0).toUpperCase() + sitter.tier.slice(1) : '—';
  const langsDisplay = sitter.languages?.join(', ') || '—';

  const html = wrapInLayout(`
    <h2>${t.greeting}</h2>
    <p>${t.intro}</p>
    <div class="divider"></div>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:8px 0; font-weight:600;">${t.sitterName}</td><td style="padding:8px 0;">${sitter.displayName}</td></tr>
      <tr><td style="padding:8px 0; font-weight:600;">${t.tier}</td><td style="padding:8px 0;">${tierDisplay}</td></tr>
      <tr><td style="padding:8px 0; font-weight:600;">${t.languages}</td><td style="padding:8px 0;">${langsDisplay}</td></tr>
    </table>
    <div class="divider"></div>
    <p>${t.prepared}</p>
  `);

  const text = `${t.greeting}\n\n${t.intro}\n\n${t.sitterName}: ${sitter.displayName}\n${t.tier}: ${tierDisplay}\n${t.languages}: ${langsDisplay}\n\n${t.prepared}`;

  return { subject: t.subject, html, text };
}

// ----------------------------------------
// Template: Care Started
// ----------------------------------------
export function careStarted(session: SessionData, locale: Language = 'en'): EmailTemplate {
  const t = i18n[locale].careStarted;

  const html = wrapInLayout(`
    <h2>${t.greeting}</h2>
    <p>${t.intro}</p>
    <div class="divider"></div>
    <table style="width:100%; border-collapse:collapse;">
      ${session.sitterName ? `<tr><td style="padding:8px 0; font-weight:600;">${t.sitter}</td><td style="padding:8px 0;">${session.sitterName}</td></tr>` : ''}
      ${session.startTime ? `<tr><td style="padding:8px 0; font-weight:600;">${t.startTime}</td><td style="padding:8px 0;">${session.startTime}</td></tr>` : ''}
    </table>
    <div class="divider"></div>
    <p>${t.updates}</p>
  `);

  const text = `${t.greeting}\n\n${t.intro}\n\n${t.sitter}: ${session.sitterName || '—'}\n${t.startTime}: ${session.startTime || '—'}\n\n${t.updates}`;

  return { subject: t.subject, html, text };
}

// ----------------------------------------
// Template: Care Completed
// ----------------------------------------
export function careCompleted(session: SessionData, locale: Language = 'en'): EmailTemplate {
  const t = i18n[locale].careCompleted;

  const html = wrapInLayout(`
    <h2>${t.greeting}</h2>
    <p>${t.intro}</p>
    <div class="divider"></div>
    <table style="width:100%; border-collapse:collapse;">
      ${session.endTime ? `<tr><td style="padding:8px 0; font-weight:600;">${t.endTime}</td><td style="padding:8px 0;">${session.endTime}</td></tr>` : ''}
    </table>
    <div class="divider"></div>
    <h2 style="font-size:16px;">${t.review}</h2>
    <p>${t.reviewBody}</p>
  `);

  const text = `${t.greeting}\n\n${t.intro}\n\n${t.endTime}: ${session.endTime || '—'}\n\n${t.review}\n${t.reviewBody}`;

  return { subject: t.subject, html, text };
}

// ----------------------------------------
// Template: Review Request
// ----------------------------------------
export function reviewRequest(booking: BookingData, locale: Language = 'en'): EmailTemplate {
  const t = i18n[locale].reviewRequest;
  const reviewUrl = `https://petit-stay.web.app/parent/bookings/${booking.confirmationCode}#review`;

  const html = wrapInLayout(`
    <h2>${t.greeting}</h2>
    <p>${t.intro}</p>
    <div class="divider"></div>
    <div style="text-align:center; padding: 16px 0;">
      <a href="${reviewUrl}" class="cta-button">${t.ctaLabel}</a>
    </div>
    <div class="divider"></div>
    <p>${t.thanks}</p>
  `);

  const text = `${t.greeting}\n\n${t.intro}\n\n${t.ctaLabel}: ${reviewUrl}\n\n${t.thanks}`;

  return { subject: t.subject, html, text };
}
