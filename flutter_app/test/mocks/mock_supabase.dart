import 'package:mockito/mockito.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MockSupabaseClient extends Mock implements SupabaseClient {}

class MockGotrueClient extends Mock implements GoTrueClient {
  @override
  User? get currentUser => MockUser();

  @override
  Session? get currentSession => MockSession();
}

class MockPostgrestQueryBuilder extends Mock implements PostgrestQueryBuilder {}

class MockPostgrestTransformBuilder extends Mock
    implements PostgrestTransformBuilder {}

class MockPostgrestFilterBuilder extends Mock
    implements PostgrestFilterBuilder {}

class MockPostgrestList extends Mock implements PostgrestList {}

class MockUser extends Mock implements User {
  @override
  String get id => 'test-user-id';

  @override
  String get email => 'test@example.com';
}

class MockSession extends Mock implements Session {
  @override
  String get accessToken => 'test-access-token';

  @override
  String get refreshToken => 'test-refresh-token';

  @override
  User get user => MockUser();
}

// Helper function to create mock Supabase client with defaults
MockSupabaseClient createMockSupabaseClient() {
  final mockClient = MockSupabaseClient();
  final mockAuth = MockGotrueClient();

  when(mockClient.auth).thenReturn(mockAuth);
  when(mockAuth.currentUser).thenReturn(MockUser());
  when(mockAuth.currentSession).thenReturn(MockSession());

  return mockClient;
}
