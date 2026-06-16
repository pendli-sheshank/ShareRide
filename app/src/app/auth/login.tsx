import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        // Supabase will redirect to this URL after verifying the magic link.
        // The app intercepts com.sawaarishare://auth via useMagicLinkHandler.
        emailRedirectTo: "com.sawaarishare://auth",
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setLinkSent(true);
  }

  if (linkSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            We sent a sign-in link to
          </Text>
          <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>
          <Text style={styles.instructions}>
            Tap the link in the email — the app will open and sign you in automatically.
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setLinkSent(false);
              setEmail("");
            }}
          >
            <Text style={styles.linkText}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.appTitle}>SawaariShare</Text>
        <Text style={styles.tagline}>Share rides, split costs</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@university.edu"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={sendMagicLink}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending…" : "Send Magic Link"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Contributions cover trip costs only. This platform does not provide transportation services.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  appTitle: {
    fontSize: fontSizes.title,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  tagline: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emailHighlight: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginTop: 2,
    marginBottom: spacing.md,
  },
  instructions: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
  },
  disclaimer: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.xxl,
    lineHeight: 18,
  },
});
