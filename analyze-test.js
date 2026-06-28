import gplay from 'google-play-scraper';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const result = await gplay.reviews({
    appId: 'com.wishabi.flipp',
    sort: gplay.sort.NEWEST,
    num: 5
  });

  for (const review of result.data) {
    const analysis = await analyzeReview(review.text, review.score);

    console.log(`\n"${review.text.slice(0, 80)}..."`);
    console.log(`Rating: ${review.score}★`);
    console.log('AI Analysis:', analysis);
    console.log('---');
  }
}

run();