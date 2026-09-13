'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
      <input
        type="text"
        placeholder="play.google.com/store/apps/details?id=..."
        value={storeUrl}
        onChange={(e) => setStoreUrl(e.target.value)}
        required
        className="bg-white border border-gray-200 shadow-sm rounded-full px-5 py-3.5 w-full sm:w-96 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <button
        type="submit"
        className="group bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-medium px-6 py-3.5 rounded-full shadow-sm shadow-orange-200 transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5"
      >
        Analyse my app
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      {error && <p className="text-red-500 text-sm sm:absolute sm:mt-16">{error}</p>}
    </form>
  );
}
