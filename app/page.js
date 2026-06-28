import HomepageForm from './HomepageForm';
import { AlertTriangle, Mail, TrendingUp, LayoutGrid } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      <nav className="flex justify-between items-center px-6 py-4 max-w-5xl mx-auto">
        <span className="font-semibold text-gray-900">Track Your App</span>
        <a href="/login" className="text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors">
          Log in
        </a>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            See what your users are really saying
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Paste your app's Google Play link and we'll show you what a daily review digest looks like — no signup needed yet.
          </p>
          <HomepageForm />
          <p className="text-sm text-gray-500 mt-4">Free to start · Takes about 30 seconds</p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">How it works</h2>
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {[
                { n: '1', title: 'Paste your link', body: 'Drop in your Play Store app URL, nothing else needed' },
                { n: '2', title: 'We scan reviews', body: 'Our agent pulls your latest reviews automatically' },
                { n: '3', title: 'AI flags issues', body: 'Each review gets sentiment, urgency, and a summary' },
                { n: '4', title: 'You get notified', body: 'Sign in to save it and get a digest every morning' }
              ].map(step => (
                <div key={step.n} className="text-center">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center justify-center mx-auto mb-3">
                    {step.n}
                  </div>
                  <h3 className="text-gray-900 text-sm font-medium mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Critical bugs surface first', body: 'No more scrolling through hundreds of reviews to find the ones that matter.', Icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
              { title: 'One email, every morning', body: 'A short digest with only what changed and what needs attention.', Icon: Mail, bg: 'bg-blue-100', color: 'text-blue-600' },
              { title: 'Track sentiment over time', body: 'See whether things are getting better or worse, not just a snapshot.', Icon: TrendingUp, bg: 'bg-green-100', color: 'text-green-600' },
              { title: 'Track multiple apps', body: 'One dashboard for every app you own or manage.', Icon: LayoutGrid, bg: 'bg-purple-100', color: 'text-purple-600' }
            ].map(feat => (
              <div key={feat.title} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className={`w-9 h-9 rounded-lg ${feat.bg} flex items-center justify-center mb-3`}>
                  <feat.Icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="text-gray-900 text-sm font-medium mb-2">{feat.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">
            {[
              { q: 'Do I need to install anything on my app?', a: 'No. We read public reviews from the Play Store listing — nothing to install or configure.' },
              { q: "Does this work for apps I don't own?", a: 'Yes — reviews are public. Track competitor apps too, to see what their users complain about.' },
              { q: 'Is it free?', a: 'Yes, tracking apps and receiving daily digests is free to get started.' }
            ].map(faq => (
              <div key={faq.q} className="p-5">
                <h3 className="text-gray-900 text-sm font-medium mb-1">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-gray-400 text-xs border-t border-gray-100">
        Track Your App
      </footer>
    </main>
  );
}