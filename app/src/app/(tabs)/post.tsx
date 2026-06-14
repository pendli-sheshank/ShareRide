import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

type Mode = "offer" | "request";

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("offer");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departTime, setDepartTime] = useState("");
  const [seats, setSeats] = useState("3");
  const [tolls, setTolls] = useState("0");
  const [womenOnly, setWomenOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePost() {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert("Required", "Please enter origin and destination.");
      return;
    }

    setLoading(true);

    if (mode === "offer") {
      const { error } = await supabase.from("trip_offers").insert({
        host_id: user?.id,
        origin_geo: null,
        dest_geo: null,
        depart_at: departTime || new Date().toISOString(),
        seats_total: parseInt(seats) || 3,
        seats_left: parseInt(seats) || 3,
        tolls: parseFloat(tolls) || 0,
        women_only: womenOnly,
        status: "active",
      });

      setLoading(false);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Posted", "Your trip offer is live!");
        router.back();
      }
    } else {
      const { error } = await supabase.from("ride_requests").insert({
        rider_id: user?.id,
        pickup_geo: null,
        dest_geo: null,
        window_start: departTime || new Date().toISOString(),
        window_end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        seats_needed: parseInt(seats) || 1,
        status: "open",
      });

      setLoading(false);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Posted", "Your ride request is live!");
        router.back();
      }
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "offer" && styles.modeActive]}
          onPress={() => setMode("offer")}
        >
          <Ionicons
            name="car"
            size={18}
            color={mode === "offer" ? colors.white : colors.textSecondary}
          />
          <Text style={[styles.modeText, mode === "offer" && styles.modeTextActive]}>
            Offer a Ride
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === "request" && styles.modeActive]}
          onPress={() => setMode("request")}
        >
          <Ionicons
            name="hand-left"
            size={18}
            color={mode === "request" ? colors.white : colors.textSecondary}
          />
          <Text style={[styles.modeText, mode === "request" && styles.modeTextActive]}>
            Request a Ride
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>
          {mode === "offer" ? "Origin" : "Pickup Area"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor={colors.textLight}
          value={origin}
          onChangeText={setOrigin}
        />

        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          placeholderTextColor={colors.textLight}
          value={destination}
          onChangeText={setDestination}
        />

        <Text style={styles.label}>
          {mode === "offer" ? "Departure Time" : "Preferred Time"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 8:30 AM"
          placeholderTextColor={colors.textLight}
          value={departTime}
          onChangeText={setDepartTime}
        />

        <Text style={styles.label}>
          {mode === "offer" ? "Available Seats" : "Seats Needed"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={mode === "offer" ? "3" : "1"}
          placeholderTextColor={colors.textLight}
          value={seats}
          onChangeText={setSeats}
          keyboardType="number-pad"
          maxLength={1}
        />

        {mode === "offer" && (
          <>
            <Text style={styles.label}>Tolls & Parking ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textLight}
              value={tolls}
              onChangeText={setTolls}
              keyboardType="decimal-pad"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Women-only trip</Text>
              <Switch
                value={womenOnly}
                onValueChange={setWomenOnly}
                trackColor={{ true: colors.primaryLight, false: colors.border }}
                thumbColor={womenOnly ? colors.primary : colors.textLight}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Posting..."
              : mode === "offer"
                ? "Post Ride Offer"
                : "Post Ride Request"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  modeActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.white,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
});
