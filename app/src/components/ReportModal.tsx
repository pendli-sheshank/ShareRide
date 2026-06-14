import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

const REASONS = [
  "No-show",
  "Inappropriate behavior",
  "Unsafe driving",
  "Overcharging",
  "Harassment",
  "Other",
] as const;

type Reason = (typeof REASONS)[number];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedId: string;
  matchId: string | null;
}

export function ReportModal({
  visible,
  onClose,
  reportedId,
  matchId,
}: ReportModalProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const [blockUser, setBlockUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setSelectedReason(null);
    setDetails("");
    setBlockUser(false);
  };

  const handleSubmit = async () => {
    if (!selectedReason || !user) return;

    setSubmitting(true);
    try {
      const reason =
        selectedReason === "Other" && details.trim()
          ? `Other: ${details.trim()}`
          : selectedReason;

      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_id: reportedId,
        match_id: matchId,
        reason,
        status: "pending",
      });

      if (error) throw error;

      if (blockUser) {
        Alert.alert(
          "User Blocked",
          "You will no longer see trips from this user.",
        );
      }

      Alert.alert("Report Submitted", "Thank you. We will review your report.");
      reset();
      onClose();
    } catch {
      Alert.alert("Error", "Could not submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Report User</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <Text style={styles.label}>What happened?</Text>
          <View style={styles.chipContainer}>
            {REASONS.map((reason) => {
              const active = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedReason === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Please describe what happened..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={details}
              onChangeText={setDetails}
            />
          )}

          <View style={styles.blockRow}>
            <View style={styles.blockLabelContainer}>
              <Ionicons
                name="ban-outline"
                size={20}
                color={colors.error}
                style={styles.blockIcon}
              />
              <Text style={styles.blockLabel}>Block this user</Text>
            </View>
            <Switch
              value={blockUser}
              onValueChange={setBlockUser}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={blockUser ? colors.primary : colors.white}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || submitting) && styles.submitDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || submitting}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.lg,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "20",
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  blockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  blockLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  blockIcon: {
    marginRight: spacing.sm,
  },
  blockLabel: {
    fontSize: fontSizes.md,
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.white,
  },
});
