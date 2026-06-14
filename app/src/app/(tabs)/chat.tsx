import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

interface ChatThread {
  match_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);

  const fetchThreads = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("trip_matches")
      .select("id, offer_id, status")
      .or(`offer_id.in.(select id from trip_offers where host_id = '${user.id}'),request_id.in.(select id from ride_requests where rider_id = '${user.id}')`)
      .eq("status", "confirmed");

    if (data) {
      setThreads(
        data.map((match) => ({
          match_id: match.id,
          other_user_name: "Rider",
          last_message: "Tap to chat",
          last_message_at: new Date().toISOString(),
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.match_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.threadItem}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.white} />
            </View>
            <View style={styles.threadContent}>
              <Text style={styles.threadName}>{item.other_user_name}</Text>
              <Text style={styles.threadMessage} numberOfLines={1}>
                {item.last_message}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptyText}>
              Chat opens when a ride request is accepted
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  threadItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  threadContent: {
    flex: 1,
  },
  threadName: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
  },
  threadMessage: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
