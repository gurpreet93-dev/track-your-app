import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase-server';

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

export default async function AppDetail({ params }) {
  const { appId } = await params;
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto">

        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">← Back to dashboard</a>

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{app.app_name}</h1>
        <p className="text-gray-500 text-sm mb-8">{app.package_name}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-semibold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500 mt-1">Reviews analysed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-red-700">{actionItems.length}</div>
            <div className="text-xs text-red-600 mt-1">High priority</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-green-700">{positive.length}</div>
            <div className="text-xs text-green-600 mt-1">Positive</div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Rating breakdown</h2>
          <div className="space-y-2">
            {starCounts.map(s => (
              <div key={s.star} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-14">{s.star} stars</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(s.count / maxStarCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend chart - simple CSS bar chart, no external library needed */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
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

        {/* Working well / Needs attention split */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Working well</h3>
            {positive.length === 0 ? (
              <p className="text-sm text-green-700">No standout positive feedback yet.</p>
            ) : (
              <ul className="space-y-1">
                {positive.slice(0, 3).map(r => (
                  <li key={r.id} className="text-sm text-green-800">— {r.summary}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Needs attention</h3>
            {negative.length === 0 ? (
              <p className="text-sm text-red-700">No negative feedback right now.</p>
            ) : (
              <ul className="space-y-1">
                {negative.slice(0, 3).map(r => (
                  <li key={r.id} className="text-sm text-red-800">— {r.summary}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Action items */}
        {actionItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Key action points</h2>
            <div className="space-y-2">
              {actionItems.map(r => (
                <div key={r.id} className={`border-l-4 rounded-r-lg p-3 ${urgencyStyles[r.urgency] || urgencyStyles.medium}`}>
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
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">All reviews</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {allReviews.map(r => (
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
                  </div>
                  <p className="text-sm text-gray-700">{r.review_text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}