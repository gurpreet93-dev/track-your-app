import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase-server';
import { ArrowLeft, MessageSquare, AlertTriangle, ThumbsUp, Reply } from 'lucide-react';
import ReviewFilters from './ReviewFilters';
import Pagination from './Pagination';

const REVIEWS_PAGE_SIZE = 10;

function getDateRange(datePreset, from, to) {
  const now = new Date();

  if (datePreset === 'custom') {
    if (!from) return null;
    const fromDate = new Date(from);
    const toDate = to ? new Date(to) : now;
    return { from: fromDate, to: toDate };
  }

  const fromDate = new Date(now);
  if (datePreset === 'last_month') fromDate.setMonth(fromDate.getMonth() - 1);
  else if (datePreset === 'last_6_months') fromDate.setMonth(fromDate.getMonth() - 6);
  else if (datePreset === 'last_year') fromDate.setFullYear(fromDate.getFullYear() - 1);
  else return null;

  return { from: fromDate, to: now };
}

const urgencyStyles = {
  critical: 'bg-red-50 border-red-500 text-red-700',
  high: 'bg-orange-50 border-orange-500 text-orange-700',
  medium: 'bg-amber-50 border-amber-500 text-amber-700',
  low: 'bg-green-50 border-green-500 text-green-700'
};

const sentimentDot = {
  positive: 'bg-green-500',
  neutral: 'bg-gray-400',
  negative: 'bg-red-500'
};

const categoryLabels = {
  bug: 'Bugs',
  crash: 'Crashes',
  feature_request: 'Feature Requests',
  ux_issue: 'UX Issues',
  praise: 'Praise',
  other: 'Other'
};

// Groups reviews by their AI-assigned category into "themes" with a count
// and one representative quote, sorted by how common each theme is.
function groupThemes(reviewsList) {
  const groups = new Map();
  for (const r of reviewsList) {
    const key = r.category || 'other';
    if (!groups.has(key)) {
      groups.set(key, { category: key, count: 0, example: r.summary || r.review_text });
    }
    groups.get(key).count += 1;
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

export default async function AppDetail({ params, searchParams }) {
  const { appId } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Confirm this user is actually subscribed to this app (security check)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, apps(id, app_name, package_name)')
    .eq('user_id', user.id)
    .eq('app_id', appId)
    .single();

  if (!subscription) {
    redirect('/dashboard');
  }

  const app = subscription.apps;

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false });

  const allReviews = reviews || [];
  const total = allReviews.length;
  const positive = allReviews.filter(r => r.sentiment === 'positive');
  const negative = allReviews.filter(r => r.sentiment === 'negative');
  const actionItems = allReviews.filter(r => ['critical', 'high', 'medium'].includes(r.urgency));
  const repliedCount = allReviews.filter(r => r.replied).length;
  const responseRate = total > 0 ? Math.round((repliedCount / total) * 100) : null;
  const unrepliedNegative = negative.filter(r => !r.replied);
  const complaintThemes = groupThemes(negative);
  const loveThemes = groupThemes(positive);

  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter(r => r.rating === star).length
  }));
  const maxStarCount = Math.max(...starCounts.map(s => s.count), 1);

  // Simple trend: group reviews by day for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const trendData = last30Days.map(date => {
    const dayReviews = allReviews.filter(r => r.created_at && r.created_at.startsWith(date));
    return {
      date,
      positive: dayReviews.filter(r => r.sentiment === 'positive').length,
      negative: dayReviews.filter(r => r.sentiment === 'negative').length
    };
  });

  const maxTrendValue = Math.max(...trendData.map(d => Math.max(d.positive, d.negative)), 1);

  // Filtered + paginated query for the "All reviews" list — kept separate from
  // the aggregates above so stats always reflect the whole app, not the filter.
  const datePreset = sp.date || 'all';
  const ratingFilter = sp.rating || '';
  const searchQuery = sp.q || '';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  let reviewsQuery = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('app_id', appId);

  if (ratingFilter) {
    reviewsQuery = reviewsQuery.eq('rating', Number(ratingFilter));
  }

  const dateRange = getDateRange(datePreset, sp.from, sp.to);
  if (dateRange) {
    reviewsQuery = reviewsQuery
      .gte('review_date', dateRange.from.toISOString())
      .lte('review_date', dateRange.to.toISOString());
  }

  if (searchQuery) {
    reviewsQuery = reviewsQuery.ilike('review_text', `%${searchQuery}%`);
  }

  const pageStart = (page - 1) * REVIEWS_PAGE_SIZE;
  const { data: pagedReviewsData, count: filteredCount } = await reviewsQuery
    .order('created_at', { ascending: false })
    .range(pageStart, pageStart + REVIEWS_PAGE_SIZE - 1);

  const pagedReviews = pagedReviewsData || [];
  const totalFiltered = filteredCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / REVIEWS_PAGE_SIZE));

  return (
    <div className="max-w-3xl mx-auto">

        <div className="sticky top-16 z-10 bg-white/90 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-3 mb-5 border-b border-gray-100">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{app.app_name}</h1>
          <p className="text-gray-500 text-sm">{app.package_name}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Reviews analysed</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{actionItems.length}</div>
              <div className="text-xs text-gray-500">High priority</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{positive.length}</div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Reply className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{responseRate === null ? '—' : `${responseRate}%`}</div>
              <div className="text-xs text-gray-500">Response rate</div>
            </div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Rating breakdown</h2>
          <div className="space-y-2">
            {starCounts.map(s => (
              <div key={s.star} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-14">{s.star} stars</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${(s.count / maxStarCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend chart - simple CSS bar chart, no external library needed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Sentiment trend (last 30 days)</h2>
          <div className="flex items-end gap-[2px] h-24">
            {trendData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-[1px]" title={d.date}>
                <div
                  className="w-full bg-green-400 rounded-t-sm"
                  style={{ height: `${(d.positive / maxTrendValue) * 100}%`, minHeight: d.positive > 0 ? '2px' : '0' }}
                ></div>
                <div
                  className="w-full bg-red-400 rounded-b-sm"
                  style={{ height: `${(d.negative / maxTrendValue) * 100}%`, minHeight: d.negative > 0 ? '2px' : '0' }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> Positive</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full inline-block"></span> Negative</span>
          </div>
        </div>

        {/* Complaint themes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-semibold text-gray-900">Complaint themes</h2>
          </div>

          {negative.length === 0 ? (
            <p className="text-sm text-gray-500">No negative feedback right now.</p>
          ) : (
            <>
              {unrepliedNegative.length > 0 && (
                <p className="text-xs text-gray-500 mb-4">
                  {unrepliedNegative.length} of {negative.length} negative review{negative.length === 1 ? '' : 's'} still {unrepliedNegative.length === 1 ? "hasn't" : "haven't"} been replied to on the Play Store.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {complaintThemes.map(theme => (
                  <div key={theme.category} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-medium text-gray-900">{categoryLabels[theme.category] || 'Other'}</h3>
                      <span className="text-xs font-semibold text-red-600 bg-red-50 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {theme.count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2">&ldquo;{theme.example}&rdquo;</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">Your most common complaints, grouped automatically by category.</p>
            </>
          )}
        </div>

        {/* What users love */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-900">What users love</h2>
          </div>

          {positive.length === 0 ? (
            <p className="text-sm text-gray-500">No standout positive feedback yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loveThemes.map(theme => (
                  <div key={theme.category} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-medium text-gray-900">{categoryLabels[theme.category] || 'Other'}</h3>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {theme.count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2">&ldquo;{theme.example}&rdquo;</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">What users praise most — your strengths to lean into.</p>
            </>
          )}
        </div>

        {/* Action items */}
        {actionItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Key action points</h2>
            <div className="space-y-2">
              {actionItems.map(r => (
                <div key={r.id} className={`border-l-4 rounded-r-xl p-3 ${urgencyStyles[r.urgency] || urgencyStyles.medium}`}>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wide mb-1">
                    <span>{r.urgency} · {r.category?.replace('_', ' ')}</span>
                    <span>{r.rating}★ — {r.author}</span>
                  </div>
                  <p className="text-sm font-medium">{r.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All reviews */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            All reviews {totalFiltered > 0 && <span className="normal-case font-normal text-gray-400">({totalFiltered})</span>}
          </h2>

          <ReviewFilters />

          {pagedReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">No reviews match these filters.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {pagedReviews.map(r => (
              <div key={r.id} className="p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                  {r.author ? r.author.slice(0, 2).toUpperCase() : '??'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span className="font-medium text-gray-900">{r.author}</span>
                    <span>· {r.rating}★</span>
                    <span className={`w-2 h-2 rounded-full ${sentimentDot[r.sentiment] || 'bg-gray-300'}`}></span>
                    <span className="capitalize">{r.sentiment}</span>
                    {r.replied && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Replied</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{r.review_text}</p>
                  {r.replied && r.reply_text && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                      <span className="font-medium text-gray-600">Developer reply: </span>
                      {r.reply_text}
                    </p>
                  )}
                </div>
              </div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} />
            </>
          )}
        </div>

    </div>
  );
}