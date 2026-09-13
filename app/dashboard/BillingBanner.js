'use client';

import { useState } from 'react';

async function goTo(endpoint, setLoading, setError) {
  setError('');
  setLoading(true);

  const res = await fetch(endpoint, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) {
    setLoading(false);
    setError(data.error || 'Something went wrong.');
    return;
  }

  window.location.href = data.url;
}

export default function BillingBanner({ status, daysLeft, priceDisplay }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'active') {
    return (
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-6 text-sm">
        <span className="text-gray-500">Subscription active — thanks for supporting Track Your App.</span>
        <button
          onClick={() => goTo('/api/stripe/portal', setLoading, setError)}
          disabled={loading}
          className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Manage billing'}
        </button>
      </div>
    );
  }

  const expired = status !== 'trialing';

  return (
    <div className={`rounded-2xl px-4 py-4 mb-6 border shadow-sm ${expired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {expired ? (
            <p className="text-sm font-medium text-red-800">Your free trial has ended.</p>
          ) : (
            <p className="text-sm font-medium text-amber-800">
              {daysLeft} day{daysLeft === 1 ? '' : 's'} left on your free trial.
            </p>
          )}
          <p className="text-xs text-gray-600 mt-0.5">
            {expired
              ? `Subscribe for ${priceDisplay} to keep tracking apps and receiving digests.`
              : `After your trial, it's ${priceDisplay} to keep going.`}
          </p>
        </div>
        <button
          onClick={() => goTo('/api/stripe/checkout', setLoading, setError)}
          disabled={loading}
          className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-sm shadow-orange-200 transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Loading...' : 'Upgrade now'}
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
