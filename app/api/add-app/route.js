import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase-server';
import gplay from 'google-play-scraper';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractPackageName(input) {
  // Handles both a raw package name and a full Play Store URL
  const match = input.match(/id=([a-zA-Z0-9._]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9._]+$/.test(input.trim())) return input.trim();
  return null;
}

async function analyzeReview(reviewText, rating) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an app review analyst. Given a user review and star rating, classify it.
Respond ONLY with valid JSON in this exact format, no other text:
{
  "sentiment": "positive" | "neutral" | "negative",
  "urgency": "critical" | "high" | "medium" | "low",
  "category": "bug" | "crash" | "feature_request" | "ux_issue" | "praise" | "other",
  "summary": "one short sentence summarizing the issue or feedback"
}`
      },
      { role: 'user', content: `Rating: ${rating} stars\nReview: "${reviewText}"` }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { storeUrl } = await request.json();
  const packageName = extractPackageName(storeUrl);

  if (!packageName) {
    return NextResponse.json({ error: 'Could not find a valid app package name in that link.' }, { status: 400 });
  }

  // Look up app info from Play Store
  let appInfo;
  try {
    appInfo = await gplay.app({ appId: packageName });
  } catch {
    return NextResponse.json({ error: 'App not found on Google Play. Double check the link.' }, { status: 404 });
  }

  // Check if this app already exists in our database
  let { data: existingApp } = await supabase
    .from('apps')
    .select('id')
    .eq('package_name', packageName)
    .single();

  let appId;

  if (existingApp) {
    appId = existingApp.id;
  } else {
    const { data: newApp, error: insertError } = await supabase
      .from('apps')
      .insert({
        platform: 'android',
        package_name: packageName,
        app_name: appInfo.title,
        icon_url: appInfo.icon
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to add app to database.' }, { status: 500 });
    }
    appId = newApp.id;
  }

  // Check if user is already subscribed
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('app_id', appId)
    .single();

  if (existingSub) {
    return NextResponse.json({ error: 'You are already tracking this app.' }, { status: 409 });
  }

  // Create subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      email: user.email,
      app_id: appId,
      active: true
    });

  if (subError) {
    return NextResponse.json({ error: 'Failed to subscribe to app.' }, { status: 500 });
  }

  // If this is a brand new app, scrape + analyze a first batch so the dashboard isn't empty
  if (!existingApp) {
    try {
      const result = await gplay.reviews({ appId: packageName, sort: gplay.sort.NEWEST, num: 10 });

      for (const review of result.data) {
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
    } catch (e) {
      // Non-fatal: the app + subscription were still created successfully
      console.error('Initial scrape failed:', e);
    }
  }

  return NextResponse.json({ success: true, appId, appName: appInfo.title });
}