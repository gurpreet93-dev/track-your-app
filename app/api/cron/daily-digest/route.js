import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import gplay from 'google-play-scraper';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

async function analyzeReview(reviewText, rating) {
  if (process.env.PAUSE_AI_ANALYSIS === 'true') {
    return {
      sentiment: 'neutral',
      urgency: 'low',
      category: 'other',
      summary: 'AI analysis temporarily paused'
    };
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an app review analyst. Respond ONLY with valid JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "urgency": "critical" | "high" | "medium" | "low",
  "category": "bug" | "crash" | "feature_request" | "ux_issue" | "praise" | "other",
  "summary": "one short sentence"
}`
      },
      { role: 'user', content: `Rating: ${rating} stars\nReview: "${reviewText}"` }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const urgencyColors = {
  critical: { bg: '#FCEBEB', border: '#E24B4A', text: '#791F1F', label: '#A32D2D' },
  high:     { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', label: '#854F0B' },
  medium:   { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', label: '#854F0B' },
  low:      { bg: '#EAF3DE', border: '#97C459', text: '#173404', label: '#27500A' }
};

function buildAppSection(app, reviews) {
  const total = reviews.length;
  const actionItems = reviews.filter(r => ['critical', 'high', 'medium'].includes(r.urgency));
  const positive = reviews.filter(r => r.sentiment === 'positive').length;

  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length
  }));
  const maxStarCount = Math.max(...starCounts.map(s => s.count), 1);

  const starRowsHtml = starCounts.map(s => {
    const filledBlocks = Math.round((s.count / maxStarCount) * 10);
    const blocksHtml = Array.from({ length: 10 }, (_, i) => {
      const filled = i < filledBlocks;
      return `<td width="10" height="10" bgcolor="${filled ? '#EF9F27' : '#F1EFE8'}" style="background-color:${filled ? '#EF9F27' : '#F1EFE8'};font-size:0;line-height:0;border-radius:2px;">&nbsp;</td><td width="2" style="font-size:0;line-height:0;">&nbsp;</td>`;
    }).join('');
    return `<tr><td style="font-size:12px;color:#5F5E5A;width:48px;padding:6px 0;white-space:nowrap;">${s.star}&nbsp;stars</td><td style="padding:6px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${blocksHtml}</tr></table></td><td style="font-size:12px;font-weight:600;color:#2C2C2A;width:20px;text-align:right;padding:6px 0;">${s.count}</td></tr>`;
  }).join('');

  const actionItemsHtml = actionItems.length === 0
    ? `<p style="font-size:13px;color:#5F5E5A;margin:0;">No high-priority issues today.</p>`
    : actionItems.map(r => {
        const colors = urgencyColors[r.urgency] || urgencyColors.medium;
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr><td style="background-color:${colors.bg};border-left:3px solid ${colors.border};border-radius:0 8px 8px 0;padding:10px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:11px;font-weight:600;color:${colors.label};text-transform:uppercase;">${r.urgency.toUpperCase()} · ${r.category?.replace('_', ' ')}</td><td style="font-size:12px;color:${colors.text};text-align:right;">${r.rating}★ — ${escapeHtml(r.author)}</td></tr></table><p style="font-size:13px;font-weight:600;color:${colors.text};margin:6px 0 0;">${escapeHtml(r.summary)}</p></td></tr></table>`;
      }).join('');

  return `
    <tr><td style="padding:24px 28px 0;">
      <h2 style="font-size:16px;font-weight:600;color:#2C2C2A;margin:0 0 14px;border-bottom:1px solid #E5E3DB;padding-bottom:10px;">${escapeHtml(app.app_name)}</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
        <td style="background-color:#F1EFE8;border-radius:8px;padding:10px;width:33%;text-align:center;"><div style="font-size:18px;font-weight:600;color:#2C2C2A;">${total}</div><div style="font-size:10px;color:#888780;margin-top:2px;">Analysed</div></td>
        <td style="width:8px;"></td>
        <td style="background-color:#FCEBEB;border-radius:8px;padding:10px;width:33%;text-align:center;"><div style="font-size:18px;font-weight:600;color:#A32D2D;">${actionItems.length}</div><div style="font-size:10px;color:#A32D2D;margin-top:2px;">High priority</div></td>
        <td style="width:8px;"></td>
        <td style="background-color:#EAF3DE;border-radius:8px;padding:10px;width:33%;text-align:center;"><div style="font-size:18px;font-weight:600;color:#27500A;">${positive}</div><div style="font-size:10px;color:#27500A;margin-top:2px;">Positive</div></td>
      </tr></table>
      <p style="font-size:11px;font-weight:600;color:#888780;text-transform:uppercase;margin:0 0 8px;">Rating breakdown</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">${starRowsHtml}</table>
      <p style="font-size:11px;font-weight:600;color:#888780;text-transform:uppercase;margin:0 0 8px;">Key action points</p>
      ${actionItemsHtml}
      <div style="text-align:center;margin-top:14px;">
        <a href="https://track-your-app.vercel.app/dashboard/${app.id}" style="display:inline-block;background-color:#FFFFFF;border:1px solid #D85A30;color:#D85A30;font-size:12px;font-weight:600;text-decoration:none;padding:8px 18px;border-radius:8px;">View ${escapeHtml(app.app_name)} dashboard</a>
      </div>
    </td></tr>
  `;
}

function buildEmailHtml({ recipientName, appSections }) {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background-color:#F1EFE8;padding:24px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 28px 0;">
          <p style="font-size:11px;font-weight:600;color:#888780;text-transform:uppercase;margin:0 0 6px;">Track Your App</p>
          <h1 style="font-size:19px;font-weight:600;color:#2C2C2A;margin:0 0 4px;">Your daily review digest</h1>
          <p style="font-size:13px;color:#5F5E5A;margin:0;">Hi ${escapeHtml(recipientName)} — here's what's new across your ${appSections.length} tracked app${appSections.length === 1 ? '' : 's'}.</p>
        </td></tr>
        ${appSections.map(s => s.html).join('')}
        <tr><td style="background-color:#F1EFE8;padding:16px 28px;text-align:center;margin-top:24px;">
          <p style="font-size:11px;color:#888780;margin:0;">You're receiving this because you're tracking apps on Track Your App.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </div>`;
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, email, apps(id, app_name, package_name)')
    .eq('active', true);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: 'No active subscriptions found.' });
  }

  // Step 1: scrape + analyze each unique app once
  const uniqueApps = new Map();
  subscriptions.forEach(sub => {
    if (sub.apps && !uniqueApps.has(sub.apps.id)) {
      uniqueApps.set(sub.apps.id, sub.apps);
    }
  });

  const appScrapeResults = [];

  for (const [appId, app] of uniqueApps) {
    try {
      const scraped = await gplay.reviews({ appId: app.package_name, sort: gplay.sort.NEWEST, num: 10 });

      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('review_text')
        .eq('app_id', appId);
      const existingTexts = new Set((existingReviews || []).map(r => r.review_text));

      const newReviews = scraped.data.filter(r => !existingTexts.has(r.text));

      for (const review of newReviews) {
        const analysis = await analyzeReview(review.text, review.score);
        await supabase.from('reviews').insert({
          app_id: appId,
          author: review.userName,
          rating: review.score,
          review_text: review.text,
          review_date: review.date,
          sentiment: analysis.sentiment,
          urgency: analysis.urgency,
          category: analysis.category,
          summary: analysis.summary,
          processed: true
        });
      }

      const { data: allReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      appScrapeResults.push({ appId, app, newReviewsCount: newReviews.length, allReviews: allReviews || [] });
    } catch (err) {
      appScrapeResults.push({ appId, app, error: err.message, allReviews: [] });
    }
  }

  // Step 2: group subscriptions by user, build one email per user
  const userMap = new Map();
  subscriptions.forEach(sub => {
    if (!sub.apps) return;
    if (!userMap.has(sub.email)) {
      userMap.set(sub.email, []);
    }
    userMap.get(sub.email).push(sub.apps.id);
  });

  const results = [];

  for (const [email, appIds] of userMap) {
    const appSections = appIds.map(appId => {
      const result = appScrapeResults.find(r => r.appId === appId);
      if (!result) return null;
      return { appId, html: buildAppSection(result.app, result.allReviews) };
    }).filter(Boolean);

    if (appSections.length === 0) continue;

    const html = buildEmailHtml({ recipientName: 'there', appSections });

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `Your daily digest — ${appSections.length} app${appSections.length === 1 ? '' : 's'} tracked`,
      html
    });

    results.push({ email, appsIncluded: appSections.length });
  }

  return NextResponse.json({ success: true, results });
}