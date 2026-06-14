import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const [users, trips, matches, reports] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("trip_offers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabaseAdmin
      .from("trip_matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabaseAdmin
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalUsers: users.count ?? 0,
    activeTrips: trips.count ?? 0,
    completedMatches: matches.count ?? 0,
    pendingReports: reports.count ?? 0,
  };
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Users</h3>
          <div className="value">{metrics.totalUsers}</div>
        </div>
        <div className="metric-card">
          <h3>Active Trip Offers</h3>
          <div className="value">{metrics.activeTrips}</div>
        </div>
        <div className="metric-card">
          <h3>Completed Matches</h3>
          <div className="value">{metrics.completedMatches}</div>
        </div>
        <Link href="/reports" style={{ textDecoration: "none" }}>
          <div className="metric-card">
            <h3>Pending Reports</h3>
            <div className="value">{metrics.pendingReports}</div>
          </div>
        </Link>
      </div>

      <div className="card">
        <h2>Quick Links</h2>
        <p style={{ marginBottom: "1rem" }}>
          <Link href="/reports" className="btn btn-primary">
            Review Reports
          </Link>
          <Link href="/users" className="btn btn-secondary">
            Manage Users
          </Link>
          <Link href="/communities" className="btn btn-secondary">
            Communities
          </Link>
        </p>
      </div>
    </div>
  );
}
