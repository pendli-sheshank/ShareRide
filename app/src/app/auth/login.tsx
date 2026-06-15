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
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

// Normalizes user input into E.164 format (e.g. "+1 (555) 000-0000" -> "+15550000000")
// since Supabase's phone auth rejects numbers containing spaces, dashes, or parentheses.
function toE164(phone: string): string {
  const digits = phone.trim().replace(/\D/g, "");
  return phone.trim().startsWith("+") ? `+${digits}` : `+1${digits}`;
}

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setOtpSent(true);
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: toE164(phone),
      token: otp,
      type: "sms",
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
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor={colors.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!otpSent}
          />

          {otpSent && (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={colors.textLight}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={otpSent ? verifyOtp : sendOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Please wait..." : otpSent ? "Verify Code" : "Send Code"}
            </Text>
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setOtpSent(false);
                setOtp("");
              }}
            >
              <Text style={styles.linkText}>Change phone number</Text>
            </TouchableOpacity>
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
