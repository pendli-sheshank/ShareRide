-- Phase 2 schema additions

-- Gender for women-only filtering
ALTER TABLE users ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));

-- Share token for trip sharing links
ALTER TABLE trip_offers ADD COLUMN share_token TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 12);

-- No-show flag on matches
ALTER TABLE trip_matches ADD COLUMN no_show BOOLEAN NOT NULL DEFAULT false;

-- Verification fields
ALTER TABLE users ADD COLUMN id_doc_url TEXT;
ALTER TABLE users ADD COLUMN id_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN id_reviewed_by UUID;

-- Indexes
CREATE INDEX idx_trip_offers_recurring ON trip_offers(parent_offer_id) WHERE recurring_rule IS NOT NULL;
CREATE INDEX idx_trip_offers_share_token ON trip_offers(share_token);
