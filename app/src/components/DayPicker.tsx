import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fontSizes } from "../constants/theme";

const DAYS = [
  { code: "SU", label: "S" },
  { code: "MO", label: "M" },
  { code: "TU", label: "T" },
  { code: "WE", label: "W" },
  { code: "TH", label: "T" },
  { code: "FR", label: "F" },
  { code: "SA", label: "S" },
] as const;

interface DayPickerProps {
  selectedDays: string[];
  onToggle: (day: string) => void;
}

export function DayPicker({ selectedDays, onToggle }: DayPickerProps) {
  return (
    <View style={styles.container}>
      {DAYS.map(({ code, label }) => {
        const selected = selectedDays.includes(code);
        return (
          <TouchableOpacity
            key={code}
            style={[styles.circle, selected && styles.circleSelected]}
            onPress={() => onToggle(code)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const CIRCLE_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  circleSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.white,
  },
});
