import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { ChatMessage } from "../types/database";

export function useChat(matchId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("match_id", matchId)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      setMessages((data as ChatMessage[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!user) return;

      const purgeDate = new Date();
      purgeDate.setDate(purgeDate.getDate() + 30);

      const { error } = await supabase.from("chat_messages").insert({
        match_id: matchId,
        sender_id: user.id,
        body,
        purge_after: purgeDate.toISOString(),
      });

      if (error) throw error;
    },
    [matchId, user],
  );

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to new messages via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on<ChatMessage>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prev) => {
            // Deduplicate by id in case the message was already added
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return { messages, sendMessage, loading };
}
