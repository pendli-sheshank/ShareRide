-- Calculate cost estimate on trip offer insert/update
CREATE OR REPLACE FUNCTION calculate_cost_estimate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.distance_mi IS NOT NULL AND NEW.seats_total IS NOT NULL THEN
    NEW.cost_estimate := ROUND(
      ((NEW.distance_mi * NEW.fuel_rate) + COALESCE(NEW.tolls, 0)) / (NEW.seats_total + 1)::numeric,
      2
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_trip_offers_cost
  BEFORE INSERT OR UPDATE ON trip_offers
  FOR EACH ROW EXECUTE FUNCTION calculate_cost_estimate();

-- Update user rating average after new rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET
    rating_avg = sub.avg_stars,
    rating_count = sub.cnt
  FROM (
    SELECT to_user, AVG(stars)::numeric(3,2) as avg_stars, COUNT(*) as cnt
    FROM ratings
    WHERE to_user = NEW.to_user
    GROUP BY to_user
  ) sub
  WHERE users.id = sub.to_user;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_ratings_update_avg
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Auto-decrement seats on match confirm, re-increment on cancel
CREATE OR REPLACE FUNCTION on_match_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE trip_offers
    SET seats_left = seats_left - 1,
        status = CASE WHEN seats_left - 1 = 0 THEN 'full' ELSE status END
    WHERE id = NEW.offer_id AND seats_left > 0;
  END IF;

  IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    UPDATE trip_offers
    SET seats_left = seats_left + 1,
        status = CASE WHEN status = 'full' THEN 'active' ELSE status END
    WHERE id = NEW.offer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_match_status_change
  AFTER INSERT OR UPDATE OF status ON trip_matches
  FOR EACH ROW EXECUTE FUNCTION on_match_status_change();

-- Auto-generate 5 invite codes for new users
CREATE OR REPLACE FUNCTION generate_user_invites()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO invites (owner_id)
  SELECT NEW.id FROM generate_series(1, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_user_invites
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_user_invites();

-- Enable Realtime for chat and matches
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_matches;
