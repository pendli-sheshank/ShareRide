import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'auth/otp_verification_screen.dart';
import 'widgets/app_shell.dart';

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
            builder: (context, state) => const Placeholder(
              child: Center(child: Text('Browse Rides Screen')),
            ),
          ),
          GoRoute(
            path: '/myrides',
            name: 'myrides',
            builder: (context, state) => const Placeholder(
              child: Center(child: Text('My Rides Screen')),
            ),
          ),
          GoRoute(
            path: '/post',
            name: 'post',
            builder: (context, state) => const Placeholder(
              child: Center(child: Text('Post Ride Screen')),
            ),
          ),
          GoRoute(
            path: '/chat',
            name: 'chat',
            builder: (context, state) => const Placeholder(
              child: Center(child: Text('Chat List Screen')),
            ),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const Placeholder(
              child: Center(child: Text('Profile Screen')),
            ),
          ),
        ],
      ),
      // Trip detail route
      GoRoute(
        path: '/trip/:id',
        name: 'trip-detail',
        builder: (context, state) {
          final tripId = state.pathParameters['id'] ?? '';
          return Placeholder(
            child: Center(child: Text('Trip Detail: $tripId')),
          );
        },
      ),
      // Chat detail route
      GoRoute(
        path: '/chat/:matchId',
        name: 'chat-detail',
        builder: (context, state) {
          final matchId = state.pathParameters['matchId'] ?? '';
          return Placeholder(
            child: Center(child: Text('Chat Detail: $matchId')),
          );
        },
      ),
    ],
  );
});
