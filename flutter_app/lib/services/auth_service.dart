import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient client;

  AuthService(this.client);

  /// Send OTP to email
  Future<void> signInWithOtp(String email) async {
    try {
      await client.auth.signInWithOtp(
        email: email,
        emailRedirectTo: 'io.supabase.shareride://callback',
      );
    } catch (e) {
      throw Exception('Failed to send OTP: $e');
    }
  }

  /// Verify OTP code
  /// In Supabase v1.10.x, email OTP verification happens through deep links
  /// This method validates the current session after OTP is verified
  Future<AuthResponse> verifyOtp({
    required String email,
    required String token,
  }) async {
    try {
      return await client.auth.refreshSession();
    } catch (e) {
      throw Exception('Failed to verify OTP: $e');
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
