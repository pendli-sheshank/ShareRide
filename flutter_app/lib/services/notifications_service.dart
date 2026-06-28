import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationsService {
  final SupabaseClient client;
  final FirebaseMessaging firebaseMessaging;

  NotificationsService({required this.client, required this.firebaseMessaging});

  Future<void> initialize() async {
    // Request permission
    await firebaseMessaging.requestPermission(
      alert: true,
      announcement: true,
      badge: true,
      criticalAlert: true,
      provisional: true,
      sound: true,
    );

    // Get FCM token
    final token = await firebaseMessaging.getToken();
    if (token != null) {
      await _updateUserToken(token);
    }

    // Listen for token refresh
    firebaseMessaging.onTokenRefresh.listen((token) {
      _updateUserToken(token);
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _handleMessage(message);
    });

    // Handle background messages
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleMessage(message);
    });
  }

  Future<void> _updateUserToken(String token) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) return;

    try {
      await client.from('users').update({'push_token': token}).eq('id', userId);
    } catch (e) {
      print('Failed to update push token: $e');
    }
  }

  void _handleMessage(RemoteMessage message) {
    // Handle notification
    if (message.notification != null) {
      print('Notification: ${message.notification!.title}');
      print('Body: ${message.notification!.body}');
    }

    // Handle data
    if (message.data.isNotEmpty) {
      print('Data: ${message.data}');
      // Parse and handle notification type
      final type = message.data['type'];
      switch (type) {
        case 'match_joined':
          // User joined your trip
          break;
        case 'match_accepted':
          // Host accepted your join request
          break;
        case 'new_message':
          // New message in chat
          break;
        case 'trip_reminder':
          // Trip reminder
          break;
      }
    }
  }

  Future<void> subscribeToTopic(String topic) async {
    await firebaseMessaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await firebaseMessaging.unsubscribeFromTopic(topic);
  }
}
