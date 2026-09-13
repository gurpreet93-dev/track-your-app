'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard } from 'lucide-react';

const tabs = [
  { href: '/dashboard/settings/profile', label: 'Profile', Icon: User },
  { href: '/dashboard/settings/billing', label: 'Billing', Icon: CreditCard }
];

export default function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
      {tabs.map(tab => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
