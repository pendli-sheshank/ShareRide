-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  campus_geo GEOGRAPHY(POINT, 4326),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_initial TEXT NOT NULL CHECK (char_length(last_initial) = 1),
  photo_url TEXT,
  home_area_geo GEOGRAPHY(POINT, 4326),
  community_id UUID REFERENCES communities(id),
  invited_by UUID REFERENCES users(id),
  verified_tier TEXT NOT NULL DEFAULT 'phone_only'
    CHECK (verified_tier IN ('phone_only', 'vouched', 'id_verified')),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  no_show_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Invite codes
CREATE TABLE invites (
  code TEXT PRIMARY KEY DEFAULT substring(gen_random_uuid()::text, 1, 8),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make_model TEXT NOT NULL,
  color TEXT NOT NULL,
  plate_no TEXT NOT NULL,
  seats INT NOT NULL CHECK (seats BETWEEN 1 AND 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip offers (host creates)
CREATE TABLE trip_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  origin_geo GEOGRAPHY(POINT, 4326),
  origin_label TEXT,
  dest_geo GEOGRAPHY(POINT, 4326),
  dest_label TEXT,
  route_polyline GEOGRAPHY(LINESTRING, 4326),
  depart_at TIMESTAMPTZ NOT NULL,
  recurring_rule TEXT,
  parent_offer_id UUID REFERENCES trip_offers(id),
  seats_total INT NOT NULL CHECK (seats_total BETWEEN 1 AND 8),
  seats_left INT NOT NULL CHECK (seats_left >= 0),
  distance_mi NUMERIC(7,2),
  fuel_rate NUMERIC(5,3) NOT NULL DEFAULT 0.15,
  tolls NUMERIC(7,2) NOT NULL DEFAULT 0,
  cost_estimate NUMERIC(7,2),
  women_only BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seats_left_lte_total CHECK (seats_left <= seats_total)
);

-- Ride requests (rider creates)
CREATE TABLE ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_geo GEOGRAPHY(POINT, 4326),
  pickup_label TEXT,
  dest_geo GEOGRAPHY(POINT, 4326),
  dest_label TEXT,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  seats_needed INT NOT NULL DEFAULT 1 CHECK (seats_needed BETWEEN 1 AND 4),
  recurring_rule TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'matched', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_window CHECK (window_end > window_start)
);

-- Trip matches
CREATE TABLE trip_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES trip_offers(id) ON DELETE CASCADE,
  request_id UUID REFERENCES ride_requests(id),
  rider_id UUID NOT NULL REFERENCES users(id),
  contribution NUMERIC(7,2) NOT NULL DEFAULT 0,
  cost_cap NUMERIC(7,2) NOT NULL DEFAULT 0,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  rated_by_host BOOLEAN NOT NULL DEFAULT false,
  rated_by_rider BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES trip_matches(id) ON DELETE CASCADE,
  from_user UUID NOT NULL REFERENCES users(id),
  to_user UUID NOT NULL REFERENCES users(id),
  stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, from_user)
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reported_id UUID NOT NULL REFERENCES users(id),
  match_id UUID REFERENCES trip_matches(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES trip_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purge_after TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_trip_offers_depart ON trip_offers(depart_at) WHERE status = 'active';
CREATE INDEX idx_trip_offers_host ON trip_offers(host_id);
CREATE INDEX idx_trip_offers_origin_geo ON trip_offers USING GIST(origin_geo);
CREATE INDEX idx_trip_offers_dest_geo ON trip_offers USING GIST(dest_geo);
CREATE INDEX idx_ride_requests_rider ON ride_requests(rider_id);
CREATE INDEX idx_ride_requests_window ON ride_requests(window_start, window_end) WHERE status = 'open';
CREATE INDEX idx_trip_matches_offer ON trip_matches(offer_id);
CREATE INDEX idx_trip_matches_rider ON trip_matches(rider_id);
CREATE INDEX idx_chat_messages_match ON chat_messages(match_id, sent_at);
CREATE INDEX idx_chat_messages_purge ON chat_messages(purge_after);
CREATE INDEX idx_ratings_to_user ON ratings(to_user);
CREATE INDEX idx_invites_owner ON invites(owner_id);
