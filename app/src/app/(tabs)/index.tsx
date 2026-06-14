import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { TripOffer } from "../../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";
import { ShareTripButton } from "../../components/ShareTripButton";

type TripWithHost = TripOffer & {
  host?: { first_name: string; last_initial: string; rating_avg: number; verified_tier?: string };
  vehicle?: { make_model: string; color: string; plate_no: string };
  share_token?: string;
};

type SortMode = "soonest" | "cheapest";

function TripCard({ trip }: { trip: TripWithHost }) {
  const departDate = new Date(trip.depart_at);
  const timeStr = departDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = departDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const shareOffer = {
    host_name: `${trip.host?.first_name ?? "Host"} ${trip.host?.last_initial ?? ""}`.trim(),
    vehicle_make_model: trip.vehicle?.make_model ?? "Vehicle",
    vehicle_color: trip.vehicle?.color ?? "",
    vehicle_plate_no: trip.vehicle?.plate_no ?? "",
    origin_label: trip.origin_label ?? "Pickup point",
    dest_label: trip.dest_label ?? "Destination",
    depart_at: trip.depart_at,
    cost_estimate: trip.cost_estimate,
    share_token: trip.share_token ?? trip.id,
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.hostInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.hostName}>
              {trip.host?.first_name ?? "Host"} {trip.host?.last_initial ?? ""}.
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.star} />
              <Text style={styles.ratingText}>
                {(trip.host?.rating_avg ?? 0).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <ShareTripButton offer={shareOffer} variant="icon" />
          <View style={styles.costBadge}>
            <Text style={styles.costText}>${trip.cost_estimate.toFixed(0)}/seat</Text>
          </View>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeDots}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={styles.routeLine} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.routeLabels}>
          <Text style={styles.routeText} numberOfLines={1}>Pickup point</Text>
          <Text style={styles.routeText} numberOfLines={1}>Destination</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>{timeStr} · {dateStr}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>{trip.seats_left} seats left</Text>
        </View>
        {trip.women_only && (
          <View style={[styles.tag, { backgroundColor: "#FCE7F3" }]}>
            <Text style={[styles.tagText, { color: "#BE185D" }]}>Women only</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

type FilterChipKey = "all" | "women_only" | "verified_hosts";

const FILTER_CHIPS: { key: FilterChipKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "women_only", label: "Women Only" },
  { key: "verified_hosts", label: "Verified Hosts" },
];

const SORT_CHIPS: { key: SortMode; label: string }[] = [
  { key: "soonest", label: "Sort: Soonest" },
  { key: "cheapest", label: "Sort: Cheapest" },
];

export default function RidesScreen() {
  const [trips, setTrips] = useState<TripWithHost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<FilterChipKey>>(new Set(["all"]));
  const [sortMode, setSortMode] = useState<SortMode>("soonest");

  const fetchTrips = useCallback(async () => {
    const { data, error } = await supabase
      .from("trip_offers")
      .select("*, host:users!host_id(first_name, last_initial, rating_avg, verified_tier), vehicle:vehicles!vehicle_id(make_model, color, plate_no)")
      .eq("status", "active")
      .gt("seats_left", 0)
      .gte("depart_at", new Date().toISOString())
      .order("depart_at", { ascending: true })
      .limit(30);

    if (!error && data) {
      setTrips(data as TripWithHost[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  }, [fetchTrips]);

  const toggleFilter = useCallback((key: FilterChipKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (key === "all") {
        return new Set(["all"]);
      }
      next.delete("all");
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next.size === 0 ? new Set<FilterChipKey>(["all"]) : next;
    });
  }, []);

  const filteredTrips = useMemo(() => {
    let result = trips;

    if (!activeFilters.has("all")) {
      if (activeFilters.has("women_only")) {
        result = result.filter((t) => t.women_only);
      }
      if (activeFilters.has("verified_hosts")) {
        result = result.filter(
          (t) => t.host?.verified_tier === "id_verified" || t.host?.verified_tier === "vouched"
        );
      }
    }

    const sorted = [...result];
    if (sortMode === "cheapest") {
      sorted.sort((a, b) => a.cost_estimate - b.cost_estimate);
    } else {
      sorted.sort((a, b) => new Date(a.depart_at).getTime() - new Date(b.depart_at).getTime());
    }
    return sorted;
  }, [trips, activeFilters, sortMode]);

  const renderFilterBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterBar}
      style={styles.filterBarContainer}
    >
      {FILTER_CHIPS.map(({ key, label }) => {
        const isActive = activeFilters.has(key);
        return (
          <TouchableOpacity
            key={key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => toggleFilter(key)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.chipDivider} />
      {SORT_CHIPS.map(({ key, label }) => {
        const isActive = sortMode === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => setSortMode(key)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderFilterBar}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No rides available</Text>
            <Text style={styles.emptyText}>
              Pull to refresh or post a ride to get started
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  hostName: {
    fontSize: fontSizes.md,
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
  costBadge: {
    backgroundColor: colors.primaryLight + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  costText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: colors.primary,
  },
  routeSection: {
    flexDirection: "row",
    marginTop: spacing.md,
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.md,
    flexWrap: "wrap",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
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
  filterBarContainer: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  chipDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
});
