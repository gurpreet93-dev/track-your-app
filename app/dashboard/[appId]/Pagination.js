'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>
      <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
