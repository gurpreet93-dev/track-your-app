'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu as MenuIcon, LayoutGrid, CreditCard, LogOut } from 'lucide-react';

export default function AccountMenu({ userEmail, billingStatus }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function manageSubscription() {
    setLoading(true);
    const endpoint = billingStatus === 'active' ? '/api/stripe/portal' : '/api/stripe/checkout';
    const res = await fetch(endpoint, { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <MenuIcon className="w-4 h-4 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-20">
          <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm text-gray-800 truncate">{userEmail}</p>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <LayoutGrid className="w-4 h-4 text-gray-400" />
            My applications
          </Link>

          <button
            onClick={manageSubscription}
            disabled={loading}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4 text-gray-400" />
            {loading ? 'Loading...' : 'Manage subscription'}
          </button>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <form action="/auth/signout" method="post">
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
