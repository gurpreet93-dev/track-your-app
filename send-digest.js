import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// CHANGE THESE for testing
const TEST_RECIPIENT = 'gsgurpreet1993@gmail.com';
const RECIPIENT_NAME = 'Gurpreet';

const urgencyColors = {
  critical: { bg: '#FCEBEB', border: '#613838', text: '#791F1F', label: '#A32D2D' },
  high:     { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', label: '#854F0B' },
  medium:   { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', label: '#854F0B' },
  low:      { bg: '#EAF3DE', border: '#97C459', text: '#173404', label: '#27500A' }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildEmailHtml({ recipientName, appName, reviews }) {
  const total = reviews.length;
  const actionItems = reviews.filter(r => r.urgency === 'critical' || r.urgency === 'high' || r.urgency === 'medium');
  const positive = reviews.filter(r => r.sentiment === 'positive').length;

  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));
  const maxStarCount = Math.max(...starCounts.map(s => s.count), 1);

  const starRowsHtml = starCounts.map(s => {
    const filledBlocks = Math.round((s.count / maxStarCount) * 10);
    const blocksHtml = Array.from({ length: 10 }, (_, i) => {
      const filled = i < filledBlocks;
      return `<td width="10" height="10" bgcolor="${filled ? '#EF9F27' : '#F1EFE8'}" style="background-color:${filled ? '#EF9F27' : '#F1EFE8'};font-size:0;line-height:0;border-radius:2px;">&nbsp;</td><td width="2" style="font-size:0;line-height:0;">&nbsp;</td>`;
    }).join('');

    return `
    <tr>
      <td style="font-size:12px;color:#5F5E5A;width:48px;padding:6px 0;white-space:nowrap;">${s.star}&nbsp;stars</td>
      <td style="padding:6px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${blocksHtml}</tr></table>
      </td>
      <td style="font-size:12px;font-weight:600;color:#2C2C2A;width:20px;text-align:right;padding:6px 0;white-space:nowrap;">${s.count}</td>
    </tr>
  `;
  }).join('');

  const actionItemsHtml = actionItems.length === 0
    ? `<p style="font-size:13px;color:#5F5E5A;">No high-priority issues today — nice and quiet.</p>`
    : actionItems.map(r => {
        const colors = urgencyColors[r.urgency] || urgencyColors.medium;
        return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr>
            <td style="background-color:${colors.bg};border-left:3px solid ${colors.border};border-radius:0 8px 8px 0;padding:12px 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;font-weight:600;color:${colors.label};text-transform:uppercase;letter-spacing:0.03em;">
                    ${r.urgency.toUpperCase()} · ${r.category ? r.category.replace('_', ' ') : 'issue'}
                  </td>
                  <td style="font-size:12px;color:${colors.text};text-align:right;">
                    ${r.rating}★ — ${escapeHtml(r.author || 'Anonymous')}
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;font-weight:600;color:${colors.text};margin:8px 0 0;">
                ${escapeHtml(r.summary || 'No summary available')}
              </p>
            </td>
          </tr>
        </table>
        `;
      }).join('');

  const DASHBOARD_URL = 'https://track-your-app.vercel.app/dashboard';

  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background-color:#F1EFE8;padding:24px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="font-size:11px;font-weight:600;color:#888780;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 6px;">Track Your App</p>
                <h1 style="font-size:19px;font-weight:600;color:#2C2C2A;margin:0 0 4px;">Your daily dose of ${escapeHtml(appName)} reviews</h1>
                <p style="font-size:13px;color:#5F5E5A;margin:0 0 20px;">Hi ${escapeHtml(recipientName)} — here's your daily summary.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="background-color:#F1EFE8;border-radius:8px;padding:12px;width:33%;text-align:center;">
                      <div style="font-size:22px;font-weight:600;color:#2C2C2A;">${total}</div>
                      <div style="font-size:10px;color:#888780;margin-top:2px;">Analysed</div>
                    </td>
                    <td style="width:8px;"></td>
                    <td style="background-color:#FCEBEB;border-radius:8px;padding:12px;width:33%;text-align:center;">
                      <div style="font-size:22px;font-weight:600;color:#A32D2D;">${actionItems.length}</div>
                      <div style="font-size:10px;color:#A32D2D;margin-top:2px;">High priority</div>
                    </td>
                    <td style="width:8px;"></td>
                    <td style="background-color:#EAF3DE;border-radius:8px;padding:12px;width:33%;text-align:center;">
                      <div style="font-size:22px;font-weight:600;color:#27500A;">${positive}</div>
                      <div style="font-size:10px;color:#27500A;margin-top:2px;">Positive</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px;">
                <p style="font-size:11px;font-weight:600;color:#888780;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 10px;">Rating breakdown</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  ${starRowsHtml}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px;">
                <p style="font-size:11px;font-weight:600;color:#888780;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 10px;">Key action points</p>
                ${actionItemsHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 28px;text-align:center;">
                <a href="${DASHBOARD_URL}" style="display:inline-block;background-color:#D85A30;color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">View full details on dashboard</a>
                <p style="font-size:11px;color:#888780;margin:10px 0 0;">See the full review text, filter by sentiment, and track trends over time.</p>
              </td>
            </tr>

            <tr>
              <td style="background-color:#F1EFE8;padding:16px 28px;text-align:center;">
                <p style="font-size:11px;color:#888780;margin:0;">You're receiving this because you subscribed to ${escapeHtml(appName)} updates on Track Your App.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

async function run() {
  const { data: app } = await supabase
    .from('apps')
    .select('id, app_name')
    .eq('package_name', 'com.wishabi.flipp')
    .single();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('app_id', app.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return;
  }

  console.log(`Found ${reviews.length} reviews for ${app.app_name}`);

  const html = buildEmailHtml({
    recipientName: RECIPIENT_NAME,
    appName: app.app_name,
    reviews
  });

  const { data, error: sendError } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: TEST_RECIPIENT,
    subject: `Your daily dose of ${app.app_name} reviews`,
    html
  });

  if (sendError) {
    console.error('Failed to send email:', sendError);
  } else {
    console.log('Email sent successfully! ID:', data.id);
  }
}

run();