'use client';

import { useState } from 'react';
import { createClient } from '../../../../lib/supabase-client';

export default function ProfileForm({ initial }) {
  const [fullName, setFullName] = useState(initial.fullName || '');
  const [companyName, setCompanyName] = useState(initial.companyName || '');
  const [businessAddress, setBusinessAddress] = useState(initial.businessAddress || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        company_name: companyName,
        business_address: businessAddress
      }
    });

    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Company / App name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your company or app name"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Business address</label>
        <textarea
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          rows={3}
          placeholder="Street, city, postal code"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Optional — kept with your account for your own records.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-full px-5 py-2.5 transition-all disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
      </button>
    </form>
  );
}
