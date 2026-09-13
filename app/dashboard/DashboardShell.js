'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../Logo';
import { LayoutGrid, Settings, Menu, X } from 'lucide-react';
import UserMenu from './UserMenu';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings }
];

const pageLabels = {
  '/dashboard': 'Dashboard',
  '/dashboard/settings': 'Settings'
};

function PlanCard({ billing }) {
  const [loading, setLoading] = useState(false);

  async function goToBilling() {
    setLoading(true);
    const endpoint = billing.status === 'active' ? '/api/stripe/portal' : '/api/stripe/checkout';
    const res = await fetch(endpoint, { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  const expired = billing.status !== 'active' && billing.status !== 'trialing';

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {billing.status === 'active' ? 'Active plan' : expired ? 'Trial ended' : 'Free trial'}
      </p>
      <p className="text-xs text-gray-500 mb-3">
        {billing.status === 'active'
          ? 'Thanks for subscribing'
          : expired
            ? 'Subscribe to keep tracking apps'
            : `${billing.daysLeft} day${billing.daysLeft === 1 ? '' : 's'} left`}
      </p>
      <button
        onClick={goToBilling}
        disabled={loading}
        className="w-full text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-full py-2 transition-all disabled:opacity-50"
      >
        {loading ? 'Loading...' : billing.status === 'active' ? 'Manage plan' : 'Upgrade plan'}
      </button>
    </div>
  );
}

export default function DashboardShell({ userEmail, billing, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center justify-between">
        <Logo size={24} />
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <PlanCard billing={billing} />
      </div>
    </div>
  );

  const breadcrumb = pageLabels[pathname] || null;

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-orange-50/40 to-white">
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-gray-100 bg-white flex-shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-gray-100">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4 text-gray-600" />
              </button>
              {breadcrumb && (
                <span className="text-sm text-gray-500">
                  <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                  {breadcrumb !== 'Dashboard' && (
                    <>
                      <span className="mx-1.5 text-gray-300">/</span>
                      <span className="text-gray-800 font-medium">{breadcrumb}</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <UserMenu userEmail={userEmail} />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
