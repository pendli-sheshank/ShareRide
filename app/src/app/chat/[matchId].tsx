import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { ChatMessage } from "../../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

export default function ChatConversationScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const fetchMessages = useCallback(async () => {
    if (!matchId) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("match_id", matchId)
      .order("sent_at", { ascending: true });

    if (!error && data) {
      setMessages(data as ChatMessage[]);
    }
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel("chat:" + matchId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "match_id=eq." + matchId,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const handleSend = async () => {
    const body = inputText.trim();
    if (!body || !user || !matchId || sending) return;

    setSending(true);
    setInputText("");

    const purgeAfter = new Date();
    purgeAfter.setDate(purgeAfter.getDate() + 30);

    const { error } = await supabase.from("chat_messages").insert({
      sender_id: user.id,
      match_id: matchId,
      body,
      purge_after: purgeAfter.toISOString(),
    });

    if (error) {
      setInputText(body);
    }

    setSending(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
          {item.body}
        </Text>
        <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
          {new Date(item.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Chat" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: "Chat" }} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "78%",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ownBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    borderBottomLeftRadius: borderRadius.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  ownText: {
    color: colors.white,
  },
  otherText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: fontSizes.xs - 1,
    marginTop: spacing.xs,
  },
  ownTime: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  otherTime: {
    color: colors.textLight,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
});
