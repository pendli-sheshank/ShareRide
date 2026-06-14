import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

interface NoShowIndicatorProps {
  count: number;
}

export function NoShowIndicator({ count }: NoShowIndicatorProps) {
  if (count === 0) return null;

  const isHigh = count >= 3;
  const pillColor = isHigh ? colors.error : colors.warning;
  const label = count === 1 ? "1 no-show" : `${count} no-shows`;

  return (
    <View style={[styles.pill, { backgroundColor: pillColor + "15" }]}>
      <Text style={[styles.text, { color: pillColor }]}>{"⚠"} {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
});
