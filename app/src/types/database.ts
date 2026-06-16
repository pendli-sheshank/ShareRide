export type VerifiedTier = "email_only" | "vouched" | "id_verified";

export type TripStatus = "active" | "full" | "cancelled" | "completed";
export type RequestStatus = "open" | "matched" | "cancelled";
export type MatchStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed";

export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string;
  last_initial: string;
  photo_url: string | null;
  home_area_geo: GeoPoint | null;
  community_id: string | null;
  invited_by: string | null;
  verified_tier: VerifiedTier;
  rating_avg: number;
  rating_count: number;
  no_show_count: number;
  gender: Gender | null;
  push_token: string | null;
  id_doc_url: string | null;
  id_verified_at: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Community {
  id: string;
  name: string;
  campus_geo: GeoPoint;
  status: "active" | "inactive";
}

export interface Vehicle {
  id: string;
  owner_id: string;
  make_model: string;
  color: string;
  plate_no: string;
  seats: number;
}

export interface TripOffer {
  id: string;
  host_id: string;
  vehicle_id: string;
  origin_geo: GeoPoint;
  origin_label: string | null;
  dest_geo: GeoPoint;
  dest_label: string | null;
  route_polyline: string | null;
  depart_at: string;
  recurring_rule: string | null;
  seats_total: number;
  seats_left: number;
  distance_mi: number;
  fuel_rate: number;
  tolls: number;
  cost_estimate: number;
  women_only: boolean;
  share_token: string | null;
  parent_offer_id: string | null;
  status: TripStatus;
}

export interface RideRequest {
  id: string;
  rider_id: string;
  pickup_geo: GeoPoint;
  pickup_label: string | null;
  dest_geo: GeoPoint;
  dest_label: string | null;
  window_start: string;
  window_end: string;
  seats_needed: number;
  recurring_rule: string | null;
  status: RequestStatus;
}

export interface TripMatch {
  id: string;
  offer_id: string;
  request_id: string | null;
  rider_id: string;
  contribution: number;
  cost_cap: number;
  note: string | null;
  status: MatchStatus;
  rated_by_host: boolean;
  rated_by_rider: boolean;
  no_show: boolean;
}

export interface Rating {
  id: string;
  match_id: string;
  from_user: string;
  to_user: string;
  stars: number;
  comment: string | null;
}

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  purge_after: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}
