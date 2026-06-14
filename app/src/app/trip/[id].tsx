import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { TripOffer } from "../../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

type TripWithHost = TripOffer & {
  host?: {
    first_name: string;
    last_initial: string;
    rating_avg: number;
    photo_url: string | null;
  };
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<TripWithHost | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      const { data, error } = await supabase
        .from("trip_offers")
        .select("*, host:users!host_id(first_name, last_initial, rating_avg, photo_url)")
        .eq("id", id)
        .single();

      if (!error && data) {
        setTrip(data as TripWithHost);
      }
      setLoading(false);
    }

    if (id) {
      fetchTrip();
    }
  }, [id]);

  const handleJoin = async () => {
    if (!id || joining) return;

    setJoining(true);
    const { data, error } = await supabase.functions.invoke("join-ride", {
      body: { offer_id: id, note: note.trim() || undefined },
    });

    setJoining(false);

    if (error) {
      Alert.alert("Could not join", error.message || "Something went wrong. Please try again.");
    } else {
      Alert.alert("Request sent", "The host will review your request.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Trip Details" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Trip Details" }} />
        <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
        <Text style={styles.emptyTitle}>Trip not found</Text>
      </View>
    );
  }

  const departDate = new Date(trip.depart_at);
  const timeStr = departDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = departDate.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "Trip Details" }} />

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
        </View>
        {trip.women_only && (
          <View style={styles.womenOnlyBadge}>
            <Text style={styles.womenOnlyText}>Women only</Text>
          </View>
        )}
      </View>

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
            <Text style={styles.routeText}>Pickup point</Text>
            <View style={styles.routeSpacer} />
            <Text style={styles.routeLabel}>Destination</Text>
            <Text style={styles.routeText}>Drop-off point</Text>
          </View>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>{timeStr}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Seats left</Text>
            <Text style={styles.detailValue}>{trip.seats_left} of {trip.seats_total}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Cost per rider</Text>
            <Text style={styles.detailValue}>${trip.cost_estimate.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Note Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add a note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Introduce yourself or mention luggage, etc."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
          textAlignVertical="top"
        />
      </View>

      {/* Join Button */}
      <TouchableOpacity
        style={[styles.joinButton, joining && styles.joinButtonDisabled]}
        onPress={handleJoin}
        disabled={joining}
        activeOpacity={0.8}
      >
        {joining ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="hand-right-outline" size={20} color={colors.white} />
            <Text style={styles.joinButtonText}>Join Ride</Text>
          </>
        )}
      </TouchableOpacity>
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
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
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
    marginTop: 2,
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
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: colors.white,
  },
});
