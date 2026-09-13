'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase-client';

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError('');

    const res = await fetch('/api/account/delete', { method: 'POST' });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors"
      >
        Delete account
      </button>
    );
  }

  return (
    <div>
      <p className="text-sm text-red-700 font-medium mb-3">Are you sure? This can&apos;t be undone.</p>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Yes, delete everything'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
