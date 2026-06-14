import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { TripOffer } from "../../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

function TripCard({ trip }: { trip: TripOffer & { host?: { first_name: string; last_initial: string; rating_avg: number } } }) {
  const departDate = new Date(trip.depart_at);
  const timeStr = departDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = departDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

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
        <View style={styles.costBadge}>
          <Text style={styles.costText}>${trip.cost_estimate.toFixed(0)}/seat</Text>
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

export default function RidesScreen() {
  const [trips, setTrips] = useState<TripOffer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    const { data, error } = await supabase
      .from("trip_offers")
      .select("*, host:users!host_id(first_name, last_initial, rating_avg)")
      .eq("status", "active")
      .gt("seats_left", 0)
      .gte("depart_at", new Date().toISOString())
      .order("depart_at", { ascending: true })
      .limit(30);

    if (!error && data) {
      setTrips(data as TripOffer[]);
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

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={styles.list}
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
});
