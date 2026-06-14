import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface NotificationRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

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

  const { user_id, title, body, data }: NotificationRequest = await req.json();

  if (!user_id || !title || !body) {
    return new Response(
      JSON.stringify({ error: "user_id, title, and body are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: user, error: userError } = await serviceClient
    .from("users")
    .select("push_token")
    .eq("id", user_id)
    .single();

  if (userError || !user?.push_token) {
    return new Response(
      JSON.stringify({ error: "User has no push token registered" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: user.push_token,
      sound: "default",
      title,
      body,
      data: data ?? {},
    }),
  });

  const pushResult = await pushResponse.json();

  return new Response(JSON.stringify({ success: true, result: pushResult }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
