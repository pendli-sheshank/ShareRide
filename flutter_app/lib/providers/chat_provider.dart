import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message.dart';
import '../services/chat_service.dart';
import '../services/supabase_service.dart';

// Chat service provider
final chatServiceProvider = Provider<ChatService>((ref) {
  return ChatService(SupabaseService.client);
});

// Chat messages stream (real-time)
final chatMessagesProvider = StreamProvider.family<List<ChatMessage>, String>((
  ref,
  matchId,
) {
  final chatService = ref.watch(chatServiceProvider);
  return chatService.streamChatMessages(matchId);
});

// Chat history (initial load)
final chatHistoryProvider = FutureProvider.family<List<ChatMessage>, String>((
  ref,
  matchId,
) async {
  final chatService = ref.watch(chatServiceProvider);
  return chatService.fetchChatMessages(matchId);
});

// Send message notifier
class SendMessageNotifier extends StateNotifier<AsyncValue<void>> {
  final ChatService chatService;

  SendMessageNotifier(this.chatService) : super(const AsyncValue.data(null));

  Future<void> sendMessage({
    required String matchId,
    required String body,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => chatService.sendMessage(matchId: matchId, body: body).then((_) {}),
    );
  }
}

final sendMessageProvider =
    StateNotifierProvider.autoDispose<SendMessageNotifier, AsyncValue<void>>((
      ref,
    ) {
      final chatService = ref.watch(chatServiceProvider);
      return SendMessageNotifier(chatService);
    });

// Latest message for a match (for preview in list)
final latestMessageProvider = FutureProvider.family<ChatMessage?, String>((
  ref,
  matchId,
) async {
  final chatService = ref.watch(chatServiceProvider);
  return chatService.getLatestMessage(matchId);
});

// Unread message count
final unreadCountProvider = FutureProvider.family<int, String>((
  ref,
  matchId,
) async {
  final chatService = ref.watch(chatServiceProvider);
  return chatService.getUnreadMessageCount(matchId);
});
