import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";
import { getBillingStatus, PRICE_DISPLAY } from "../../lib/billing";
import AddAppForm from './AddAppForm';
import BillingBanner from './BillingBanner';
import Logo from '../Logo';

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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Logo size={24} />
            <h1 className="text-2xl font-semibold text-gray-900 mt-2">
              Your Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Logged in as {user.email}
            </p>
          </div>

          <form action="/auth/signout" method="post">
            <button className="text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors">
              Log out
            </button>
          </form>
        </div>

        <BillingBanner status={billing.status} daysLeft={billing.daysLeft} priceDisplay={PRICE_DISPLAY} />

        {billing.hasAccess ? (
          <AddAppForm />
        ) : (
          <p className="text-sm text-gray-500 mb-8">
            Your existing tracked apps are still shown below. Subscribe above to add new ones.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
            <div className="text-2xl font-semibold text-gray-900">
              {apps.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Apps Tracked
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="text-2xl font-semibold text-red-700">
              {totalHighPriority}
            </div>
            <div className="text-xs text-red-600 mt-1">
              Needs Attention
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
            <div className="text-2xl font-semibold text-gray-900">
              {totalReviews}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Reviews Tracked
            </div>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
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
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-gray-900 mb-3">
                  {app.app_name}
                </h3>

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
    </main>
  );
}