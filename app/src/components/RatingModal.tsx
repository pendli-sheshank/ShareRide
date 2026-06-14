import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { colors, spacing, fontSizes, borderRadius } from "../constants/theme";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  matchId: string;
  toUserId: string;
  toUserName: string;
  role: "host" | "rider";
}

export function RatingModal({
  visible,
  onClose,
  matchId,
  toUserId,
  toUserName,
  role,
}: RatingModalProps) {
  const { user } = useAuth();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStars(0);
    setComment("");
  };

  const handleSubmit = async () => {
    if (stars === 0 || !user) return;

    setSubmitting(true);
    try {
      const { error: ratingError } = await supabase.from("ratings").insert({
        match_id: matchId,
        from_user: user.id,
        to_user: toUserId,
        stars,
        comment: comment.trim() || null,
      });

      if (ratingError) throw ratingError;

      const ratedField =
        role === "host" ? "rated_by_rider" : "rated_by_host";
      const { error: matchError } = await supabase
        .from("trip_matches")
        .update({ [ratedField]: true })
        .eq("id", matchId);

      if (matchError) throw matchError;

      Alert.alert("Thanks!", `Your rating for ${toUserName} has been saved.`);
      reset();
      onClose();
    } catch {
      Alert.alert("Error", "Could not submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const ratingLabel = role === "host" ? "host" : "rider";

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate your {ratingLabel}</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.userName}>{toUserName}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setStars(value)}
                activeOpacity={0.7}
                style={styles.starButton}
              >
                <Ionicons
                  name={value <= stars ? "star" : "star-outline"}
                  size={40}
                  color={colors.star}
                />
              </TouchableOpacity>
            ))}
          </View>

          {stars > 0 && (
            <Text style={styles.starsLabel}>
              {stars === 1
                ? "Poor"
                : stars === 2
                  ? "Fair"
                  : stars === 3
                    ? "Good"
                    : stars === 4
                      ? "Great"
                      : "Excellent"}
            </Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Add a comment (optional)"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (stars === 0 || submitting) && styles.submitDisabled,
            ]}
            onPress={handleSubmit}
            disabled={stars === 0 || submitting}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitText}>Submit Rating</Text>
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
    padding: spacing.lg,
    alignItems: "center",
  },
  userName: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xl,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  starButton: {
    paddingHorizontal: spacing.xs,
  },
  starsLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: spacing.xl,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 80,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
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
