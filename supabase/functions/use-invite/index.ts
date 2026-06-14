import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return new Response(JSON.stringify({ error: "Invite code is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: invite, error: inviteError } = await serviceClient
    .from("invites")
    .select("*, owner:users!owner_id(first_name, last_initial)")
    .eq("code", code.trim())
    .is("used_by", null)
    .maybeSingle();

  if (inviteError || !invite) {
    return new Response(JSON.stringify({ error: "Invalid or already used invite code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (invite.owner_id === user.id) {
    return new Response(JSON.stringify({ error: "Cannot use your own invite code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: updateError } = await serviceClient
    .from("invites")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("code", code.trim())
    .is("used_by", null);

  if (updateError) {
    return new Response(JSON.stringify({ error: "Failed to redeem invite" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  await serviceClient
    .from("users")
    .update({ verified_tier: "vouched", invited_by: invite.owner_id })
    .eq("id", user.id);

  return new Response(
    JSON.stringify({
      success: true,
      invited_by: `${invite.owner?.first_name} ${invite.owner?.last_initial}.`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
