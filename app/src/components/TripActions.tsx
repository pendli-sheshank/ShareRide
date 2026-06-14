import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

interface TripActionsProps {
  offerId: string;
  matchId: string | null;
  matchStatus: string | null;
  isHost: boolean;
  hostId: string;
  onRefresh: () => void;
}

export function TripActions({
  offerId,
  matchId,
  matchStatus,
  isHost,
  onRefresh,
}: TripActionsProps) {
  const [loading, setLoading] = useState(false);

  const updateMatchStatus = async (status: string) => {
    if (!matchId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("trip_matches")
        .update({ status })
        .eq("id", matchId);
      if (error) throw error;
      onRefresh();
    } catch {
      Alert.alert("Error", "Could not update trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    Alert.alert("Accept Rider", "Confirm this rider for your trip?", [
      { text: "Cancel", style: "cancel" },
      { text: "Accept", onPress: () => updateMatchStatus("confirmed") },
    ]);
  };

  const handleDecline = () => {
    Alert.alert("Decline Rider", "Are you sure you want to decline?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: () => updateMatchStatus("declined"),
      },
    ]);
  };

  const handleComplete = async () => {
    if (!matchId) return;
    Alert.alert(
      "Complete Trip",
      "Mark this trip as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setLoading(true);
            try {
              const { error: matchError } = await supabase
                .from("trip_matches")
                .update({ status: "completed" })
                .eq("id", matchId);
              if (matchError) throw matchError;

              const { error: offerError } = await supabase
                .from("trip_offers")
                .update({ status: "completed" })
                .eq("id", offerId);
              if (offerError) throw offerError;

              onRefresh();
            } catch {
              Alert.alert(
                "Error",
                "Could not complete trip. Please try again.",
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel your ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => updateMatchStatus("cancelled"),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Host: pending match */}
      {isHost && matchStatus === "pending" && (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={colors.error}
              style={styles.buttonIcon}
            />
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Host: confirmed match */}
      {isHost && matchStatus === "confirmed" && (
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={handleComplete}
          activeOpacity={0.7}
        >
          <Ionicons
            name="flag-outline"
            size={20}
            color={colors.white}
            style={styles.buttonIcon}
          />
          <Text style={styles.completeText}>Complete Trip</Text>
        </TouchableOpacity>
      )}

      {/* Rider: confirmed match */}
      {!isHost && matchStatus === "confirmed" && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close-outline"
            size={20}
            color={colors.error}
            style={styles.buttonIcon}
          />
          <Text style={styles.cancelText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}

      {/* Rider: completed match */}
      {!isHost && matchStatus === "completed" && (
        <View style={styles.ratingPrompt}>
          <Ionicons
            name="star-outline"
            size={20}
            color={colors.star}
            style={styles.buttonIcon}
          />
          <Text style={styles.ratingText}>Leave a rating</Text>
        </View>
      )}

      {/* Report button - always visible */}
      <TouchableOpacity style={styles.reportButton} activeOpacity={0.7}>
        <Ionicons name="flag-outline" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.white,
  },
  declineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  declineText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.error,
  },
  completeButton: {
    backgroundColor: colors.secondary,
  },
  completeText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  cancelText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.error,
  },
  ratingPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  ratingText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.star,
  },
  reportButton: {
    position: "absolute",
    top: spacing.md,
    right: 0,
    padding: spacing.xs,
  },
});
