import LegalPage from '../LegalPage';
import { SITE_NAME, SUPPORT_EMAIL } from '../../lib/site';

export const metadata = { title: `Contact — ${SITE_NAME}` };

export default function Contact() {
  return (
    <LegalPage title="Contact us">
      <p>
        {SITE_NAME}{' '}is a small, independently run product. If you have a question, found a bug, or
        need help with billing, reach out directly:
      </p>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-lg font-medium">{SUPPORT_EMAIL}</a>
      </p>
      <p>We aim to reply within a couple of business days.</p>
    </LegalPage>
  );
}
