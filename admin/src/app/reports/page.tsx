import { supabaseAdmin } from "@/lib/supabase";
import { ReportActions } from "./report-actions";

export const dynamic = "force-dynamic";

async function getReports() {
  const { data, error } = await supabaseAdmin
    .from("reports")
    .select(
      `
      id,
      reason,
      status,
      created_at,
      reporter:users!reports_reporter_id_fkey(id, full_name),
      reported:users!reports_reported_id_fkey(id, full_name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
  return data ?? [];
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div>
      <h1>Reports Queue</h1>

      {reports.length === 0 ? (
        <div className="card empty-state">
          <p>No reports found.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reporter</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report: any) => (
              <tr key={report.id}>
                <td>
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td>{report.reporter?.full_name ?? "Unknown"}</td>
                <td>{report.reported?.full_name ?? "Unknown"}</td>
                <td>{report.reason}</td>
                <td>
                  <span className={`badge badge-${report.status}`}>
                    {report.status}
                  </span>
                </td>
                <td>
                  <ReportActions
                    reportId={report.id}
                    currentStatus={report.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
