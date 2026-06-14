import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { TripOffer, RideRequest, TripMatch } from "../types/database";

interface TripOfferWithHost extends TripOffer {
  host: {
    id: string;
    first_name: string;
    last_initial: string;
    photo_url: string | null;
    rating_avg: number;
    verified_tier: string;
  };
}

interface MatchWithOffer extends TripMatch {
  trip_offer: TripOffer & {
    host: {
      id: string;
      first_name: string;
      last_initial: string;
      photo_url: string | null;
      rating_avg: number;
    };
  };
}

export function useTrips() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchActiveOffers = useCallback(async (): Promise<
    TripOfferWithHost[]
  > => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trip_offers")
        .select(
          `
          *,
          host:users!host_id (
            id, first_name, last_initial, photo_url, rating_avg, verified_tier
          )
        `,
        )
        .eq("status", "active")
        .gt("seats_left", 0)
        .gt("depart_at", new Date().toISOString())
        .order("depart_at", { ascending: true })
        .limit(30);

      if (error) throw error;
      return (data as unknown as TripOfferWithHost[]) ?? [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyOffers = useCallback(async (): Promise<TripOffer[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trip_offers")
        .select("*")
        .eq("host_id", user.id)
        .order("depart_at", { ascending: false });

      if (error) throw error;
      return (data as TripOffer[]) ?? [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMyRequests = useCallback(async (): Promise<RideRequest[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ride_requests")
        .select("*")
        .eq("rider_id", user.id)
        .order("window_start", { ascending: false });

      if (error) throw error;
      return (data as RideRequest[]) ?? [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMyMatches = useCallback(async (): Promise<MatchWithOffer[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trip_matches")
        .select(
          `
          *,
          trip_offer:trip_offers!offer_id (
            *,
            host:users!host_id (
              id, first_name, last_initial, photo_url, rating_avg
            )
          )
        `,
        )
        .eq("rider_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as MatchWithOffer[]) ?? [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cancelOffer = useCallback(
    async (offerId: string): Promise<void> => {
      if (!user) return;
      setLoading(true);
      try {
        const { error: offerError } = await supabase
          .from("trip_offers")
          .update({ status: "cancelled" })
          .eq("id", offerId)
          .eq("host_id", user.id);

        if (offerError) throw offerError;

        const { error: matchError } = await supabase
          .from("trip_matches")
          .update({ status: "declined" })
          .eq("offer_id", offerId)
          .eq("status", "pending");

        if (matchError) throw matchError;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const cancelMatch = useCallback(
    async (matchId: string): Promise<void> => {
      if (!user) return;
      setLoading(true);
      try {
        const { error } = await supabase
          .from("trip_matches")
          .update({ status: "cancelled" })
          .eq("id", matchId)
          .eq("rider_id", user.id);

        if (error) throw error;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    fetchActiveOffers,
    fetchMyOffers,
    fetchMyRequests,
    fetchMyMatches,
    cancelOffer,
    cancelMatch,
    loading,
  };
}
