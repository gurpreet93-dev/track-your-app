import LegalPage from '../LegalPage';
import { SITE_NAME, SUPPORT_EMAIL } from '../../lib/site';
import { PRICE_DISPLAY } from '../../lib/billing';

export const metadata = { title: `Refund & Cancellation — ${SITE_NAME}` };

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund & Cancellation" updated="September 2026">
      <h2>Free trial</h2>
      <p>
        Every account starts with a 30-day free trial — no card required, and nothing is charged
        during this period.
      </p>

      <h2>Cancelling</h2>
      <p>
        You can cancel your subscription at any time from the &quot;Manage billing&quot; link on your
        dashboard, which opens Stripe&apos;s billing portal. Cancelling stops future billing
        immediately; you keep access until the end of the billing period you&apos;ve already paid for.
      </p>

      <h2>Refunds</h2>
      <p>
        Because {SITE_NAME}{' '}is billed monthly at {PRICE_DISPLAY}{' '}with a full 30-day free trial before
        any charge, we don&apos;t offer refunds for partial months or unused time. If you were charged
        in error — for example, a duplicate charge or a charge after you cancelled — contact us and
        we&apos;ll make it right.
      </p>

      <h2>Contact</h2>
      <p>
        For billing issues, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
        account email and we&apos;ll get back to you promptly.
      </p>
    </LegalPage>
  );
}
