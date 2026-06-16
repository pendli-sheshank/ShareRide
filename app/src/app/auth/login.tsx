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
import { supabase } from "../../lib/supabase";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setOtpSent(true);
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp,
      type: "email",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>SawaariShare</Text>
        <Text style={styles.subtitle}>Share rides, split costs</Text>

        <View style={styles.form}>
          {!otpSent ? (
            <>
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
                onPress={sendOtp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Sending..." : "Send Code"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.sentBanner}>
                <Text style={styles.sentText}>
                  We sent a 6-digit code to
                </Text>
                <Text style={styles.sentEmail}>{email.trim().toLowerCase()}</Text>
              </View>

              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor={colors.textLight}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={verifyOtp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                <Text style={styles.linkText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}
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
  title: {
    fontSize: fontSizes.title,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.sm,
  },
  sentBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sentText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  sentEmail: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    marginTop: 2,
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
  otpInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: fontSizes.xl,
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
