import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'auth/otp_verification_screen.dart';
import 'widgets/app_shell.dart';
import '../screens/tabs/browse_rides_screen.dart';
import '../screens/tabs/my_rides_screen.dart';
import '../screens/tabs/post_ride_screen.dart';
import '../screens/tabs/chat_screen.dart';
import '../screens/tabs/profile_screen.dart';
import '../screens/trip/trip_detail_screen.dart';
import '../screens/chat/chat_detail_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateStreamProvider);

  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      // Handle auth redirection
      final isLoggingIn = state.matchedLocation == '/auth/login' ||
          state.matchedLocation == '/auth/verify';

      return authState.when(
        data: (authState) {
          final isSignedIn = authState.session != null;

          if (!isSignedIn && !isLoggingIn) {
            return '/auth/login';
          }

          if (isSignedIn && isLoggingIn) {
            return '/';
          }

          return null;
        },
        loading: () => null,
        error: (_, __) => null,
      );
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/verify',
        builder: (context, state) {
          final email = state.extra as String?;
          return OtpVerificationScreen(email: email ?? '');
        },
      ),
      // Main app shell with tabs
      ShellRoute(
        builder: (context, state, child) {
          return AppShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            name: 'browse',
            builder: (context, state) => const BrowseRidesScreen(),
          ),
          GoRoute(
            path: '/myrides',
            name: 'myrides',
            builder: (context, state) => const MyRidesScreen(),
          ),
          GoRoute(
            path: '/post',
            name: 'post',
            builder: (context, state) => const PostRideScreen(),
          ),
          GoRoute(
            path: '/chat',
            name: 'chat',
            builder: (context, state) => const ChatScreen(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      // Trip detail route
      GoRoute(
        path: '/trip/:id',
        name: 'trip-detail',
        builder: (context, state) {
          final tripId = state.pathParameters['id'] ?? '';
          return TripDetailScreen(tripId: tripId);
        },
      ),
      // Chat detail route
      GoRoute(
        path: '/chat/:matchId',
        name: 'chat-detail',
        builder: (context, state) {
          final matchId = state.pathParameters['matchId'] ?? '';
          return ChatDetailScreen(matchId: matchId);
        },
      ),
    ],
  );
});
