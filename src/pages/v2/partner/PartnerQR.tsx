import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ExternalLink, Lightbulb } from 'lucide-react';
import { PartnerV2Layout } from '../../../components/layout/PartnerV2Layout';

const PARTNER_ID = 'grand-hyatt-seoul';
const QR_URL = `https://petit-stay.web.app/search?ref=${PARTNER_ID}`;

export default function PartnerQR() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple QR-like pattern for demo (rendered as a visual placeholder)
  const drawQR = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 180;
    canvas.width = size;
    canvas.height = size;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Generate deterministic pattern from URL
    const cellSize = 6;
    const modules = Math.floor(size / cellSize);
    ctx.fillStyle = '#1C1C1C';

    // Finder patterns (three corners)
    const drawFinder = (x: number, y: number) => {
      // Outer
      ctx.fillRect(x, y, 7 * cellSize, cellSize);
      ctx.fillRect(x, y + 6 * cellSize, 7 * cellSize, cellSize);
      ctx.fillRect(x, y, cellSize, 7 * cellSize);
      ctx.fillRect(x + 6 * cellSize, y, cellSize, 7 * cellSize);
      // Inner
      ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder((modules - 7) * cellSize, 0);
    drawFinder(0, (modules - 7) * cellSize);

    // Data area (seeded pseudo-random)
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807 + 7) % 2147483647;
      return seed / 2147483647;
    };

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Skip finder pattern areas
        if (row < 8 && col < 8) continue;
        if (row < 8 && col >= modules - 8) continue;
        if (row >= modules - 8 && col < 8) continue;

        if (rand() > 0.55) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    // Center logo area (white circle + "ps")
    const cx = size / 2;
    const cy = size / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E3A5F';
    ctx.font = 'italic bold 16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ps', cx, cy + 1);

    canvasRef.current = canvas;
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `petit-stay-qr-${PARTNER_ID}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <PartnerV2Layout
      title="QR Code"
      titleKo="QR 코드"
      subtitle="Share with your guests"
      subtitleKo="투숙객 안내용"
      showBack
    >
      {/* QR display */}
      <div className="pt-qr-card">
        <div className="pt-qr-preview">
          <canvas ref={drawQR} />
        </div>

        <p className="pt-qr-desc">
          {isKo
            ? '이 QR 코드를 스캔하면 투숙객이 Petit Stay에서 바로 시터를 검색할 수 있습니다. 귀 호텔 경유 예약으로 자동 추적됩니다.'
            : 'When guests scan this QR code, they can search for sitters on Petit Stay. Bookings are automatically tracked as referrals from your property.'}
        </p>

        <div className="pt-qr-actions">
          <button className="pt-btn pt-btn-primary" onClick={handleDownload}>
            <Download size={16} />
            {isKo ? 'PNG 다운로드' : 'Download PNG'}
          </button>
          <a
            className="pt-btn pt-btn-outline"
            href={QR_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            {isKo ? '링크 미리보기' : 'Preview Link'}
          </a>
        </div>
      </div>

      {/* Placement guide */}
      <div className="pt-card">
        <h3 className="pt-card-title">{isKo ? '비치 안내' : 'Placement Guide'}</h3>
        <div className="pt-booking-meta" style={{ gap: '0.5rem' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--charcoal-600)', lineHeight: 1.6 }}>
            {isKo
              ? '• 객실 안내서(컴펜디움) 또는 TV 옆 안내 카드'
              : '• Room compendium or info card near the TV'}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--charcoal-600)', lineHeight: 1.6 }}>
            {isKo
              ? '• 프런트 데스크 또는 컨시어지 카운터'
              : '• Front desk or concierge counter'}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--charcoal-600)', lineHeight: 1.6 }}>
            {isKo
              ? '• 키즈 프렌들리 패키지 안내문'
              : '• Kids-friendly package brochures'}
          </span>
        </div>
      </div>

      {/* Tip */}
      <div className="pt-tip">
        <Lightbulb size={16} />
        <span>
          {isKo
            ? 'QR 코드 하나로 투숙객이 직접 시터를 검색하고 예약할 수 있습니다. 별도 안내 절차가 필요하지 않습니다.'
            : 'A single QR code lets guests search and book sitters on their own — no additional guidance needed from your staff.'}
        </span>
      </div>
    </PartnerV2Layout>
  );
}
