import { InfoLayout } from './InfoLayout';

export default function TermsPage() {
  return (
    <InfoLayout title="Terms of Service" subtitle="The agreement between you and Petit Stay.">
      <p className="info-legal-date">Last updated: March 1, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Petit Stay platform, you agree to be bound by these
        Terms of Service. If you do not agree, please do not use our services.
      </p>

      <h2>2. Service Description</h2>
      <p>
        Petit Stay provides a technology platform connecting hotel partners with vetted
        childcare specialists on behalf of guest families. We facilitate bookings,
        payments, and real-time session monitoring. Petit Stay is not itself a childcare
        provider.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        You must provide accurate and complete information when creating an account. You
        are responsible for maintaining the security of your credentials and for all
        activity under your account.
      </p>

      <h2>4. Booking and Cancellation</h2>
      <ul>
        <li>Bookings are confirmed once a specialist accepts and the hotel approves</li>
        <li>Free cancellation is available up to 2 hours before the session</li>
        <li>Late cancellations may incur a fee as specified at booking time</li>
        <li>Petit Stay reserves the right to cancel bookings for safety reasons</li>
      </ul>

      <h2>5. Payments</h2>
      <p>
        Pricing is displayed at booking time and includes the specialist fee, platform fee,
        and applicable taxes. Payments are processed securely through our payment partners.
        Refunds are handled on a case-by-case basis.
      </p>

      <h2>6. Safety and Conduct</h2>
      <p>
        All users must maintain a safe and respectful environment. Specialists must follow
        Petit Stay's safety protocols and hospitality standards. Any violation may result
        in immediate suspension of the account.
      </p>

      <h2>7. Liability</h2>
      <p>
        Every session is covered by comprehensive liability insurance. Petit Stay's total
        liability for any claim shall not exceed the amount paid for the relevant booking.
        We are not liable for indirect, incidental, or consequential damages.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These terms are governed by the laws of Singapore. Any disputes shall be resolved
        through binding arbitration in Singapore, except where prohibited by applicable law.
      </p>

      <h2>9. Changes to Terms</h2>
      <p>
        We may modify these terms at any time. Continued use of the platform after changes
        constitutes acceptance. Material changes will be communicated at least 30 days in
        advance.
      </p>
    </InfoLayout>
  );
}
