import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";
import AddAppForm from './AddAppForm';

export default async function Dashboard() {
  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get active subscriptions and related apps
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

  // Remove any null apps
  const apps = subscriptions
    ? subscriptions
        .map((sub) => sub.apps)
        .filter(Boolean)
    : [];

  // Fetch review stats for each app
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Your Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Logged in as {user.email}
            </p>
          </div>

          <form action="/auth/signout" method="post">
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Log out
            </button>
          </form>
        </div>
        <AddAppForm />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-semibold text-gray-900">
              {apps.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Apps Tracked
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="text-2xl font-semibold text-red-700">
              {totalHighPriority}
            </div>
            <div className="text-xs text-red-600 mt-1">
              Needs Attention
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {totalReviews}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Reviews Tracked
            </div>
          </div>
        </div>

        {/* Empty State */}
        {apps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
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
                className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
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