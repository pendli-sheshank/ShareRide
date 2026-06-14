import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { TripOffer } from "../../../types/database";
import { VerificationBadge } from "../../../components/VerificationBadge";
import { colors, spacing, fontSizes, borderRadius } from "../../../constants/theme";
import type { VerifiedTier } from "../../../types/database";

type SharedTrip = TripOffer & {
  host?: {
    first_name: string;
    last_initial: string;
    rating_avg: number;
    photo_url: string | null;
    verified_tier: VerifiedTier;
  };
  vehicle?: {
    make_model: string;
    color: string;
  };
};

export default function SharedTripScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      const { data, error } = await supabase
        .from("trip_offers")
        .select(
          "*, host:users!host_id(first_name, last_initial, rating_avg, photo_url, verified_tier), vehicle:vehicles!vehicle_id(make_model, color)"
        )
        .eq("share_token", token)
        .single();

      if (!error && data) {
        setTrip(data as SharedTrip);
      }
      setLoading(false);
    }

    if (token) {
      fetchTrip();
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Shared Ride" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Shared Ride" }} />
        <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
        <Text style={styles.emptyTitle}>Trip not found</Text>
        <Text style={styles.emptySubtitle}>
          This link may have expired or the trip may no longer be available.
        </Text>
      </View>
    );
  }

  const departDate = new Date(trip.depart_at);
  const timeStr = departDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = departDate.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "Shared Ride" }} />

      {/* Host Info */}
      <View style={styles.hostSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.white} />
        </View>
        <View style={styles.hostDetails}>
          <Text style={styles.hostName}>
            {trip.host?.first_name ?? "Host"} {trip.host?.last_initial ?? ""}.
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.star} />
            <Text style={styles.ratingText}>
              {(trip.host?.rating_avg ?? 0).toFixed(1)}
            </Text>
          </View>
          {trip.host?.verified_tier && (
            <VerificationBadge tier={trip.host.verified_tier} size="sm" />
          )}
        </View>
        {trip.women_only && (
          <View style={styles.womenOnlyBadge}>
            <Text style={styles.womenOnlyText}>Women only</Text>
          </View>
        )}
      </View>

      {/* Vehicle */}
      {trip.vehicle && (
        <View style={styles.card}>
          <View style={styles.vehicleRow}>
            <Ionicons name="car" size={20} color={colors.secondary} />
            <Text style={styles.vehicleText}>
              {trip.vehicle.color} {trip.vehicle.make_model}
            </Text>
          </View>
        </View>
      )}

      {/* Route */}
      <View style={styles.card}>
        <View style={styles.routeSection}>
          <View style={styles.routeDots}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <View style={styles.routeLine} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeLabel}>Origin</Text>
            <Text style={styles.routeText}>
              {trip.origin_label ?? "Pickup point"}
            </Text>
            <View style={styles.routeSpacer} />
            <Text style={styles.routeLabel}>Destination</Text>
            <Text style={styles.routeText}>
              {trip.dest_label ?? "Drop-off point"}
            </Text>
          </View>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>{timeStr}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="people-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.detailLabel}>Seats left</Text>
            <Text style={styles.detailValue}>
              {trip.seats_left} of {trip.seats_total}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="cash-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.detailLabel}>Cost per rider</Text>
            <Text style={styles.detailValue}>
              ${trip.cost_estimate.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaIcon}>
          <Ionicons name="car-sport" size={40} color={colors.primary} />
        </View>
        <Text style={styles.ctaTitle}>Download SawaariShare</Text>
        <Text style={styles.ctaSubtitle}>
          Join this ride and share travel costs with fellow students
        </Text>
        <View style={styles.ctaButton}>
          <Ionicons name="download-outline" size={20} color={colors.white} />
          <Text style={styles.ctaButtonText}>Get the App</Text>
        </View>
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
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl,
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
  },
  hostSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  hostDetails: {
    flex: 1,
    marginLeft: spacing.md,
    gap: 4,
  },
  hostName: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  womenOnlyBadge: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  womenOnlyText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: "#BE185D",
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  vehicleText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: "500",
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
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  routeSection: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  routeDots: {
    alignItems: "center",
    width: 16,
    paddingVertical: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  routeLabels: {
    flex: 1,
  },
  routeLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  routeSpacer: {
    height: spacing.sm,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  detailItem: {
    width: "45%",
    gap: 4,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
  },
  ctaSection: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.sm,
  },
  ctaIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  ctaTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  ctaSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: colors.white,
  },
});
