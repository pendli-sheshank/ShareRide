-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY users_select_public ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY users_update_own ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY users_insert_own ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- COMMUNITIES
CREATE POLICY communities_select ON communities FOR SELECT TO authenticated USING (true);

-- INVITES
CREATE POLICY invites_select_own ON invites FOR SELECT TO authenticated USING (owner_id = auth.uid() OR used_by = auth.uid());
CREATE POLICY invites_insert_own ON invites FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY invites_update_use ON invites FOR UPDATE TO authenticated USING (used_by IS NULL) WITH CHECK (used_by = auth.uid());

-- VEHICLES
CREATE POLICY vehicles_select ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY vehicles_insert_own ON vehicles FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY vehicles_update_own ON vehicles FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY vehicles_delete_own ON vehicles FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- TRIP OFFERS
CREATE POLICY trip_offers_select ON trip_offers FOR SELECT TO authenticated USING (true);
CREATE POLICY trip_offers_insert ON trip_offers FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY trip_offers_update ON trip_offers FOR UPDATE TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());

-- RIDE REQUESTS
CREATE POLICY ride_requests_select_own ON ride_requests FOR SELECT TO authenticated USING (rider_id = auth.uid());
CREATE POLICY ride_requests_select_matched ON ride_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_matches tm JOIN trip_offers o ON o.id = tm.offer_id WHERE tm.request_id = ride_requests.id AND o.host_id = auth.uid()));
CREATE POLICY ride_requests_insert ON ride_requests FOR INSERT TO authenticated WITH CHECK (rider_id = auth.uid());
CREATE POLICY ride_requests_update ON ride_requests FOR UPDATE TO authenticated USING (rider_id = auth.uid()) WITH CHECK (rider_id = auth.uid());

-- TRIP MATCHES
CREATE POLICY trip_matches_select ON trip_matches FOR SELECT TO authenticated
  USING (rider_id = auth.uid() OR EXISTS (SELECT 1 FROM trip_offers WHERE id = trip_matches.offer_id AND host_id = auth.uid()));
CREATE POLICY trip_matches_insert ON trip_matches FOR INSERT TO authenticated WITH CHECK (rider_id = auth.uid());
CREATE POLICY trip_matches_update ON trip_matches FOR UPDATE TO authenticated
  USING (rider_id = auth.uid() OR EXISTS (SELECT 1 FROM trip_offers WHERE id = trip_matches.offer_id AND host_id = auth.uid()));

-- RATINGS
CREATE POLICY ratings_select ON ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY ratings_insert ON ratings FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid());

-- REPORTS
CREATE POLICY reports_insert ON reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

-- CHAT MESSAGES
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_matches WHERE id = chat_messages.match_id AND (rider_id = auth.uid() OR EXISTS (SELECT 1 FROM trip_offers WHERE id = trip_matches.offer_id AND host_id = auth.uid())) AND status = 'confirmed'));
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM trip_matches WHERE id = chat_messages.match_id AND (rider_id = auth.uid() OR EXISTS (SELECT 1 FROM trip_offers WHERE id = trip_matches.offer_id AND host_id = auth.uid())) AND status = 'confirmed'));
