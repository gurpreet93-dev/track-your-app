import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase-server';
import { getBillingStatus, PRICE_DISPLAY } from '../../../../lib/billing';
import { CreditCard } from 'lucide-react';
import BillingActionButton from './BillingActionButton';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const billing = await getBillingStatus(supabase, user.id);
  const expired = billing.status !== 'active' && billing.status !== 'trialing';

  const planName = billing.status === 'active' ? `Pro — ${PRICE_DISPLAY}` : 'Free Trial';
  const statusLine = billing.status === 'active'
    ? 'Active subscription'
    : expired
      ? 'Your free trial has ended'
      : `Free trial — ${billing.daysLeft} day${billing.daysLeft === 1 ? '' : 's'} remaining`;

  const badge = billing.status === 'active'
    ? { label: 'Active', className: 'bg-green-50 text-green-700' }
    : expired
      ? { label: 'Ended', className: 'bg-red-50 text-red-700' }
      : { label: 'Trial', className: 'bg-gray-100 text-gray-600' };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-4 h-4 text-orange-600" />
        <h2 className="text-sm font-semibold text-gray-900">Current Plan</h2>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-base font-semibold text-gray-900">{planName}</p>
          <p className="text-sm text-gray-500 mt-0.5">{statusLine}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <BillingActionButton status={billing.status} />
    </div>
  );
}
