import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../constants/theme.dart';
import '../../providers/chat_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/matches_provider.dart';

class ChatDetailScreen extends ConsumerStatefulWidget {
  final String matchId;

  const ChatDetailScreen({
    Key? key,
    required this.matchId,
  }) : super(key: key);

  @override
  ConsumerState<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends ConsumerState<ChatDetailScreen> {
  late TextEditingController messageController;
  late ScrollController scrollController;

  @override
  void initState() {
    super.initState();
    messageController = TextEditingController();
    scrollController = ScrollController();
  }

  @override
  void dispose() {
    messageController.dispose();
    scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final message = messageController.text.trim();
    if (message.isEmpty) return;

    ref.read(sendMessageProvider.notifier).sendMessage(
      matchId: widget.matchId,
      body: message,
    );

    messageController.clear();
    // Scroll to bottom
    Future.delayed(const Duration(milliseconds: 100), () {
      scrollController.animateTo(
        scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(chatMessagesProvider(widget.matchId));
    final matchAsync = ref.watch(matchProvider(widget.matchId));
    final currentUserAsync = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: matchAsync.when(
          data: (match) {
            if (match == null) return const Text('Chat');
            final otherUserId = currentUserAsync.maybeWhen(
              data: (user) => user?.id,
              orElse: () => null,
            );
            final otherUser = match.riderId == otherUserId
                ? match.host
                : match.rider;
            return Text(
              otherUser?['display_name'] as String? ?? 'Chat',
            );
          },
          orElse: () => const Text('Chat'),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: messagesAsync.when(
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(
                    child: Text(
                      'No messages yet. Start the conversation!',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  controller: scrollController,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    final isOwnMessage = currentUserAsync.maybeWhen(
                      data: (user) => message.senderId == user?.id,
                      orElse: () => false,
                    );

                    return _buildMessageBubble(message, isOwnMessage);
                  },
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stackTrace) => Center(
                child: Text('Error loading messages: $error'),
              ),
            ),
          ),

          // Message input
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border(
                top: BorderSide(color: AppColors.border),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                FloatingActionButton(
                  mini: true,
                  onPressed: _sendMessage,
                  child: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(message, bool isOwn) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Align(
        alignment: isOwn ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.7,
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            color: isOwn ? AppColors.primary : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            crossAxisAlignment:
                isOwn ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Text(
                message.body,
                style: AppTypography.bodyMedium.copyWith(
                  color: isOwn ? Colors.white : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                _formatMessageTime(message.createdAt),
                style: AppTypography.bodySmall.copyWith(
                  color: isOwn
                      ? Colors.white.withOpacity(0.7)
                      : AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatMessageTime(DateTime dateTime) {
    return '${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
