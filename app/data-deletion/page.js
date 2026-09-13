import LegalPage from '../LegalPage';
import { SITE_NAME, SUPPORT_EMAIL } from '../../lib/site';

export const metadata = { title: `Data Deletion — ${SITE_NAME}` };

export default function DataDeletion() {
  return (
    <LegalPage title="Data Deletion" updated="September 2026">
      <p>
        You can permanently delete your {SITE_NAME}{' '}account and everything associated with it at any time.
      </p>

      <h2>Delete your account yourself</h2>
      <ul>
        <li>Log in to your dashboard</li>
        <li>Go to <strong>Settings</strong></li>
        <li>In the <strong>Danger zone</strong>, select <strong>Delete account</strong> and confirm</li>
      </ul>
      <p>
        This immediately cancels any active subscription, removes your tracked-app subscriptions, and
        permanently deletes your login and billing record. It cannot be undone. Public review data we
        cache for apps (yours or others&apos;) isn&apos;t personal data and isn&apos;t affected.
      </p>

      <h2>What we still keep</h2>
      <p>
        Stripe, our payment processor, retains payment and tax records independently of us as required
        by law, even after your {SITE_NAME}{' '}account is deleted. We don&apos;t control or store that
        data ourselves.
      </p>

      <h2>Need help?</h2>
      <p>
        Can&apos;t access your account, or want us to do it for you? Email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{' '}from the address on the account and
        we&apos;ll delete it for you.
      </p>
    </LegalPage>
  );
}
