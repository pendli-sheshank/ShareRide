import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VerifiedTier } from "../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

type BadgeSize = "sm" | "md";

interface VerificationBadgeProps {
  tier: VerifiedTier;
  size?: BadgeSize;
}

const tierConfig: Record<
  VerifiedTier,
  {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    color: string;
    label: string;
    shortLabel: string;
  }
> = {
  email_only: {
    icon: "shield-outline",
    color: colors.textLight,
    label: "Email Verified",
    shortLabel: "Email",
  },
  vouched: {
    icon: "shield-checkmark",
    color: "#3B82F6",
    label: "Vouched",
    shortLabel: "Vouched",
  },
  id_verified: {
    icon: "shield-checkmark",
    color: colors.success,
    label: "ID Verified",
    shortLabel: "ID Verified",
  },
};

export function VerificationBadge({ tier, size = "sm" }: VerificationBadgeProps) {
  const config = tierConfig[tier];
  const iconSize = size === "sm" ? 14 : 18;
  const textStyle = size === "sm" ? styles.textSm : styles.textMd;
  const label = size === "sm" ? config.shortLabel : config.label;

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: config.color + "15" },
        size === "md" && styles.pillMd,
      ]}
    >
      <Ionicons name={config.icon} size={iconSize} color={config.color} />
      <Text style={[textStyle, { color: config.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  pillMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  textSm: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  textMd: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
});
