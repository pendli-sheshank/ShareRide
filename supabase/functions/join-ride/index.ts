import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const COST_CAP_MULTIPLIER = 2;

interface JoinRequest {
  offer_id: string;
  request_id?: string;
  note?: string;
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

  const body: JoinRequest = await req.json();
  const { offer_id, request_id, note } = body;

  if (!offer_id) {
    return new Response(JSON.stringify({ error: "offer_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: offer, error: offerError } = await serviceClient
    .from("trip_offers")
    .select("*")
    .eq("id", offer_id)
    .single();

  if (offerError || !offer) {
    return new Response(JSON.stringify({ error: "Offer not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (offer.status !== "active") {
    return new Response(JSON.stringify({ error: "This trip is no longer available" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (offer.seats_left <= 0) {
    return new Response(JSON.stringify({ error: "No seats available" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (offer.host_id === user.id) {
    return new Response(JSON.stringify({ error: "Cannot join your own trip" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: existing } = await serviceClient
    .from("trip_matches")
    .select("id")
    .eq("offer_id", offer_id)
    .eq("rider_id", user.id)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ error: "You already have a pending or confirmed request for this trip" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  const totalCost = (offer.distance_mi || 0) * offer.fuel_rate + (offer.tolls || 0);
  const perRiderCost = totalCost / (offer.seats_total + 1);
  const costCap = perRiderCost * COST_CAP_MULTIPLIER;

  const { data: match, error: matchError } = await serviceClient
    .from("trip_matches")
    .insert({
      offer_id,
      request_id: request_id || null,
      rider_id: user.id,
      contribution: Math.round(perRiderCost * 100) / 100,
      cost_cap: Math.round(costCap * 100) / 100,
      note: note || null,
      status: "pending",
    })
    .select()
    .single();

  if (matchError) {
    return new Response(JSON.stringify({ error: "Failed to create join request", details: matchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ match, contribution: Math.round(perRiderCost * 100) / 100 }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
});
