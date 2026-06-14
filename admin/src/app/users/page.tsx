import { supabaseAdmin } from "@/lib/supabase";
import { UserFilters } from "./user-filters";

export const dynamic = "force-dynamic";

function maskPhone(phone: string | null): string {
  if (!phone) return "N/A";
  return "****" + phone.slice(-4);
}

async function getUsers(tier?: string) {
  let query = supabaseAdmin
    .from("users")
    .select("id, full_name, phone, verified_tier, rating, no_show_count, created_at")
    .order("created_at", { ascending: false });

  if (tier && tier !== "all") {
    query = query.eq("verified_tier", tier);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data ?? [];
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const params = await searchParams;
  const users = await getUsers(params.tier);

  return (
    <div>
      <h1>Users</h1>

      <UserFilters currentTier={params.tier ?? "all"} />

      {users.length === 0 ? (
        <div className="card empty-state">
          <p>No users found.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Verified Tier</th>
              <th>Rating</th>
              <th>No-shows</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.full_name ?? "Unnamed"}</td>
                <td>{maskPhone(user.phone)}</td>
                <td>
                  <span className="badge badge-active">
                    {user.verified_tier ?? "phone_only"}
                  </span>
                </td>
                <td>{user.rating != null ? user.rating.toFixed(1) : "N/A"}</td>
                <td>{user.no_show_count ?? 0}</td>
                <td>
                  {new Date(user.created_at).toLocaleDateString("en-US", {
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
