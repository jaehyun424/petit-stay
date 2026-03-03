import { InfoLayout } from './InfoLayout';

export default function PrivacyPage() {
  return (
    <InfoLayout title="Privacy Policy" subtitle="How we collect, use, and protect your data.">
      <p className="info-legal-date">Last updated: March 1, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly: name, email address, phone number,
        and payment details when you create an account or make a booking. We also collect
        information about children (age, special needs) to match appropriate specialists.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process and manage bookings between families, hotels, and specialists</li>
        <li>To verify specialist qualifications and background checks</li>
        <li>To send booking confirmations, session updates, and safety notifications</li>
        <li>To improve our services through aggregated, anonymized analytics</li>
        <li>To comply with legal obligations and resolve disputes</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>
        We share relevant booking details with hotel partners and assigned specialists to
        facilitate services. We do not sell personal information to third parties. We may
        share data with service providers who assist in platform operations (payment
        processing, cloud hosting, background check services).
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement industry-standard security measures including encryption in transit
        and at rest, access controls, and regular security audits. Session monitoring
        data is encrypted and retained only for the duration required by applicable law.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the right to access, correct, delete,
        or export your personal data. Contact us at{' '}
        <a href="mailto:privacy@petitstay.com">privacy@petitstay.com</a> to exercise
        these rights.
      </p>

      <h2>6. Cookies and Tracking</h2>
      <p>
        We use essential cookies to maintain sessions and preferences. Analytics cookies
        are used only with your consent and can be disabled in your browser settings.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be communicated
        via email or in-app notification at least 30 days before they take effect.
      </p>
    </InfoLayout>
  );
}
