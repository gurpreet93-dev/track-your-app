import LegalPage from '../LegalPage';
import { SITE_NAME, SUPPORT_EMAIL } from '../../lib/site';
import { PRICE_DISPLAY } from '../../lib/billing';

export const metadata = { title: `Terms & Conditions — ${SITE_NAME}` };

export default function Terms() {
  return (
    <LegalPage title="Terms & Conditions" updated="September 2026">
      <p>
        By creating an account or using {SITE_NAME}, you agree to these terms. If you don&apos;t
        agree, please don&apos;t use the service.
      </p>

      <h2>The service</h2>
      <p>
        {SITE_NAME}{' '}reads publicly available reviews from the Google Play Store for apps you choose
        to track, analyzes them with AI, and sends you a daily email digest. We don&apos;t require
        access to your Play Console or app source code.
      </p>

      <h2>Your account</h2>
      <p>
        You&apos;re responsible for keeping your login credentials secure and for all activity under
        your account. You must provide a valid email address to receive digests and billing notices.
      </p>

      <h2>Subscription and billing</h2>
      <ul>
        <li>New accounts get a 30-day free trial with full access — no card required to start.</li>
        <li>After the trial, continued access costs {PRICE_DISPLAY}, billed automatically via Stripe.</li>
        <li>You can cancel anytime from your dashboard&apos;s billing settings; access continues until the end of the current billing period.</li>
        <li>See our <a href="/refund-policy">Refund &amp; Cancellation policy</a> for details.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use {SITE_NAME}{' '}to scrape data at a rate that disrupts Google Play, to violate
        Google&apos;s terms of service, or for any unlawful purpose.
      </p>

      <h2>No warranty</h2>
      <p>
        {SITE_NAME}{' '}is provided &quot;as is&quot;. Review data, ratings, and AI-generated summaries
        may be delayed, incomplete, or occasionally inaccurate — we don&apos;t guarantee the
        completeness or accuracy of any analysis.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, {SITE_NAME}{' '}is not liable for indirect or consequential
        damages arising from your use of the service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms occasionally. Continued use of the service after a change means you
        accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
