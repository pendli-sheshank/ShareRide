package com.shareride.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("verified_tier") val verifiedTier: VerifiedTier = VerifiedTier.EMAIL_ONLY,
    @SerialName("host_mode") val hostMode: Boolean = false,
    @SerialName("vehicle_make_model") val vehicleMakeModel: String? = null,
    @SerialName("vehicle_color") val vehicleColor: String? = null,
    @SerialName("vehicle_plate_no") val vehiclePlateNo: String? = null,
)

@Serializable
enum class VerifiedTier {
    @SerialName("email_only") EMAIL_ONLY,
    @SerialName("vouched") VOUCHED,
    @SerialName("id_verified") ID_VERIFIED,
}

@Serializable
data class TripOffer(
    val id: String,
    @SerialName("host_id") val hostId: String,
    @SerialName("origin_label") val originLabel: String,
    @SerialName("dest_label") val destLabel: String,
    @SerialName("depart_at") val departAt: String,
    @SerialName("seats_total") val seatsTotal: Int,
    @SerialName("seats_available") val seatsAvailable: Int,
    @SerialName("cost_estimate") val costEstimate: Double,
    val notes: String? = null,
    @SerialName("share_token") val shareToken: String? = null,
    val host: User? = null,
)

@Serializable
data class RideRequest(
    val id: String,
    @SerialName("rider_id") val riderId: String,
    @SerialName("origin_label") val originLabel: String,
    @SerialName("dest_label") val destLabel: String,
    @SerialName("depart_at") val departAt: String,
    @SerialName("max_cost") val maxCost: Double? = null,
    val notes: String? = null,
)

@Serializable
data class TripMatch(
    val id: String,
    @SerialName("offer_id") val offerId: String,
    @SerialName("request_id") val requestId: String,
    val status: MatchStatus,
    val offer: TripOffer? = null,
    val request: RideRequest? = null,
)

@Serializable
enum class MatchStatus {
    @SerialName("pending") PENDING,
    @SerialName("accepted") ACCEPTED,
    @SerialName("rejected") REJECTED,
    @SerialName("cancelled") CANCELLED,
}

@Serializable
data class ChatMessage(
    val id: String,
    @SerialName("match_id") val matchId: String,
    @SerialName("sender_id") val senderId: String,
    val content: String,
    @SerialName("created_at") val createdAt: String,
    val sender: User? = null,
)
