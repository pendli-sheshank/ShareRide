import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

export default function OnboardingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function completeProfile() {
    if (!firstName.trim() || !lastInitial.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("users").upsert({
      id: user?.id,
      first_name: firstName.trim(),
      last_initial: lastInitial.trim().charAt(0).toUpperCase(),
      verified_tier: inviteCode ? "vouched" : "email_only",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Set up your profile to get started</Text>

      <View style={styles.form}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your first name"
          placeholderTextColor={colors.textLight}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Last Initial</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. S"
          placeholderTextColor={colors.textLight}
          value={lastInitial}
          onChangeText={setLastInitial}
          maxLength={1}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Invite Code (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter invite code"
          placeholderTextColor={colors.textLight}
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={completeProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Setting up..." : "Continue"}
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.sm,
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
