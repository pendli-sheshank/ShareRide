# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SawaariShare — a cost-sharing carpool coordination app for Indian students in the US. The platform facilitates cost-sharing only (no payments, no commission). Cash is exchanged in person between riders and hosts.

## Tech Stack

- **Mobile app:** React Native (Expo), Android-first, iOS second
- **Backend:** Supabase (Postgres + PostGIS, Auth, Realtime, Edge Functions, Storage)
- **Admin panel:** Next.js on Vercel
- **Build/deploy:** Expo EAS for mobile, Vercel for web, Supabase for backend

## Architecture

### Three execution boundaries

1. **Client (React Native):** UI and optimistic updates. All CRUD goes through Supabase JS client, guarded by Row Level Security. Never enforce business rules client-side only.
2. **Edge Functions (Supabase, trusted):** Cost cap enforcement (2× calculated per-rider cost), invite-code validation, matching queries, recurring trip materialization. These are the trust boundary — anything a user must not bypass lives here.
3. **Vercel:** Next.js admin panel + Vercel Cron jobs (recurring trip generation, chat purge).

### Data model key points

- `trip_offers` (host-created) and `ride_requests` (rider-created) are separate entities joined by `trip_matches`
- All `_geo` columns use PostGIS `geography` types with GiST indexes
- `recurring_rule` stored as RRULE strings; a scheduled job materializes trip instances 7 days ahead
- RLS policies on every table — plan policies before building features
- Phone auth managed by Supabase Auth (JWT + OTP)
- Chat built on Supabase Realtime, scoped to accepted matches, purged 30 days post-trip

### User model

Single account with two switchable modes (Rider / Host). Host mode requires vehicle details. Three verification tiers: Phone-only → Vouched (invite) → ID-Verified (manual review).

## Key Constraints

- Cost contributions are capped at 2× the calculated per-rider cost, enforced server-side
- No language implying "income" or "earnings" anywhere in UI or code — use "cost recovery" framing
- Phone number is the only mandatory PII; home locations stored at neighborhood granularity, not exact addresses
- Exact trip locations purged 30 days after trip completion
- In-app chat opens only after join request accepted; closes 24h after trip completion

## Reference

- Full PRD: `docs/PRD-v1.1.md`
