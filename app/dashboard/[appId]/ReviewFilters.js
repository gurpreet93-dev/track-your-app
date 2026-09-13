'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'last_year', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
];

export default function ReviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');

  const date = searchParams.get('date') || 'all';
  const rating = searchParams.get('rating') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ q });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search review text..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            className="text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-xl px-4 py-2 transition-all whitespace-nowrap"
          >
            Search
          </button>
        </form>

        <select
          value={date}
          onChange={(e) => updateParams({ date: e.target.value === 'all' ? '' : e.target.value, from: '', to: '' })}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {DATE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={rating}
          onChange={(e) => updateParams({ rating: e.target.value })}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>{r} star{r === 1 ? '' : 's'}</option>
          ))}
        </select>
      </div>

      {date === 'custom' && (
        <div className="flex items-center gap-2 mt-3">
          <input
            type="date"
            value={from}
            onChange={(e) => updateParams({ from: e.target.value })}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => updateParams({ to: e.target.value })}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}
    </div>
  );
}
