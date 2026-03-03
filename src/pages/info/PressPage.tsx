import { InfoLayout } from './InfoLayout';

export default function PressPage() {
  return (
    <InfoLayout title="Press" subtitle="News and media resources.">
      <h2>Recent News</h2>
      <div className="info-card-grid">
        <div className="info-card">
          <span className="info-tag">Launch</span>
          <h3>Petit Stay Launches in Singapore</h3>
          <p>Expanding premium in-hotel childcare to Southeast Asia with three flagship hotel partners.</p>
        </div>
        <div className="info-card">
          <span className="info-tag">Partnership</span>
          <h3>New Partnership with Luxury Hotel Group</h3>
          <p>Petit Stay partners with a leading luxury hotel group to bring childcare to 12 properties across Asia.</p>
        </div>
      </div>

      <h2>Media Kit</h2>
      <p>
        For logos, brand guidelines, and high-resolution images, please contact our
        communications team at{' '}
        <a href="mailto:press@petitstay.com">press@petitstay.com</a>.
      </p>

      <h2>Press Inquiries</h2>
      <p>
        Journalists and media professionals can reach us at{' '}
        <a href="mailto:press@petitstay.com">press@petitstay.com</a>.
        We aim to respond to all inquiries within 24 hours.
      </p>
    </InfoLayout>
  );
}
