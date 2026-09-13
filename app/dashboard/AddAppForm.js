'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddAppForm() {
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const pendingLink = sessionStorage.getItem('pendingAppLink');
    if (pendingLink) {
      sessionStorage.removeItem('pendingAppLink');
      setStoreUrl(pendingLink);
      submitLink(pendingLink);
    }
  }, []);

  async function submitLink(url) {
    setError('');
    setLoading(true);

    const res = await fetch('/api/add-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl: url })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    setStoreUrl('');
    router.refresh();
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitLink(storeUrl);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-8">
      <input
        type="text"
        placeholder="Paste a Google Play app link..."
        value={storeUrl}
        onChange={(e) => setStoreUrl(e.target.value)}
        required
        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm shadow-orange-200 transition-all disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? 'Adding app (analyzing reviews)...' : 'Track new app'}
      </button>
      {error && <p className="text-red-600 text-sm sm:ml-2 sm:self-center">{error}</p>}
    </form>
  );
}