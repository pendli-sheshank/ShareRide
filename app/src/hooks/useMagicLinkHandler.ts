import { useEffect } from "react";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

// Supabase puts tokens in the URL hash fragment after '#', not after '?'.
// Standard URLSearchParams / new URL() only parse the query string and
// ignore everything after '#', so we split on '#' ourselves.
function parseHashTokens(url: string): { access_token: string | null; refresh_token: string | null } {
  const hashStart = url.indexOf("#");
  if (hashStart === -1) return { access_token: null, refresh_token: null };

  const fragment = url.slice(hashStart + 1); // e.g. "access_token=xxx&refresh_token=yyy&type=magiclink"
  const params: Record<string, string> = {};
  fragment.split("&").forEach((pair) => {
    const eq = pair.indexOf("=");
    if (eq === -1) return;
    const key = decodeURIComponent(pair.slice(0, eq));
    const val = decodeURIComponent(pair.slice(eq + 1));
    params[key] = val;
  });

  return {
    access_token: params["access_token"] ?? null,
    refresh_token: params["refresh_token"] ?? null,
  };
}

async function handleIncomingUrl(url: string): Promise<void> {
  // Only process URLs targeted at our auth path.
  // Expected form: com.sawaarishare://auth#access_token=...&refresh_token=...
  if (!url.startsWith("com.sawaarishare://auth")) return;

  const { access_token, refresh_token } = parseHashTokens(url);

  if (!access_token || !refresh_token) {
    console.warn("[MagicLink] URL matched but tokens missing:", url);
    return;
  }

  // Establish the Supabase session with the extracted tokens.
  // On success, supabase.auth.onAuthStateChange fires SIGNED_IN,
  // which _layout.tsx's useAuth() picks up and navigates to /(tabs).
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    console.error("[MagicLink] setSession failed:", error.message);
    // TODO: surface error to the user (e.g. "Link expired, request a new one")
    return;
  }

  // Navigation is handled automatically: useAuth() in _layout.tsx detects
  // the new session and calls router.replace("/(tabs)").
}

export function useMagicLinkHandler(): void {
  useEffect(() => {
    // ── Cold start: app was fully closed when the link was tapped ──
    Linking.getInitialURL().then((url) => {
      if (url) handleIncomingUrl(url);
    });

    // ── Warm start: app was backgrounded when the link was tapped ──
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleIncomingUrl(url);
    });

    return () => subscription.remove();
  }, []);
}
