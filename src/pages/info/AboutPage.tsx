import { InfoLayout } from './InfoLayout';

export default function AboutPage() {
  return (
    <InfoLayout title="About Petit Stay" subtitle="Premium in-hotel childcare, reimagined.">
      <h2>Our Mission</h2>
      <p>
        Petit Stay connects luxury hotels with vetted, certified childcare specialists —
        giving traveling families peace of mind and giving hotels a premium amenity that
        delights guests and drives loyalty.
      </p>

      <h2>How We Work</h2>
      <p>
        Hotels partner with Petit Stay to offer on-demand babysitting through our concierge
        platform. Guest families book through the hotel or directly via our app. Every
        specialist is background-checked, first-aid certified, and trained in hospitality
        service standards.
      </p>
      <ul>
        <li>Real-time session monitoring for parents</li>
        <li>QR-based secure check-in and handoff</li>
        <li>Multi-language support (English, Korean, Japanese, Chinese)</li>
        <li>Comprehensive liability coverage on every booking</li>
      </ul>

      <h2>Where We Operate</h2>
      <p>
        Petit Stay currently serves premium hotels across Asia-Pacific, with active
        operations in Tokyo, Seoul, and Singapore. We are expanding to additional
        markets throughout 2026.
      </p>

      <h2>Our Team</h2>
      <p>
        Founded by hospitality and childcare professionals, our team combines deep
        experience in luxury hotel operations, early childhood education, and technology
        platform design.
      </p>
    </InfoLayout>
  );
}
