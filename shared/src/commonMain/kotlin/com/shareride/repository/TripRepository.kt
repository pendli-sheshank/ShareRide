package com.shareride.repository

import com.shareride.model.TripOffer
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order

class TripRepository(private val supabase: SupabaseClient) {

    suspend fun getUpcomingOffers(limit: Int = 30): Result<List<TripOffer>> = runCatching {
        supabase.postgrest["trip_offers"]
            .select {
                filter { gt("depart_at", "now()") }
                order("depart_at", Order.ASCENDING)
                limit(limit.toLong())
            }
            .decodeList<TripOffer>()
    }

    suspend fun getMyOffers(hostId: String): Result<List<TripOffer>> = runCatching {
        supabase.postgrest["trip_offers"]
            .select { filter { eq("host_id", hostId) } }
            .decodeList<TripOffer>()
    }

    suspend fun createOffer(offer: TripOffer): Result<TripOffer> = runCatching {
        supabase.postgrest["trip_offers"]
            .insert(offer) { select() }
            .decodeSingle<TripOffer>()
    }

    suspend fun deleteOffer(offerId: String): Result<Unit> = runCatching {
        supabase.postgrest["trip_offers"]
            .delete { filter { eq("id", offerId) } }
    }
}
