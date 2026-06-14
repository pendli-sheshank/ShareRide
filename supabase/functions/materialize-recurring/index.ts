import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DAYS_AHEAD = 7;
const DAY_MAP: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

function parseRRule(rule: string): string[] {
  const match = rule.match(/BYDAY=([A-Z,]+)/);
  return match ? match[1].split(",") : [];
}

function getNextDates(days: string[], baseTime: string, fromDate: Date): Date[] {
  const results: Date[] = [];
  const [hours, minutes] = baseTime.split(":").map(Number);

  for (let offset = 0; offset <= DAYS_AHEAD; offset++) {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + offset);
    const dayName = ["SU","MO","TU","WE","TH","FR","SA"][date.getDay()];
    if (days.includes(dayName)) {
      date.setHours(hours, minutes, 0, 0);
      if (date > fromDate) {
        results.push(date);
      }
    }
  }
  return results;
}

Deno.serve(async (req: Request) => {
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = new Date();

  const { data: parentOffers, error } = await serviceClient
    .from("trip_offers")
    .select("*")
    .not("recurring_rule", "is", null)
    .is("parent_offer_id", null)
    .eq("status", "active");

  if (error || !parentOffers) {
    return new Response(JSON.stringify({ error: "Failed to fetch recurring offers" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let created = 0;

  for (const parent of parentOffers) {
    const days = parseRRule(parent.recurring_rule);
    if (days.length === 0) continue;

    const baseTime = new Date(parent.depart_at);
    const timeStr = `${baseTime.getUTCHours()}:${baseTime.getUTCMinutes()}`;
    const nextDates = getNextDates(days, timeStr, now);

    for (const date of nextDates) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existing } = await serviceClient
        .from("trip_offers")
        .select("id")
        .eq("parent_offer_id", parent.id)
        .gte("depart_at", startOfDay.toISOString())
        .lte("depart_at", endOfDay.toISOString())
        .maybeSingle();

      if (existing) continue;

      const { error: insertError } = await serviceClient
        .from("trip_offers")
        .insert({
          host_id: parent.host_id,
          vehicle_id: parent.vehicle_id,
          origin_geo: parent.origin_geo,
          origin_label: parent.origin_label,
          dest_geo: parent.dest_geo,
          dest_label: parent.dest_label,
          route_polyline: parent.route_polyline,
          depart_at: date.toISOString(),
          recurring_rule: null,
          parent_offer_id: parent.id,
          seats_total: parent.seats_total,
          seats_left: parent.seats_total,
          distance_mi: parent.distance_mi,
          fuel_rate: parent.fuel_rate,
          tolls: parent.tolls,
          women_only: parent.women_only,
          status: "active",
        });

      if (!insertError) created++;
    }

    // Auto-confirm recurring riders for new instances
    const { data: recurringMatches } = await serviceClient
      .from("trip_matches")
      .select("rider_id")
      .eq("offer_id", parent.id)
      .eq("status", "confirmed");

    if (recurringMatches && recurringMatches.length > 0) {
      const { data: newInstances } = await serviceClient
        .from("trip_offers")
        .select("id")
        .eq("parent_offer_id", parent.id)
        .eq("status", "active")
        .gte("depart_at", now.toISOString());

      if (newInstances) {
        for (const instance of newInstances) {
          for (const match of recurringMatches) {
            const { data: existingMatch } = await serviceClient
              .from("trip_matches")
              .select("id")
              .eq("offer_id", instance.id)
              .eq("rider_id", match.rider_id)
              .maybeSingle();

            if (!existingMatch) {
              const totalCost = (parent.distance_mi || 0) * parent.fuel_rate + (parent.tolls || 0);
              const perRider = totalCost / (parent.seats_total + 1);
              await serviceClient.from("trip_matches").insert({
                offer_id: instance.id,
                rider_id: match.rider_id,
                contribution: Math.round(perRider * 100) / 100,
                cost_cap: Math.round(perRider * 2 * 100) / 100,
                status: "confirmed",
              });
            }
          }
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, instances_created: created }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
