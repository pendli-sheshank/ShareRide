"use client";

import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";

export function ReportActions({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    const { error } = await supabaseClient
      .from("reports")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) {
      alert(`Failed to update report: ${error.message}`);
      return;
    }

    router.refresh();
  }

  if (currentStatus === "resolved" || currentStatus === "dismissed") {
    return (
      <span style={{ color: "#6c757d", fontSize: "0.85rem" }}>
        No actions available
      </span>
    );
  }

  return (
    <div>
      {currentStatus === "pending" && (
        <button
          className="btn btn-primary"
          onClick={() => updateStatus("reviewing")}
        >
          Review
        </button>
      )}
      <button
        className="btn btn-success"
        onClick={() => updateStatus("resolved")}
      >
        Resolve
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => updateStatus("dismissed")}
      >
        Dismiss
      </button>
    </div>
  );
}
