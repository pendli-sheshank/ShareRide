import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes } from "../constants/theme";

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export function RatingStars({
  rating,
  size = 16,
  showValue = true,
}: RatingStarsProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.round(rating);
    return (
      <Ionicons
        key={i}
        name={filled ? "star" : "star-outline"}
        size={size}
        color={colors.star}
        style={i < 4 ? styles.starSpacing : undefined}
      />
    );
  });

  return (
    <View style={styles.container}>
      {stars}
      {showValue && (
        <Text style={[styles.value, { fontSize: size * 0.85 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starSpacing: {
    marginRight: 1,
  },
  value: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
});
