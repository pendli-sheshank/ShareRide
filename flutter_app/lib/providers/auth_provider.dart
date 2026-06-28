import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/auth_service.dart';
import '../services/supabase_service.dart';

// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(SupabaseService.client);
});

// Auth state stream provider
final authStateStreamProvider = StreamProvider<AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges;
});

// Current user provider
final currentUserProvider = StreamProvider<User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges.map((state) => state.session?.user);
});

// Current session provider
final currentSessionProvider = StreamProvider<Session?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges.map((state) => state.session);
});

// User authenticated state
final isAuthenticatedProvider = StreamProvider<bool>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges.map((state) => state.session != null);
});

// User profile provider
final userProfileProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final user = await ref.watch(currentUserProvider.future);
  if (user == null) return null;

  final supabaseService = SupabaseService();
  return supabaseService.getCurrentUserProfile();
});

// OTP login notifier
class OtpLoginNotifier extends StateNotifier<AsyncValue<void>> {
  final AuthService authService;

  OtpLoginNotifier(this.authService) : super(const AsyncValue.data(null));

  Future<void> sendOtp(String email) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => authService.signInWithOtp(email));
  }
}

final otpLoginProvider = StateNotifierProvider.autoDispose<OtpLoginNotifier, AsyncValue<void>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return OtpLoginNotifier(authService);
});

// OTP verification notifier
class OtpVerificationNotifier extends StateNotifier<AsyncValue<void>> {
  final AuthService authService;

  OtpVerificationNotifier(this.authService) : super(const AsyncValue.data(null));

  Future<void> verifyOtp({
    required String email,
    required String token,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => authService.verifyOtp(email: email, token: token).then((_) {}),
    );
  }
}

final otpVerificationProvider = StateNotifierProvider.autoDispose<OtpVerificationNotifier, AsyncValue<void>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return OtpVerificationNotifier(authService);
});

// Logout notifier
class LogoutNotifier extends StateNotifier<AsyncValue<void>> {
  final AuthService authService;

  LogoutNotifier(this.authService) : super(const AsyncValue.data(null));

  Future<void> logout() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => authService.logout());
  }
}

final logoutProvider = StateNotifierProvider.autoDispose<LogoutNotifier, AsyncValue<void>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return LogoutNotifier(authService);
});
