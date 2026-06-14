import { supabaseAdmin } from "@/lib/supabase";
import { AddCommunityForm } from "./add-community-form";

export const dynamic = "force-dynamic";

async function getCommunities() {
  const { data, error } = await supabaseAdmin
    .from("communities")
    .select("id, name, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
  return data ?? [];
}

export default async function CommunitiesPage() {
  const communities = await getCommunities();

  return (
    <div>
      <h1>Communities</h1>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>Add Community</h2>
        <AddCommunityForm />
      </div>

      {communities.length === 0 ? (
        <div className="card empty-state">
          <p>No communities yet.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {communities.map((community: any) => (
              <tr key={community.id}>
                <td>{community.name}</td>
                <td>
                  <span className={`badge badge-${community.status}`}>
                    {community.status}
                  </span>
                </td>
                <td>
                  {new Date(community.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
