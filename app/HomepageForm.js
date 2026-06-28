'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function extractPackageName(input) {
  const match = input.match(/id=([a-zA-Z0-9._]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9._]+$/.test(input.trim())) return input.trim();
  return null;
}

export default function HomepageForm() {
  const [storeUrl, setStoreUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const packageName = extractPackageName(storeUrl);

    if (!packageName) {
      setError('That doesn\'t look like a valid Google Play app link. Try pasting the full URL.');
      return;
    }

    // Pass the link along so it's pre-filled after they log in
    router.push(`/signup?app=${encodeURIComponent(storeUrl)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
      <input
        type="text"
        placeholder="play.google.com/store/apps/details?id=..."
        value={storeUrl}
        onChange={(e) => setStoreUrl(e.target.value)}
        required
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 w-full sm:w-96 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
      >
        Analyse my app
      </button>
      {error && <p className="text-red-400 text-sm sm:absolute sm:mt-16">{error}</p>}
    </form>
  );
}