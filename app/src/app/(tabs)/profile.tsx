import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../types/database";
import { VerificationBadge } from "../../components/VerificationBadge";
import { NoShowIndicator } from "../../components/NoShowIndicator";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!authUser) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (data) setProfile(data as User);
  }, [authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  async function handleUploadId() {
    Alert.alert(
      "ID Verification",
      "ID verification coming soon. You will be able to upload a government-issued ID for manual review."
    );
  }

  async function handleInviteFriends() {
    if (!authUser) return;
    try {
      const { data, error } = await supabase
        .from("invites")
        .select("code")
        .eq("created_by", authUser.id)
        .is("used_by", null);

      if (error) {
        Alert.alert("Error", "Could not fetch invite codes.");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert("No Invites", "You have no unused invite codes available.");
        return;
      }

      const codes = data.map((inv) => inv.code).join("\n");
      Alert.alert(
        "Your Invite Codes",
        `Share these codes with friends:\n\n${codes}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Share",
            onPress: async () => {
              await Share.share({
                message: `Join SawaariShare! Use one of my invite codes:\n${codes}`,
              });
            },
          },
        ]
      );
    } catch {
      Alert.alert("Error", "Something went wrong.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={40} color={colors.white} />
        </View>
        <Text style={styles.name}>
          {profile?.first_name ?? "User"} {profile?.last_initial ?? ""}.
        </Text>
        <View style={styles.badgeRow}>
          <VerificationBadge
            tier={profile?.verified_tier ?? "phone_only"}
            size="md"
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {(profile?.rating_avg ?? 0).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.no_show_count ?? 0}</Text>
          <Text style={styles.statLabel}>No-shows</Text>
        </View>
      </View>

      <NoShowIndicator count={profile?.no_show_count ?? 0} />

      <View style={styles.menuSection}>
        <MenuItem icon="car-outline" label="My Vehicles" />
        <MenuItem icon="time-outline" label="Trip History" />
        <MenuItem
          icon="wallet-outline"
          label="Cost Recovery"
          onPress={() => router.push("/cost-recovery")}
        />
        <MenuItem
          icon="id-card-outline"
          label="Upload ID"
          onPress={handleUploadId}
        />
        <MenuItem
          icon="people-outline"
          label="Invite Friends"
          onPress={handleInviteFriends}
        />
        <MenuItem icon="settings-outline" label="Settings" />
        <MenuItem icon="help-circle-outline" label="Help & Support" />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.text} />
      <Text style={menuStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  menuSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  signOutText: {
    fontSize: fontSizes.md,
    color: colors.error,
    fontWeight: "600",
  },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
  },
});
