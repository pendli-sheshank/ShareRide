import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { TripOffer, RideRequest, TripMatch, MatchStatus } from "../../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

// --------------- Types ---------------

interface RiderInfo {
  first_name: string;
  last_initial: string;
  rating_avg: number;
}

interface PendingMatch extends TripMatch {
  rider: RiderInfo;
}

interface HostOffer extends TripOffer {
  pendingMatches: PendingMatch[];
}

interface HostSection {
  title: string;
  offerId: string;
  offer: HostOffer;
  data: PendingMatch[];
}

interface RiderMatch extends TripMatch {
  trip_offers: TripOffer & { host: RiderInfo };
}

interface RiderSection {
  title: string;
  data: (RideRequest | RiderMatch)[];
  type: "requests" | "matches";
}

// --------------- Helpers ---------------

function formatRecurringDays(rrule: string): string {
  const match = rrule.match(/BYDAY=([A-Z,]+)/);
  if (!match) return "";
  const codeToLabel: Record<string, string> = {
    SU: "Sun",
    MO: "Mon",
    TU: "Tue",
    WE: "Wed",
    TH: "Thu",
    FR: "Fri",
    SA: "Sat",
  };
  return match[1]
    .split(",")
    .map((code) => codeToLabel[code] ?? code)
    .join(", ");
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${time} · ${date}`;
}

function statusColor(status: MatchStatus | string) {
  switch (status) {
    case "confirmed":
      return colors.success;
    case "pending":
      return colors.warning;
    case "declined":
    case "cancelled":
      return colors.error;
    case "full":
      return colors.secondary;
    case "active":
      return colors.success;
    default:
      return colors.textSecondary;
  }
}

// --------------- Segment Control ---------------

function SegmentControl({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <View style={styles.segmentContainer}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={tab}
          style={[styles.segmentTab, active === i && styles.segmentTabActive]}
          onPress={() => onChange(i)}
        >
          <Text style={[styles.segmentText, active === i && styles.segmentTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --------------- Status Badge ---------------

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "20" }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// --------------- Host Tab ---------------

function HostTab({
  offers,
  loading,
  refreshing,
  onRefresh,
  onAccept,
  onDecline,
  onCancelTrip,
}: {
  offers: HostOffer[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
  onCancelTrip: (offerId: string) => void;
}) {
  const sections: HostSection[] = offers.map((offer) => ({
    title: `${offer.origin_label ?? "Origin"} → ${offer.dest_label ?? "Destination"}`,
    offerId: offer.id,
    offer,
    data: offer.pendingMatches,
  }));

  const renderSectionHeader = ({ section }: { section: HostSection }) => {
    const { offer } = section;
    return (
      <View style={styles.card}>
        <View style={styles.routeRow}>
          <View style={styles.routeDots}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <View style={styles.routeLine} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeText} numberOfLines={1}>
              {offer.origin_label ?? "Origin"}
            </Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {offer.dest_label ?? "Destination"}
            </Text>
          </View>
          <StatusBadge
            label={offer.status}
            color={statusColor(offer.status)}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatDateTime(offer.depart_at)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {offer.seats_left}/{offer.seats_total} seats left
            </Text>
          </View>
        </View>

        {offer.recurring_rule ? (
          <View style={styles.recurringRow}>
            <Ionicons name="repeat-outline" size={14} color={colors.secondary} />
            <Text style={styles.recurringText}>
              Repeats: {formatRecurringDays(offer.recurring_rule)}
            </Text>
          </View>
        ) : null}

        {section.data.length > 0 && (
          <Text style={styles.pendingHeader}>
            Pending join requests ({section.data.length})
          </Text>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: PendingMatch }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchInfo}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.matchName}>
            {item.rider.first_name} {item.rider.last_initial}.
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.star} />
            <Text style={styles.ratingText}>
              {item.rider.rating_avg.toFixed(1)}
            </Text>
          </View>
          {item.note ? (
            <Text style={styles.noteText} numberOfLines={2}>
              {item.note}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={() => onAccept(item.id)}
        >
          <Ionicons name="checkmark" size={18} color={colors.white} />
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={() => onDecline(item.id)}
        >
          <Ionicons name="close" size={18} color={colors.error} />
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSectionFooter = ({ section }: { section: HostSection }) => (
    <View style={styles.sectionFooter}>
      <TouchableOpacity
        style={styles.cancelTripBtn}
        onPress={() => onCancelTrip(section.offerId)}
      >
        <Ionicons name="close-circle-outline" size={18} color={colors.error} />
        <Text style={styles.cancelTripBtnText}>Cancel Trip</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      renderSectionFooter={renderSectionFooter}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No active trips</Text>
          <Text style={styles.emptyText}>
            Post a trip offer to start sharing rides
          </Text>
        </View>
      }
    />
  );
}

// --------------- Rider Tab ---------------

function isRideRequest(item: RideRequest | RiderMatch): item is RideRequest {
  return "pickup_label" in item || "seats_needed" in item;
}

function RiderTab({
  requests,
  matches,
  loading,
  refreshing,
  onRefresh,
  onCancelMatch,
}: {
  requests: RideRequest[];
  matches: RiderMatch[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCancelMatch: (matchId: string) => void;
}) {
  const router = useRouter();

  const sections: RiderSection[] = [];
  if (requests.length > 0) {
    sections.push({ title: "My Requests", data: requests, type: "requests" });
  }
  if (matches.length > 0) {
    sections.push({ title: "My Matches", data: matches, type: "matches" });
  }

  const renderSectionHeader = ({ section }: { section: RiderSection }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const renderItem = ({ item, section }: { item: RideRequest | RiderMatch; section: RiderSection }) => {
    if (section.type === "requests" && isRideRequest(item)) {
      const req = item as RideRequest;
      const startStr = formatDateTime(req.window_start);
      const endTime = new Date(req.window_end).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.routeDots}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <View style={styles.routeLine} />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.routeLabels}>
              <Text style={styles.routeText} numberOfLines={1}>
                {req.pickup_label ?? "Pickup"}
              </Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {req.dest_label ?? "Destination"}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{startStr} - {endTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{req.seats_needed} seat(s)</Text>
            </View>
          </View>
          {req.recurring_rule ? (
            <View style={styles.recurringRow}>
              <Ionicons name="repeat-outline" size={14} color={colors.secondary} />
              <Text style={styles.recurringText}>
                Repeats: {formatRecurringDays(req.recurring_rule)}
              </Text>
            </View>
          ) : null}
        </View>
      );
    }

    // Match item
    const match = item as RiderMatch;
    const offer = match.trip_offers;
    const host = offer?.host;
    const isPending = match.status === "pending";
    const isConfirmed = match.status === "confirmed";

    return (
      <View style={styles.card}>
        <View style={styles.routeRow}>
          <View style={styles.routeDots}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <View style={styles.routeLine} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeText} numberOfLines={1}>
              {offer?.origin_label ?? "Origin"}
            </Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {offer?.dest_label ?? "Destination"}
            </Text>
          </View>
          {isPending && (
            <StatusBadge label="Waiting for host" color={colors.warning} />
          )}
          {isConfirmed && (
            <StatusBadge label="Confirmed" color={colors.success} />
          )}
        </View>

        {offer && (
          <>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatDateTime(offer.depart_at)}</Text>
              </View>
              {host && (
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {host.first_name} {host.last_initial}.
                  </Text>
                </View>
              )}
            </View>
            {offer.recurring_rule ? (
              <View style={styles.recurringRow}>
                <Ionicons name="repeat-outline" size={14} color={colors.secondary} />
                <Text style={styles.recurringText}>
                  Repeats: {formatRecurringDays(offer.recurring_rule)}
                </Text>
              </View>
            ) : null}
          </>
        )}

        <View style={styles.actionRow}>
          {isConfirmed && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.chatBtn]}
              onPress={() => router.push(`/chat/${match.id}`)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.white} />
              <Text style={styles.acceptBtnText}>Chat</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.declineBtn]}
            onPress={() => onCancelMatch(match.id)}
          >
            <Ionicons name="close" size={16} color={colors.error} />
            <Text style={styles.declineBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No ride activity</Text>
          <Text style={styles.emptyText}>
            Browse rides or post a request to find a match
          </Text>
        </View>
      }
    />
  );
}

// --------------- Main Screen ---------------

export default function MyRidesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingHost, setLoadingHost] = useState(true);
  const [loadingRider, setLoadingRider] = useState(true);

  // Host data
  const [hostOffers, setHostOffers] = useState<HostOffer[]>([]);

  // Rider data
  const [riderRequests, setRiderRequests] = useState<RideRequest[]>([]);
  const [riderMatches, setRiderMatches] = useState<RiderMatch[]>([]);

  // --------------- Fetch Host Data ---------------

  const fetchHostData = useCallback(async () => {
    if (!user) return;

    const { data: offers, error: offersErr } = await supabase
      .from("trip_offers")
      .select("*")
      .eq("host_id", user.id)
      .in("status", ["active", "full"])
      .order("depart_at", { ascending: true });

    if (offersErr || !offers) {
      setLoadingHost(false);
      return;
    }

    // Fetch pending matches for each offer
    const offerIds = offers.map((o: TripOffer) => o.id);

    let pendingMatches: PendingMatch[] = [];
    if (offerIds.length > 0) {
      const { data: matchData } = await supabase
        .from("trip_matches")
        .select("*, rider:users!rider_id(first_name, last_initial, rating_avg)")
        .in("offer_id", offerIds)
        .eq("status", "pending");

      if (matchData) {
        pendingMatches = matchData as unknown as PendingMatch[];
      }
    }

    const enriched: HostOffer[] = offers.map((offer: TripOffer) => ({
      ...offer,
      pendingMatches: pendingMatches.filter((m) => m.offer_id === offer.id),
    }));

    setHostOffers(enriched);
    setLoadingHost(false);
  }, [user]);

  // --------------- Fetch Rider Data ---------------

  const fetchRiderData = useCallback(async () => {
    if (!user) return;

    // Open ride requests
    const { data: requests } = await supabase
      .from("ride_requests")
      .select("*")
      .eq("rider_id", user.id)
      .eq("status", "open")
      .order("window_start", { ascending: true });

    if (requests) {
      setRiderRequests(requests as RideRequest[]);
    }

    // Matches where this user is the rider
    const { data: matches } = await supabase
      .from("trip_matches")
      .select("*, trip_offers(*, host:users!host_id(first_name, last_initial, rating_avg))")
      .eq("rider_id", user.id)
      .in("status", ["pending", "confirmed"])
      .order("status", { ascending: true });

    if (matches) {
      setRiderMatches(matches as unknown as RiderMatch[]);
    }

    setLoadingRider(false);
  }, [user]);

  // --------------- Initial Load ---------------

  useEffect(() => {
    fetchHostData();
    fetchRiderData();
  }, [fetchHostData, fetchRiderData]);

  // --------------- Refresh ---------------

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 0) {
      await fetchHostData();
    } else {
      await fetchRiderData();
    }
    setRefreshing(false);
  }, [activeTab, fetchHostData, fetchRiderData]);

  // --------------- Actions ---------------

  const handleAccept = useCallback(
    async (matchId: string) => {
      const { error } = await supabase
        .from("trip_matches")
        .update({ status: "confirmed" })
        .eq("id", matchId);

      if (error) {
        Alert.alert("Error", "Could not accept request. Please try again.");
        return;
      }
      fetchHostData();
    },
    [fetchHostData]
  );

  const handleDecline = useCallback(
    async (matchId: string) => {
      Alert.alert("Decline Request", "Are you sure you want to decline this join request?", [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Decline",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("trip_matches")
              .update({ status: "declined" })
              .eq("id", matchId);

            if (error) {
              Alert.alert("Error", "Could not decline request. Please try again.");
              return;
            }
            fetchHostData();
          },
        },
      ]);
    },
    [fetchHostData]
  );

  const handleCancelTrip = useCallback(
    async (offerId: string) => {
      Alert.alert("Cancel Trip", "Are you sure you want to cancel this trip?", [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("trip_offers")
              .update({ status: "cancelled" })
              .eq("id", offerId);

            if (error) {
              Alert.alert("Error", "Could not cancel trip. Please try again.");
              return;
            }
            fetchHostData();
          },
        },
      ]);
    },
    [fetchHostData]
  );

  const handleCancelMatch = useCallback(
    async (matchId: string) => {
      Alert.alert("Cancel Match", "Are you sure you want to cancel this match?", [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("trip_matches")
              .update({ status: "cancelled" })
              .eq("id", matchId);

            if (error) {
              Alert.alert("Error", "Could not cancel match. Please try again.");
              return;
            }
            fetchRiderData();
          },
        },
      ]);
    },
    [fetchRiderData]
  );

  // --------------- Render ---------------

  return (
    <View style={styles.container}>
      <SegmentControl
        tabs={["As Host", "As Rider"]}
        active={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 0 ? (
        <HostTab
          offers={hostOffers}
          loading={loadingHost}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onCancelTrip={handleCancelTrip}
        />
      ) : (
        <RiderTab
          requests={riderRequests}
          matches={riderMatches}
          loading={loadingRider}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onCancelMatch={handleCancelMatch}
        />
      )}
    </View>
  );
}

// --------------- Styles ---------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Segment control
  segmentContainer: {
    flexDirection: "row",
    margin: spacing.md,
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md - 2,
  },
  segmentTabActive: {
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
  },

  // Cards
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  matchCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginLeft: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // Route
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  routeDots: {
    alignItems: "center",
    width: 16,
    paddingVertical: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  routeLabels: {
    flex: 1,
    justifyContent: "space-between",
  },
  routeText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },

  // Meta
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.md,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // Badge
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Section
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionFooter: {
    paddingBottom: spacing.md,
  },
  pendingHeader: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.warning,
    marginTop: spacing.md,
  },

  // Match info
  matchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  matchName: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  noteText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: "italic",
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  acceptBtn: {
    backgroundColor: colors.success,
  },
  acceptBtnText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.white,
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: "transparent",
  },
  declineBtnText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.error,
  },
  chatBtn: {
    backgroundColor: colors.primary,
  },
  cancelTripBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
  },
  cancelTripBtnText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.error,
  },

  // Recurring
  recurringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  recurringText: {
    fontSize: fontSizes.xs,
    color: colors.secondary,
    fontWeight: "500",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
