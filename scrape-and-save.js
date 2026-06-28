import gplay from 'google-play-scraper';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const APP_PACKAGE_NAME = 'com.wishabi.flipp';

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
      {
        role: 'user',
        content: `Rating: ${rating} stars\nReview: "${reviewText}"`
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

async function run() {
  // Step A: find this app's row in our database
  const { data: app, error: appError } = await supabase
    .from('apps')
    .select('id')
    .eq('package_name', APP_PACKAGE_NAME)
    .single();

  if (appError || !app) {
    console.error('Could not find app in database:', appError);
    return;
  }

  console.log(`Found app in database, id: ${app.id}`);

  // Step B: scrape reviews
  const result = await gplay.reviews({
    appId: APP_PACKAGE_NAME,
    sort: gplay.sort.NEWEST,
    num: 5
  });

  console.log(`Scraped ${result.data.length} reviews. Analyzing and saving...\n`);

  // Step C: analyze + save each one
  for (const review of result.data) {
    const analysis = await analyzeReview(review.text, review.score);

    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        app_id: app.id,
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

    if (insertError) {
      console.error('Failed to save review:', insertError.message);
    } else {
      console.log(`Saved: "${review.text.slice(0, 50)}..." → ${analysis.urgency} / ${analysis.sentiment}`);
    }
  }

  console.log('\nDone!');
}

run();