'use client';

import { useState } from 'react';

export default function BillingActionButton({ status }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const endpoint = status === 'active' ? '/api/stripe/portal' : '/api/stripe/checkout';
    const res = await fetch(endpoint, { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-full px-5 py-2.5 transition-all disabled:opacity-50"
    >
      {loading ? 'Loading...' : status === 'active' ? 'Manage subscription' : 'Upgrade plan'}
    </button>
  );
}
