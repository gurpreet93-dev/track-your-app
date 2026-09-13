import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";
import { getBillingStatus, PRICE_DISPLAY } from "../../lib/billing";
import AddAppForm from './AddAppForm';
import BillingBanner from './BillingBanner';
import { LayoutGrid, AlertTriangle, MessageSquare, ChevronRight, Inbox } from 'lucide-react';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const billing = await getBillingStatus(supabase, user.id);

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      active,
      apps (
        id,
        app_name,
        package_name,
        icon_url
      )
    `
    )
    .eq("active", true);

  const apps = subscriptions
    ? subscriptions
        .map((sub) => sub.apps)
        .filter(Boolean)
    : [];

  const appStats = await Promise.all(
    apps.map(async (app) => {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("sentiment, urgency")
        .eq("app_id", app.id);

      const total = reviews?.length || 0;

      const highPriority =
        reviews?.filter(
          (r) => r.urgency === "critical" || r.urgency === "high"
        ).length || 0;

      const positive =
        reviews?.filter((r) => r.sentiment === "positive").length || 0;

      return {
        ...app,
        total,
        highPriority,
        positive,
      };
    })
  );

  const totalReviews = appStats.reduce(
    (sum, app) => sum + app.total,
    0
  );

  const totalHighPriority = appStats.reduce(
    (sum, app) => sum + app.highPriority,
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Your Dashboard</h1>

      <BillingBanner status={billing.status} daysLeft={billing.daysLeft} priceDisplay={PRICE_DISPLAY} />

        {billing.hasAccess ? (
          <AddAppForm />
        ) : (
          <p className="text-sm text-gray-500 mb-8">
            Your existing tracked apps are still shown below. Subscribe above to add new ones.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{apps.length}</div>
              <div className="text-xs text-gray-500">Apps tracked</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{totalHighPriority}</div>
              <div className="text-xs text-gray-500">Needs attention</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{totalReviews}</div>
              <div className="text-xs text-gray-500">Reviews tracked</div>
            </div>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-5 h-5 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No apps tracked yet
            </h2>

            <p className="text-gray-500 text-sm">
              Add your first app to start receiving daily review digests.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appStats.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/${app.id}`}
                className="group bg-white rounded-2xl shadow-sm p-5 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-sm font-semibold text-orange-700 flex-shrink-0">
                      {app.app_name.slice(0, 1).toUpperCase()}
                    </div>
                    <h3 className="font-medium text-gray-900">
                      {app.app_name}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                </div>

                <div className="flex gap-6">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {app.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      Reviews
                    </div>
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {app.highPriority}
                    </div>
                    <div className="text-xs text-gray-500">
                      High Priority
                    </div>
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {app.positive}
                    </div>
                    <div className="text-xs text-gray-500">
                      Positive
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
