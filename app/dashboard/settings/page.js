import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase-server';
import { getBillingStatus, PRICE_DISPLAY } from '../../../lib/billing';
import { CreditCard, ShieldAlert } from 'lucide-react';
import DeleteAccountButton from './DeleteAccountButton';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const billing = await getBillingStatus(supabase, user.id);

  const planLabel = billing.status === 'active'
    ? `Active subscription — ${PRICE_DISPLAY}`
    : billing.status === 'trialing'
      ? `Free trial — ${billing.daysLeft} day${billing.daysLeft === 1 ? '' : 's'} left`
      : 'No active plan';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h2>
        <p className="text-sm text-gray-700">{user.email}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Billing</h2>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-sm text-gray-700">{planLabel}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wide">Danger zone</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and everything associated with it. This cancels any active
          subscription and cannot be undone.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
