import LegalPage from '../LegalPage';
import { SITE_NAME, SUPPORT_EMAIL } from '../../lib/site';

export const metadata = { title: `Privacy Policy — ${SITE_NAME}` };

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        {SITE_NAME}{' '}(&quot;we&quot;, &quot;us&quot;) helps you monitor and understand reviews for
        apps listed on Google Play. This page explains what data we collect, why, and how it&apos;s used.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account info: your email address and authentication details, via Supabase Auth.</li>
        <li>Apps you add: the Play Store app links and package names you choose to track.</li>
        <li>Public review data: reviews, ratings, and author names as published on the Google Play Store listing for apps you track.</li>
        <li>Billing info: if you subscribe, Stripe processes and stores your payment details directly — we never see or store your card number.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To show you a dashboard of reviews for the apps you track.</li>
        <li>To generate an AI-written sentiment, urgency, and summary for each review (via OpenAI&apos;s API).</li>
        <li>To send you a daily email digest of new reviews (via Resend).</li>
        <li>To manage your subscription and free trial (via Stripe).</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We use a small number of service providers to run {SITE_NAME}: Supabase (database and
        authentication), OpenAI (review analysis), Resend (email delivery), and Stripe (payments).
        Each only receives the data it needs to perform its function. We do not sell your data.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your account and review data for as long as your account is active. You can request
        deletion of your account and associated data at any time by contacting us below.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or your data? Email us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
