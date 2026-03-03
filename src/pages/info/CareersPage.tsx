import { InfoLayout } from './InfoLayout';

export default function CareersPage() {
  return (
    <InfoLayout title="Careers" subtitle="Help us redefine family hospitality.">
      <h2>Why Petit Stay</h2>
      <p>
        We are building the trust infrastructure for in-hotel childcare across Asia-Pacific.
        If you care about safety, hospitality, and making family travel better, we would
        love to hear from you.
      </p>

      <h2>Open Positions</h2>
      <div className="info-card-grid">
        <div className="info-card">
          <span className="info-tag">Engineering</span>
          <h3>Senior Frontend Engineer</h3>
          <p>React, TypeScript, real-time systems. Remote (Asia-Pacific timezone).</p>
        </div>
        <div className="info-card">
          <span className="info-tag">Operations</span>
          <h3>Hotel Partnerships Manager — Tokyo</h3>
          <p>Build and manage relationships with luxury hotel partners in Japan.</p>
        </div>
        <div className="info-card">
          <span className="info-tag">Operations</span>
          <h3>Specialist Onboarding Lead — Seoul</h3>
          <p>Recruit, vet, and train childcare specialists for the Korean market.</p>
        </div>
        <div className="info-card">
          <span className="info-tag">Design</span>
          <h3>Product Designer</h3>
          <p>Design trust-centered experiences for parents, sitters, and hotel staff.</p>
        </div>
      </div>

      <h2>How to Apply</h2>
      <p>
        Send your resume and a brief note about why you are interested to{' '}
        <a href="mailto:careers@petitstay.com">careers@petitstay.com</a>. We review
        every application and aim to respond within five business days.
      </p>
    </InfoLayout>
  );
}
