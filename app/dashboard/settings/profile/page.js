import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase-server';
import { ShieldAlert } from 'lucide-react';
import ProfileForm from './ProfileForm';
import DeleteAccountButton from './DeleteAccountButton';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const metadata = user.user_metadata || {};

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h2>
        <p className="text-sm text-gray-700">{user.email}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Profile</h2>
        <ProfileForm
          initial={{
            fullName: metadata.full_name || '',
            companyName: metadata.company_name || '',
            businessAddress: metadata.business_address || ''
          }}
        />
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
