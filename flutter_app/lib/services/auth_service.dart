import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient client;

  AuthService(this.client);

  /// Sign in with email and password
  Future<AuthResponse> signInWithPassword({
    required String email,
    required String password,
  }) async {
    try {
      return await client.auth.signInWithPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      throw Exception('Failed to sign in: $e');
    }
  }

  /// Get current user
  User? get currentUser => client.auth.currentUser;

  /// Get current session
  Session? get currentSession => client.auth.currentSession;

  /// Check if user is authenticated
  bool get isAuthenticated => currentUser != null;

  /// Logout
  Future<void> logout() async {
    try {
      await client.auth.signOut();
    } catch (e) {
      throw Exception('Failed to logout: $e');
    }
  }

  /// Refresh session
  Future<AuthResponse> refreshSession() async {
    try {
      final response = await client.auth.refreshSession();
      return response;
    } catch (e) {
      throw Exception('Failed to refresh session: $e');
    }
  }

  /// Auth state changes stream
  Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;
}
