import HomepageForm from './HomepageForm';
import FaqAccordion from './FaqAccordion';
import Link from 'next/link';
import {
  AlertTriangle,
  Mail,
  TrendingUp,
  LayoutGrid,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Star
} from 'lucide-react';
import Logo from './Logo';
import { PRICE_DISPLAY } from '../lib/billing';
import { SITE_NAME } from '../lib/site';

const steps = [
  { n: '1', title: 'Paste your link', body: 'Drop in your Play Store app URL, nothing else needed' },
  { n: '2', title: 'We scan reviews', body: 'Our agent pulls your latest reviews automatically' },
  { n: '3', title: 'AI flags issues', body: 'Each review gets sentiment, urgency, and a summary' },
  { n: '4', title: 'You get notified', body: 'Sign in to save it and get a digest every morning' }
];

const features = [
  { title: 'Critical bugs surface first', body: 'No more scrolling through hundreds of reviews to find the ones that matter.', Icon: AlertTriangle },
  { title: 'One email, every morning', body: 'A short digest with only what changed and what needs attention.', Icon: Mail },
  { title: 'Track sentiment over time', body: 'See whether things are getting better or worse, not just a snapshot.', Icon: TrendingUp },
  { title: 'Track multiple apps', body: 'One dashboard for every app you own or manage.', Icon: LayoutGrid }
];

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it works', href: '#how-it-works' }
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Refund & Cancellation', href: '/refund-policy' },
    { label: 'Data Deletion', href: '/data-deletion' },
    { label: 'Contact', href: '/contact' }
  ]
};

const trustPills = [
  { label: 'No installation needed', Icon: ShieldCheck },
  { label: 'Setup in under a minute', Icon: Clock },
  { label: 'AI-analyzed, not just starred', Icon: Sparkles },
  { label: 'Free for your first month', Icon: Star }
];

const faqs = [
  { q: 'Do I need to install anything on my app?', a: 'No. We read public reviews from the Play Store listing — nothing to install or configure.' },
  { q: "Does this work for apps I don't own?", a: 'Yes — reviews are public. Track competitor apps too, to see what their users complain about.' },
  { q: 'Is it free?', a: `Your first month is completely free, no card required. After that it's ${PRICE_DISPLAY} to keep tracking apps and receiving digests.` }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">

      <nav className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 border-b border-gray-100">
        <div className="flex justify-between items-center px-6 py-4 max-w-5xl mx-auto">
          <Logo />
          <a
            href="/login"
            className="text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-5 py-2 rounded-full shadow-sm shadow-orange-200 transition-all"
          >
            Log in
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-1.5 text-xs font-medium text-orange-700 shadow-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            New — daily AI review digests, free for 30 days
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-gray-900 mb-5 leading-[1.1]">
            See what your users<br />
            are{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              really saying
            </span>
            .
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            Paste your app&apos;s Google Play link and we&apos;ll show you what a daily review digest looks like — no signup needed yet.
          </p>
          <HomepageForm />
          <p className="text-sm text-gray-500 mt-5">Free to start · Takes about 30 seconds</p>
        </div>
      </section>

      {/* Trust pills */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3">
          {trustPills.map(pill => (
            <div
              key={pill.label}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs font-medium text-gray-700 shadow-sm"
            >
              <pill.Icon className="w-3.5 h-3.5 text-orange-600" />
              {pill.label}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase text-center mb-3">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-12">From link to digest in minutes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {steps.map(step => (
              <div key={step.n} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white text-sm font-semibold flex items-center justify-center mx-auto mb-4">
                  {step.n}
                </div>
                <h3 className="text-gray-900 text-sm font-semibold mb-1.5">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* See what's inside - mock product preview */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase text-center mb-3">Take a look</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-12">See what&apos;s inside</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Mock: dashboard overview */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <span className="ml-3 text-xs text-gray-400 font-mono">app.trackyourapp.com/dashboard</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-semibold text-gray-900">4</div>
                    <div className="text-[10px] text-gray-500">Apps tracked</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <div className="text-lg font-semibold text-red-700">7</div>
                    <div className="text-[10px] text-red-600">Needs attention</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-semibold text-gray-900">312</div>
                    <div className="text-[10px] text-gray-500">Reviews tracked</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Daily Budget Tracker', reviews: 128, hp: 3 },
                    { name: 'QuickFit Timer', reviews: 96, hp: 1 }
                  ].map(app => (
                    <div key={app.name} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2.5">
                      <span className="text-sm font-medium text-gray-800">{app.name}</span>
                      <span className="text-xs text-gray-400">{app.reviews} reviews · {app.hp} high priority</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mock: app detail / sentiment */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <span className="ml-3 text-xs text-gray-400 font-mono">app.trackyourapp.com/dashboard/daily-budget-tracker</span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Rating breakdown</p>
                <div className="space-y-1.5 mb-4">
                  {[{ s: 5, w: 70 }, { s: 4, w: 45 }, { s: 3, w: 20 }, { s: 2, w: 10 }, { s: 1, w: 25 }].map(row => (
                    <div key={row.s} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-8">{row.s}★</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                    <span className="font-medium text-gray-900">Rohan K.</span>
                    <span>· 1★</span>
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Replied</span>
                  </div>
                  <p className="text-xs text-gray-600">App crashes every time I open the budget summary.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="px-6 py-16 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase text-center mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-12">Everything you need, nothing you don&apos;t</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(feat => (
              <div key={feat.title} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-4">
                  <feat.Icon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-gray-900 text-sm font-semibold mb-2">{feat.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 scroll-mt-20">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Simple pricing</h2>
          <p className="text-gray-600 mb-10">Free for your first month. No card required to start.</p>

          <div className="relative bg-white border border-orange-200 rounded-3xl shadow-lg shadow-orange-100 p-8 text-left">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
              30-day free trial
            </span>
            <div className="flex items-baseline gap-1 mb-6 mt-2">
              <span className="text-4xl font-semibold text-gray-900">{PRICE_DISPLAY}</span>
              <span className="text-gray-500 text-sm">after your trial ends</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Track unlimited apps',
                'Daily AI-analyzed review digest',
                'Sentiment & urgency scoring',
                'Cancel anytime'
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="group flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-4 py-3.5 rounded-full shadow-sm shadow-orange-200 transition-all"
            >
              Start your free month
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase text-center mb-3">Answered ahead of time</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-orange-100 via-orange-50 to-white border border-orange-200 rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">Stop guessing what users think.</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Connect your app in under a minute. Your first digest lands tomorrow morning.</p>
          <a
            href="/signup"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-6 py-3.5 rounded-full shadow-sm shadow-orange-200 transition-all"
          >
            Start your free month
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <p className="text-xs text-gray-500 mt-4">30-day free trial · No card required</p>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-2">
              <Logo size={22} />
              <p className="text-xs text-gray-500 mt-3 max-w-xs leading-relaxed">
                AI-analyzed Google Play review digests for app developers. Free for your first month.
              </p>
            </div>
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{heading}</p>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center text-gray-400 text-xs border-t border-gray-100 pt-6">
            © {new Date().getFullYear()} {SITE_NAME}
          </div>
        </div>
      </footer>
    </main>
  );
}
