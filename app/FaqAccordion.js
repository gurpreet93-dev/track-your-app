'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
      {items.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div key={faq.q}>
            <button
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 text-left p-5"
            >
              <span className="text-gray-900 text-sm font-medium">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <p className="text-gray-600 text-sm leading-relaxed px-5 pb-5 -mt-1">{faq.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
