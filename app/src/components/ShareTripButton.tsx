import React from "react";
import { Share, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

export interface ShareTripOffer {
  host_name: string;
  vehicle_make_model: string;
  vehicle_color: string;
  vehicle_plate_no: string;
  origin_label: string;
  dest_label: string;
  depart_at: string;
  cost_estimate: number;
  share_token: string;
}

interface ShareTripButtonProps {
  offer: ShareTripOffer;
  variant?: "icon" | "full";
}

export function ShareTripButton({ offer, variant = "icon" }: ShareTripButtonProps) {
  const handleShare = async () => {
    const departDate = new Date(offer.depart_at);
    const dateStr = departDate.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeStr = departDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = [
      `Ride with ${offer.host_name}`,
      `${offer.origin_label} → ${offer.dest_label}`,
      `${dateStr} at ${timeStr}`,
      `Vehicle: ${offer.vehicle_make_model} (${offer.vehicle_color}) - ${offer.vehicle_plate_no}`,
      `Est. cost: $${offer.cost_estimate.toFixed(0)}/rider`,
      "",
      `View trip: com.sawaarishare://trip/${offer.share_token}`,
    ].join("\n");

    try {
      await Share.share({ message });
    } catch {
      // user cancelled or share failed silently
    }
  };

  if (variant === "full") {
    return (
      <TouchableOpacity style={styles.fullButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={20} color={colors.white} />
        <Text style={styles.fullButtonText}>Share Trip Details</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
      <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  fullButtonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.white,
  },
});
