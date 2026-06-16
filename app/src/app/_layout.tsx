import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";
import { enableScreens } from "react-native-screens";
import { useAuth } from "../hooks/useAuth";
import { useMagicLinkHandler } from "../hooks/useMagicLinkHandler";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { colors, spacing } from "../constants/theme";
import { isSupabaseConfigured, supabaseUrlValid, supabaseKeyValid } from "../lib/supabase";

// react-native-screens' native UIViewController-backed screens crash on launch
// on iOS 26 (NSException in RNS*Controller native code, surfaced via the
// TurboModule bridge and aborting the process). Falling back to plain Views
// avoids that native code path entirely.
enableScreens(false);

// On the New Architecture, reporting an uncaught fatal JS error to native
// (RCTExceptionsManager.reportFatal) can itself throw inside the TurboModule
// bridge, escalating to an uncatchable SIGABRT with no JS diagnostics.
// Replacing the global handler with a plain console.error keeps the process
// alive so the ErrorBoundary below can show what actually failed.
if (typeof ErrorUtils !== "undefined") {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(isFatal ? "Fatal error:" : "Error:", error);
  });
}

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useMagicLinkHandler(); // intercepts com.sawaarishare://auth deep links

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!session && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, loading, segments]);

  if (!isSupabaseConfigured) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.error, textAlign: "center", marginBottom: spacing.sm }}>
          Configuration error
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xs }}>
          {"SUPABASE_URL: " + (supabaseUrlValid ? "✓ OK" : "✗ missing or not https://")}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
          {"SUPABASE_ANON_KEY: " + (supabaseKeyValid ? "✓ OK" : "✗ missing")}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textLight, textAlign: "center", marginTop: spacing.md }}>
          Set these in EAS Dashboard → Environment Variables → production
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Slot />
    </ErrorBoundary>
  );
}
