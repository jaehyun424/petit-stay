import { InfoLayout } from './InfoLayout';

export default function HelpCenterPage() {
  return (
    <InfoLayout title="Help Center" subtitle="Frequently asked questions and support.">
      <h2>Frequently Asked Questions</h2>
      <div className="info-faq">
        <details>
          <summary>How does Petit Stay work?</summary>
          <p>
            Hotels partner with Petit Stay to offer on-demand childcare. Guests can book
            through the hotel concierge or our app. A vetted specialist arrives at the hotel,
            checks in via QR code, and parents can monitor the session in real time.
          </p>
        </details>
        <details>
          <summary>Are the childcare specialists vetted?</summary>
          <p>
            Yes. Every specialist undergoes a comprehensive background check, holds valid
            first-aid and CPR certifications, and completes our hospitality training program
            before accepting any bookings.
          </p>
        </details>
        <details>
          <summary>What ages do you support?</summary>
          <p>
            We support children from 6 months to 12 years of age. Specialists are matched
            based on the children's ages and any special requirements noted during booking.
          </p>
        </details>
        <details>
          <summary>Is there insurance coverage?</summary>
          <p>
            Every booking includes comprehensive liability insurance covering both the child
            and the specialist for the duration of the session.
          </p>
        </details>
        <details>
          <summary>Can I cancel a booking?</summary>
          <p>
            Free cancellation is available up to 2 hours before the scheduled start time.
            Late cancellations may incur a fee depending on the hotel partner's policy.
          </p>
        </details>
        <details>
          <summary>What languages are supported?</summary>
          <p>
            The platform is available in English, Korean, Japanese, and Chinese. Specialists
            are matched based on language preferences whenever possible.
          </p>
        </details>
      </div>

      <h2>Contact Support</h2>
      <p>
        Could not find what you were looking for? Reach out to our support team at{' '}
        <a href="mailto:support@petitstay.com">support@petitstay.com</a> or use the
        in-app chat feature. We are available 24/7 during active sessions.
      </p>
    </InfoLayout>
  );
}
