# Project Requirements Document (PRD)

## Product Name (Working Title): SawaariShare
*A cost-sharing carpool platform for the Indian student community in the US*

**Version:** 1.1
**Date:** June 13, 2026
**Status:** Draft for review
**Changes since v1.0:** Added confirmed tech stack (React Native / Supabase / Vercel), beta-first rollout sequence, expanded architecture and security (RLS) sections.

---

## 1. Executive Summary

SawaariShare is a mobile application that enables Indian college students in the United States to coordinate cost-shared carpools for their daily commutes. It replaces unstructured WhatsApp group chats with a purpose-built platform for posting, finding, and joining recurring or one-time carpools. The platform facilitates cost-sharing only — riders contribute toward actual trip costs (fuel, tolls, parking) paid in cash directly to the host. The platform takes no commission, processes no payments, and is positioned as a carpool coordination service, not a transportation provider.

## 2. Problem Statement

Indian students in the US currently coordinate shared rides through informal WhatsApp groups. This system suffers from:

1. Message overload — ride requests buried under hundreds of unrelated messages
2. No structure — no standard format for routes, times, or seat availability
3. Double-booking and no-shows with no accountability
4. No support for recurring commutes, the most common use case
5. No safety features (ratings, trip sharing, women-only options)
6. Discovery limited to whoever happens to be in the group

Commercial options (Uber, Lyft) are too expensive for daily student commutes, don't accept cash, and lack the community trust dimension.

## 3. Goals & Non-Goals

### Goals
- G1: Reduce ride coordination time from minutes of group-chat scrolling to under 60 seconds
- G2: Support recurring carpool schedules as a first-class feature
- G3: Maintain minimal personal data collection (phone number only at signup)
- G4: Keep all monetary exchange off-platform, capped at cost-sharing levels
- G5: Build community trust through invites, ratings, and optional verification
- G6: Validate the concept in a closed beta, then launch at one campus community

### Non-Goals (v1)
- No in-app payments or wallets
- No live GPS tracking during trips (planned v2)
- No commission, surge pricing, or monetization
- No support for non-student general public
- No intercity/long-distance trips (focus: daily commute radius)

## 4. Target Users & Personas

### Persona 1 — Rider: "Ananya," 22, Master's student
- No car; lives in shared apartment 6 miles from campus
- Currently messages 3 WhatsApp groups every morning hoping someone is driving
- Wants: predictable recurring ride, female host option, fair cost split

### Persona 2 — Host: "Rohan," 24, PhD student
- Owns a car; drives to campus daily, 4 empty seats
- Happy to take riders to offset gas costs; doesn't want to negotiate prices in chat
- Wants: set his route once, get matched automatically, simple cost math

### Persona 3 — Community Organizer: "Priya," WhatsApp group admin
- Manages a 400-member desi student group; tired of moderating ride spam
- Wants: migrate ride coordination off her group; becomes an app ambassador

## 5. User Roles & Modes

Single account, two switchable modes:

| Capability | Rider Mode | Host Mode |
|---|---|---|
| Post a ride request | ✅ | — |
| Post a trip offer | — | ✅ |
| Browse open offers/requests | ✅ (offers) | ✅ (requests) |
| Join a trip | ✅ | — |
| Accept riders | — | ✅ |
| Rate the other party | ✅ | ✅ |
| Cost Recovery dashboard | — | ✅ |

Host mode requires: vehicle details (model, color, plate, seat count). License upload is **optional** and grants a verification badge only.

## 6. Functional Requirements

### 6.1 Onboarding & Auth
- FR-1: Sign up via phone number + OTP (SMS). No email required.
- FR-2: Invite-code based registration. Each member receives 5 invite codes; profiles display "Invited by [Name]."
- FR-3: Optional verification tiers: Phone-only (default) → Vouched (joined via invite) → ID-Verified (optional student ID/license upload, manual review).
- FR-4: Profile: first name, last initial, photo (optional), home area (neighborhood-level, not exact address), campus/community affiliation (self-declared from a list).
- FR-5: Onboarding consent screen: "Contributions cover trip costs only. This platform does not provide transportation services."

### 6.2 Trip Offers (Host)
- FR-6: Create offer: origin area, destination, departure time, seats available, vehicle.
- FR-7: Recurring offers: select days of week + time; system auto-generates trip instances 7 days ahead.
- FR-8: Cost estimate auto-calculated (see 6.4) and displayed on the offer.
- FR-9: Host reviews and accepts/declines join requests; seat count decrements automatically.
- FR-10: Cancel trip with mandatory notice; all confirmed riders notified via push.

### 6.3 Ride Requests (Rider)
- FR-11: Create request: pickup area, destination, time window (±30 min), seats needed.
- FR-12: Recurring requests supported, mirroring FR-7.
- FR-13: Browse/filter offers: by time window, route proximity, women-only, verification badge.
- FR-14: One-tap join request to an offer; rider may attach a short note.
- FR-15: Rider can cancel up to 1 hour before departure without rating penalty.

### 6.4 Cost-Sharing Engine
- FR-16: Cost estimate = (trip distance × regional fuel rate per mile) + declared tolls/parking, divided by (riders + host).
- FR-17: Suggested contribution displayed per rider; host may adjust within a hard cap of 2× the calculated per-rider cost. **This cap is enforced server-side (Supabase Edge Function / DB constraint), never client-side only.**
- FR-18: All amounts are informational; cash is exchanged in person. The app never collects, holds, or transfers money.
- FR-19: Cost Recovery dashboard for hosts: cumulative costs offset this month (informational only; explicitly not labeled as income or earnings).

### 6.5 Matching & Discovery
- FR-20: Feed ranked by: time-window overlap → route proximity (PostGIS distance from request points to offer route polyline) → host rating.
- FR-21: Recurring auto-match: once a rider joins a recurring offer, they are auto-confirmed for future instances until either party opts out.
- FR-22: Push notifications: join request received, request accepted/declined, trip reminder (1 hour before), cancellation.

### 6.6 Safety & Trust
- FR-23: Mutual 5-star rating + optional comment after each completed trip.
- FR-24: Women-only trip option (host-selectable; visible filter for riders).
- FR-25: Share-trip link: rider can send trip details (host name, vehicle, plate, route, time) to any contact via OS share sheet.
- FR-26: In-app report/block; 3 validated reports trigger account review.
- FR-27: No-show tracking; repeat no-shows surfaced on profile.

### 6.7 Communication
- FR-28: In-app chat opens only after a join request is accepted; closes 24h after trip completion.
- FR-29: Phone numbers never exposed; all contact through in-app chat (masked). Built on Supabase Realtime.

### 6.8 Admin
- FR-30: Admin panel (Next.js on Vercel): user reports queue, ID-verification review, community/campus list management, basic metrics dashboard.

## 7. Non-Functional Requirements

- NFR-1 **Privacy:** Collect only phone number as mandatory PII. No precise home addresses; locations stored at area/neighborhood granularity for profiles, exact pins only per-trip and purged 30 days after trip completion.
- NFR-2 **Performance:** Feed loads < 2s on 4G; OTP delivery < 30s.
- NFR-3 **Scale target (v1):** 5,000 registered users, 500 daily trips — comfortably within Supabase's standard tier.
- NFR-4 **Availability:** 99.5% uptime; degraded mode shows cached feed.
- NFR-5 **Platforms:** Android first (priority), iOS second; single React Native (Expo) codebase.
- NFR-6 **Accessibility:** WCAG AA contrast; dynamic font scaling.
- NFR-7 **Data retention:** Chat purged 30 days post-trip; deleted accounts fully erased within 30 days.
- NFR-8 **Security:** Supabase Auth (JWT), Row Level Security on every table, TLS everywhere, rate-limited OTP, encrypted at rest.

## 8. Data Model (Supabase Postgres + PostGIS)

```
users(id, phone, first_name, last_initial, photo_url,
      home_area_geo, community_id, invited_by, verified_tier,
      rating_avg, no_show_count, created_at, deleted_at)

invites(code, owner_id, used_by, used_at)

communities(id, name, campus_geo, status)

vehicles(id, owner_id, make_model, color, plate_no, seats)

trip_offers(id, host_id, vehicle_id, origin_geo, dest_geo,
            route_polyline, depart_at, recurring_rule,
            seats_total, seats_left, distance_mi, fuel_rate,
            tolls, cost_estimate, women_only, status)

ride_requests(id, rider_id, pickup_geo, dest_geo,
              window_start, window_end, seats_needed,
              recurring_rule, status)

trip_matches(id, offer_id, request_id, contribution,
             cost_cap, status, rated_by_host, rated_by_rider)

ratings(id, match_id, from_user, to_user, stars, comment)

reports(id, reporter_id, reported_id, match_id, reason,
        status, resolved_at)

chat_messages(id, match_id, sender_id, body, sent_at,
              purge_after)
```

Key decisions:
- Phone managed by Supabase Auth. (Note: Supabase Auth stores the raw phone; the PRD's earlier `phone_hash` goal requires either accepting this or adding a hashing layer — decision pending, see Open Questions.)
- Offers and requests are separate entities joined by `trip_matches` (supports both host-initiated and rider-initiated flows)
- `recurring_rule` as RRULE strings; a scheduled job materializes instances
- PostGIS `geography` types for all `_geo` columns; GiST index on `route_polyline` for proximity queries
- **Row Level Security on every table** — see Section 9.2

## 9. System Architecture

### 9.1 Stack & Topology

```
[React Native app (Expo) — Android first, iOS second]
        │
        │  Supabase JS client (HTTPS + WebSocket)
        ▼
[Supabase]
   ├── Postgres + PostGIS         (primary data store)
   ├── Auth                       (phone OTP, JWT)
   ├── Row Level Security         (authorization layer)
   ├── Realtime                   (in-app chat, live feed updates)
   ├── Storage                    (profile photos, optional ID docs)
   └── Edge Functions             (trusted server-side logic)
            - cost-split calc + 2× cap
            - invite-code validation
            - matching queries
            - materialize recurring trips

[Vercel]
   ├── Next.js admin panel        (reports, verification, metrics)
   ├── Invite / landing page
   └── Vercel Cron                (nightly: recurring-trip gen, chat purge)

[External]
   ├── SMS provider (Twilio/MessageBird via Supabase Auth)
   └── FCM / APNs                 (push notifications)
```

### 9.2 Security & Authorization (Supabase RLS)

RLS is the real security boundary — enforced at the database, not the client. Core policies:

- **users:** a user can read/update only their own row; others see a limited public view (name, photo, rating, badge).
- **ride_requests:** rider reads/writes only their own; hosts can read requests matched to their offers.
- **trip_offers:** publicly readable (within community); writable only by the owning host.
- **trip_matches:** readable/writable only by the two parties involved.
- **chat_messages:** readable/writable only by the two parties on the match; auto-purged after `purge_after`.
- **reports:** insertable by any authed user; readable only by admins.

Plan these policies before building features — retrofitting RLS is error-prone.

### 9.3 Where Logic Lives (important)

- **Client (RN app):** UI, optimistic updates, direct Supabase CRUD guarded by RLS.
- **Edge Functions (trusted):** cost cap, invite validation, matching, recurring materialization — anything a user must not be able to bypass. **Never enforce the cost cap or invite rules client-side only.**
- **Vercel:** admin web app + scheduled cron jobs.

### 9.4 Deployment

- RN app → built and shipped via **Expo EAS** to Google Play (first) and App Store. (Vercel does not host the mobile app itself.)
- Admin panel + landing → **Vercel**.
- Database, auth, functions, storage → **Supabase**.
- Estimated infra cost at v1 scale: Supabase + Vercel hobby/pro tiers, roughly $25–70/month.

## 10. Legal & Compliance Requirements

- LC-1: Terms of Service must state the platform is a **carpool coordination service**, not a transportation network company (TNC) or transportation provider; have counsel review before public launch.
- LC-2: Cost-sharing cap (FR-17) enforced server-side to keep contributions within cost-recovery range.
- LC-3: No language implying employment, income, or earnings anywhere in UI, marketing, or notifications.
- LC-4: Onboarding acknowledgment (FR-5) logged with timestamp.
- LC-5: Hosts acknowledge their personal auto insurance applies; platform provides no coverage.
- LC-6: SMS compliance (TCPA): transactional messages only, explicit opt-in.
- LC-7: Privacy policy covering data collected, retention, deletion (see NFR-1, NFR-7); CCPA-aware if operating in California.
- LC-8: **Beta waiver** — even the closed beta involves real cars, cash, and passengers. A short liability waiver and the cost-sharing consent should be in place before the first beta trip, ideally after a brief (1-hour) attorney consult.

## 11. Rollout Plan

### Stage 0 — Pre-Beta Legal Touchpoint
- One-hour attorney consultation to review the beta waiver and cost-sharing language before any real trips. (Full ToS review deferred to pre-launch.)

### Stage 1 — Closed Beta (50–100 users, ~6–8 weeks)
- Recruit from a single existing WhatsApp group (pre-built trust, honest feedback)
- Target host-to-rider ratio ~1:4 (≈15–20 hosts in a group of 80) so the feed isn't empty
- Seed 10–15 hosts before opening signups to avoid cold start
- Instrument: time-to-match, cancellations, no-shows, funnel drop-off points
- Run a dedicated feedback channel; ship fixes weekly
- **Exit criteria:** ≥100 completed trips, >80% completion rate, and a majority of riders saying they'd stop using the old group chat

### Stage 2 — Review & Full Legal
- Incorporate beta findings; validate that recurring auto-match actually retains users
- Full ToS + privacy policy review with counsel; finalize insurance/waiver language

### Stage 3 — Public Launch (single community)
- Launch at one campus community with WhatsApp admins as ambassadors
- Expand to additional communities only after retention is proven

## 12. MVP Scope & Phasing

### Phase 1 — MVP (8–10 weeks)
Phone OTP + invites · profiles · one-time trip offers & requests · browse/filter feed · join/accept flow · cost-split calculator (server-enforced cap) · in-app chat (Realtime) · push notifications · ratings · report/block · admin panel basics · RLS on all tables

### Phase 2 — Retention (4–6 weeks)
Recurring trips + auto-match · women-only filter · share-trip link · no-show tracking · verification badges · Cost Recovery dashboard

### Phase 3 — Growth (later)
iOS polish · live trip status ("host is on the way") · multi-community expansion · community leaderboards/ambassador tools · optional monetization experiments (local business ads, never commission)

## 13. Success Metrics

| Metric | Beta Target | Public (3 months) |
|---|---|---|
| Registered users | 50–100 | 500 (launch community) |
| Weekly active users | 50% of registered | 40% of registered |
| Trips completed | 100 total | 150 / week |
| Avg. time from request → match | < 4 hours | < 2 hours |
| Recurring trips share of all trips | — | > 50% (Phase 2) |
| Trip completion rate (no cancel/no-show) | > 80% | > 85% |
| % of WhatsApp ride posts migrated (survey) | — | > 60% |

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Contributions drift into for-profit territory | Legal exposure for hosts (incl. visa risk for international students) and platform | Hard cost cap enforced server-side; cost-recovery framing throughout; ToS review by counsel |
| Liability during beta | Real incident before legal protections exist | Stage 0 attorney touchpoint + beta waiver before first trip |
| Cold start — no hosts | App feels empty | Launch one community; recruit WhatsApp admins as ambassadors; seed 10–15 hosts before opening signups |
| Safety incident | Trust collapse | Ratings, reports, share-trip, women-only option; clear incident response playbook |
| Low verification adoption | Trust signal weak | Vouch system as default trust layer; badges as bonus, not gate |
| WhatsApp inertia | Low migration | Recurring auto-match as the feature WhatsApp can't replicate; ambassador-led migration |
| Insurance gap in an accident | Host financial exposure | Explicit insurance acknowledgment; educational content on personal policy carpool coverage |
| Client-side rule bypass | Cost cap / invite logic circumvented | Enforce all trust-critical logic in Edge Functions + RLS, never client-only |

## 15. Open Questions

1. Final product name and branding (check trademark availability)
2. Which launch community/campus? (Pick where the founding team has the strongest WhatsApp group relationships)
3. Fuel rate source — static regional table vs. live API (static is fine for v1)
4. Should hosts see rider ratings before accepting? (Recommended: yes, mutual visibility)
5. Phone storage — accept Supabase Auth's raw phone storage, or add a hashing layer to meet the original privacy goal?
6. Counsel selection — budget for Stage 0 consult (~$300–500) + full pre-launch review (~$1–2k)

---

*End of document — v1.1 draft. Sections 10, 11, and 14 should be reviewed with a licensed attorney before the closed beta and again before public launch.*
