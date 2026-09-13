import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase-server';
import { getBillingStatus } from '../../lib/billing';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const billing = await getBillingStatus(supabase, user.id);

  return (
    <DashboardShell userEmail={user.email} billing={billing}>
      {children}
    </DashboardShell>
  );
}
