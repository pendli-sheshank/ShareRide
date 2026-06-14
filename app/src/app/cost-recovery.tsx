import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

interface CompletedTrip {
  id: string;
  origin_label: string | null;
  dest_label: string | null;
  depart_at: string;
  cost_estimate: number;
  matches: {
    contribution: number;
    status: string;
  }[];
}

interface MonthlyGroup {
  key: string;
  label: string;
  totalContributions: number;
  tripCount: number;
  averagePerTrip: number;
}

export default function CostRecoveryScreen() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("trip_offers")
      .select(
        "id, origin_label, dest_label, depart_at, cost_estimate, matches:trip_matches(contribution, status)"
      )
      .eq("host_id", user.id)
      .eq("status", "completed")
      .order("depart_at", { ascending: false });

    if (!error && data) {
      setTrips(data as CompletedTrip[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Compute contributions for a trip (only completed matches)
  function tripContributions(trip: CompletedTrip): number {
    return trip.matches
      .filter((m) => m.status === "completed")
      .reduce((sum, m) => sum + m.contribution, 0);
  }

  function tripRiderCount(trip: CompletedTrip): number {
    return trip.matches.filter((m) => m.status === "completed").length;
  }

  // Summary calculations
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthTrips = trips.filter(
    (t) => new Date(t.depart_at) >= monthStart
  );
  const thisMonthTotal = thisMonthTrips.reduce(
    (sum, t) => sum + tripContributions(t),
    0
  );
  const allTimeTotal = trips.reduce(
    (sum, t) => sum + tripContributions(t),
    0
  );
  const tripsHostedThisMonth = thisMonthTrips.length;

  // Monthly breakdown
  const monthlyMap = new Map<string, MonthlyGroup>();
  for (const trip of trips) {
    const d = new Date(trip.depart_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        key,
        label,
        totalContributions: 0,
        tripCount: 0,
        averagePerTrip: 0,
      });
    }

    const group = monthlyMap.get(key)!;
    group.totalContributions += tripContributions(trip);
    group.tripCount += 1;
  }

  const monthlyBreakdown = Array.from(monthlyMap.values())
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((g) => ({
      ...g,
      averagePerTrip: g.tripCount > 0 ? g.totalContributions / g.tripCount : 0,
    }));

  // Recent trips (last 10)
  const recentTrips = trips.slice(0, 10);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Cost Recovery" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Stack.Screen options={{ title: "Cost Recovery" }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cost Recovery</Text>
        <Text style={styles.subtitle}>
          Track how your trip costs are being offset
        </Text>
      </View>

      {/* Summary Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryRow}
      >
        <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
          <Ionicons name="calendar-outline" size={22} color={colors.white} />
          <Text style={styles.summaryValue}>
            ${thisMonthTotal.toFixed(2)}
          </Text>
          <Text style={styles.summaryLabel}>This Month</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons
            name="trending-up-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.summaryValueDark}>
            ${allTimeTotal.toFixed(2)}
          </Text>
          <Text style={styles.summaryLabelDark}>All Time</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="car-outline" size={22} color={colors.secondary} />
          <Text style={styles.summaryValueDark}>{tripsHostedThisMonth}</Text>
          <Text style={styles.summaryLabelDark}>Trips Hosted</Text>
        </View>
      </ScrollView>

      {/* Monthly Breakdown */}
      {monthlyBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
          {monthlyBreakdown.map((month) => (
            <View key={month.key} style={styles.monthCard}>
              <Text style={styles.monthHeader}>{month.label}</Text>
              <View style={styles.monthStats}>
                <View style={styles.monthStat}>
                  <Text style={styles.monthStatValue}>
                    ${month.totalContributions.toFixed(2)}
                  </Text>
                  <Text style={styles.monthStatLabel}>
                    Total contributions
                  </Text>
                </View>
                <View style={styles.monthStatDivider} />
                <View style={styles.monthStat}>
                  <Text style={styles.monthStatValue}>{month.tripCount}</Text>
                  <Text style={styles.monthStatLabel}>Trips</Text>
                </View>
                <View style={styles.monthStatDivider} />
                <View style={styles.monthStat}>
                  <Text style={styles.monthStatValue}>
                    ${month.averagePerTrip.toFixed(2)}
                  </Text>
                  <Text style={styles.monthStatLabel}>Avg per trip</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Trips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Trips</Text>
        {recentTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="car-outline"
              size={48}
              color={colors.textLight}
            />
            <Text style={styles.emptyTitle}>No completed trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Once you host trips and riders contribute, your cost recovery
              details will appear here.
            </Text>
          </View>
        ) : (
          recentTrips.map((trip) => {
            const d = new Date(trip.depart_at);
            const dateStr = d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const contributions = tripContributions(trip);
            const riders = tripRiderCount(trip);

            return (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripDateBadge}>
                  <Text style={styles.tripDateDay}>
                    {d.getDate()}
                  </Text>
                  <Text style={styles.tripDateMonth}>
                    {d.toLocaleDateString(undefined, { month: "short" })}
                  </Text>
                </View>
                <View style={styles.tripDetails}>
                  <Text style={styles.tripRoute} numberOfLines={1}>
                    {trip.origin_label ?? "Origin"} →{" "}
                    {trip.dest_label ?? "Destination"}
                  </Text>
                  <View style={styles.tripMeta}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.tripMetaText}>
                      {riders} {riders === 1 ? "rider" : "riders"}
                    </Text>
                  </View>
                </View>
                <View style={styles.tripContribution}>
                  <Text style={styles.tripContributionValue}>
                    ${contributions.toFixed(2)}
                  </Text>
                  <Text style={styles.tripContributionLabel}>offset</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Legal Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.textLight}
        />
        <Text style={styles.disclaimerText}>
          Contributions shown represent cost offsets from shared trip expenses.
          This is not income or earnings.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Summary cards
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 130,
    gap: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryCardPrimary: {
    backgroundColor: colors.primary,
  },
  summaryValue: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.white,
  },
  summaryLabel: {
    fontSize: fontSizes.xs,
    color: colors.white,
    opacity: 0.85,
  },
  summaryValueDark: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  summaryLabelDark: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // Sections
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Monthly breakdown
  monthCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  monthHeader: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  monthStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthStat: {
    flex: 1,
    alignItems: "center",
  },
  monthStatValue: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.text,
  },
  monthStatLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  monthStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Trip cards
  tripCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tripDateBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  tripDateDay: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 22,
  },
  tripDateMonth: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    lineHeight: 14,
  },
  tripDetails: {
    flex: 1,
    marginLeft: spacing.md,
    gap: 4,
  },
  tripRoute: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
  },
  tripMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tripMetaText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  tripContribution: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },
  tripContributionValue: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.success,
  },
  tripContributionLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: fontSizes.xs,
    color: colors.textLight,
    lineHeight: 18,
  },
});
