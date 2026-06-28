import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_message.dart';

class ChatService {
  final SupabaseClient client;

  ChatService(this.client);

  // Fetch chat history
  Future<List<ChatMessage>> fetchChatMessages(String matchId) async {
    try {
      final response = await client
          .from('chat_messages')
          .select()
          .eq('match_id', matchId)
          .order('created_at', ascending: true);

      return (response as List)
          .map((m) => ChatMessage.fromJson(m as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch chat messages: $e');
    }
  }

  // Stream chat messages for real-time updates
  Stream<List<ChatMessage>> streamChatMessages(String matchId) {
    return client
        .from('chat_messages')
        .stream(primaryKey: ['id'])
        .eq('match_id', matchId)
        .order('created_at', ascending: true)
        .map(
          (messages) => (messages as List)
              .map((m) => ChatMessage.fromJson(m as Map<String, dynamic>))
              .toList(),
        );
  }

  // Send a message
  Future<ChatMessage> sendMessage({
    required String matchId,
    required String body,
  }) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client.from('chat_messages').insert({
        'match_id': matchId,
        'sender_id': userId,
        'body': body,
        'created_at': DateTime.now().toIso8601String(),
      }).select();

      return ChatMessage.fromJson(
        (response as List).first as Map<String, dynamic>,
      );
    } catch (e) {
      throw Exception('Failed to send message: $e');
    }
  }

  // Get latest message for a match (for preview)
  Future<ChatMessage?> getLatestMessage(String matchId) async {
    try {
      final response = await client
          .from('chat_messages')
          .select()
          .eq('match_id', matchId)
          .order('created_at', ascending: false)
          .limit(1);

      if ((response as List).isEmpty) return null;

      return ChatMessage.fromJson(response.first as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to get latest message: $e');
    }
  }

  // Mark messages as read
  Future<void> markMessagesAsRead(
    String matchId, {
    DateTime? beforeTime,
  }) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      var query = client
          .from('chat_messages')
          .update({'read_at': DateTime.now().toIso8601String()})
          .eq('match_id', matchId)
          .neq('sender_id', userId)
          .is_('read_at', null);

      if (beforeTime != null) {
        query = query.lt('created_at', beforeTime.toIso8601String());
      }

      await query;
    } catch (e) {
      throw Exception('Failed to mark messages as read: $e');
    }
  }

  // Get unread message count
  Future<int> getUnreadMessageCount(String matchId) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('chat_messages')
          .select('id')
          .eq('match_id', matchId)
          .neq('sender_id', userId)
          .is_('read_at', null);

      return (response as List).length;
    } catch (e) {
      throw Exception('Failed to get unread count: $e');
    }
  }
}
