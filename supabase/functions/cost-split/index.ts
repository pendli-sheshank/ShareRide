import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const COST_CAP_MULTIPLIER = 2;

interface CostSplitRequest {
  offer_id: string;
  custom_contribution?: number;
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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body: CostSplitRequest = await req.json();
  const { offer_id, custom_contribution } = body;

  if (!offer_id) {
    return new Response(JSON.stringify({ error: "offer_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: offer, error: offerError } = await supabase
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

  const totalCost = (offer.distance_mi * offer.fuel_rate) + (offer.tolls || 0);
  const perRiderCost = totalCost / (offer.seats_total + 1);
  const maxAllowed = perRiderCost * COST_CAP_MULTIPLIER;

  let finalContribution = perRiderCost;

  if (custom_contribution !== undefined) {
    if (custom_contribution > maxAllowed) {
      return new Response(
        JSON.stringify({
          error: "Contribution exceeds the cost-sharing cap",
          max_allowed: Math.round(maxAllowed * 100) / 100,
          calculated_per_rider: Math.round(perRiderCost * 100) / 100,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (custom_contribution < 0) {
      return new Response(
        JSON.stringify({ error: "Contribution cannot be negative" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    finalContribution = custom_contribution;
  }

  return new Response(
    JSON.stringify({
      offer_id,
      total_trip_cost: Math.round(totalCost * 100) / 100,
      per_rider_cost: Math.round(perRiderCost * 100) / 100,
      max_allowed: Math.round(maxAllowed * 100) / 100,
      final_contribution: Math.round(finalContribution * 100) / 100,
      seats_total: offer.seats_total,
      distance_mi: offer.distance_mi,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
