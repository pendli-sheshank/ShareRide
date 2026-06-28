# ShareRide Flutter App - Testing Guide

## Overview

This document describes the testing infrastructure for the ShareRide Flutter app, including unit tests, widget tests, integration tests, and performance benchmarks.

## Test Structure

```
test/
├── services/              # Unit tests for business logic
│   ├── auth_service_test.dart
│   ├── trips_service_test.dart
│   ├── chat_service_test.dart
│   ├── matches_service_test.dart
│   └── ratings_service_test.dart
├── widgets/               # Widget/component tests
│   └── trip_card_test.dart
├── mocks/                 # Mock objects
│   └── mock_supabase.dart
├── fixtures/              # Sample data for tests
│   └── sample_data.dart
├── test_helpers.dart      # Testing utilities
├── performance_test.dart  # Performance benchmarks
└── auth_service_test.dart # Auth tests (Phase 1)

integration_test/
└── app_flow_test.dart     # End-to-end user flows
```

## Running Tests

### Run All Tests
```bash
flutter test
```

### Run Specific Test File
```bash
flutter test test/services/trips_service_test.dart
```

### Run with Coverage
```bash
flutter test --coverage
# Coverage report in coverage/lcov.info
```

### Run Integration Tests
```bash
flutter test integration_test/app_flow_test.dart
# Or on device:
flutter test -d <device-id> integration_test/
```

### Run Performance Tests
```bash
flutter test test/performance_test.dart
```

## Test Coverage Goals

| Component | Target Coverage | Status |
|-----------|-----------------|--------|
| Services | 80%+ | ⏳ In Progress |
| Models | 100% | ✅ Complete |
| Providers | 75%+ | ⏳ In Progress |
| Widgets | 70%+ | ✅ Started |
| Screens | 60%+ | ⏳ Planned |
| **Overall** | **75%+** | ⏳ Target |

## Test Categories

### Unit Tests (Services)

Test business logic in isolation using mocks:

- **AuthService**: OTP login, session management, logout
- **TripsService**: Query offers/requests, create/cancel
- **ChatService**: Send/receive messages, real-time subscriptions
- **MatchesService**: Join trips, accept/reject, status management
- **RatingsService**: Submit ratings, calculate averages, prevent duplicates

**Location**: `test/services/`

**Command**: `flutter test test/services/`

### Widget Tests (UI Components)

Test UI rendering and interactions:

- **TripCard**: Display trip info, handle join action
- **RatingModal**: 5-star selection, review input
- **ReportModal**: Reason dropdown, description input
- **Status badges**: Display match status colors

**Location**: `test/widgets/`

**Command**: `flutter test test/widgets/`

**Tips**:
- Use `testWidgets()` for async widget tests
- Use `pumpWidget()` helper to settle widgets
- Mock Riverpod providers for state tests

### Integration Tests (E2E Flows)

Test complete user journeys:

1. **Login Flow**
   - See login screen
   - Enter email
   - Receive OTP
   - Verify code
   - Navigate to home

2. **Browse & Join Flow**
   - View available rides
   - Select trip
   - See details
   - Join trip
   - Confirm match

3. **Post Trip Flow**
   - Navigate to Post tab
   - Fill route info
   - Select time
   - Enter cost/seats
   - Submit

4. **Chat Flow**
   - Open match
   - Send message
   - Receive message
   - Verify real-time update

5. **Rating Flow**
   - Complete trip
   - Open rating modal
   - Submit 5-star rating
   - Verify in profile

**Location**: `integration_test/app_flow_test.dart`

**Command**: `flutter test integration_test/`

### Performance Tests

Benchmark critical operations:

| Operation | Target | Method |
|-----------|--------|--------|
| Sign in OTP | <2s | `measureAuthTime()` |
| Fetch trips | <3s | `measureQueryTime()` |
| Send message | <500ms | `measureLatency()` |
| App startup | <3s | Cold start timer |
| List scroll | >50fps | Frame rate monitor |
| Memory | <200MB | Memory profiler |

**Location**: `test/performance_test.dart`

**Command**: `flutter test test/performance_test.dart`

## Test Utilities

### Test Helpers (`test/test_helpers.dart`)

Reusable functions for common testing tasks:

```dart
// Wrap widget with providers
testableWidget(widget);

// Pump and settle
pumpWidget(tester, widget);

// Find and tap by text
tapText(tester, 'Join');

// Measure build time
Duration time = await measureBuildTime(tester, widget);

// Measure animation performance
Duration animTime = await measureAnimationTime(tester, widget);
```

### Mock Supabase (`test/mocks/mock_supabase.dart`)

Pre-configured mock Supabase client:

```dart
final mockClient = createMockSupabaseClient();
when(mockClient.auth.currentUser).thenReturn(MockUser());
```

### Sample Data (`test/fixtures/sample_data.dart`)

Pre-made test data:

```dart
final trips = sampleTripOffers;
final messages = sampleChatMessages;
final ratings = sampleRatings;
```

## Writing New Tests

### Unit Test Template

```dart
group('FeatureService', () {
  late FeatureService service;
  late MockSupabaseClient mockClient;

  setUp(() {
    mockClient = createMockSupabaseClient();
    service = FeatureService(mockClient);
  });

  test('does something', () async {
    // Arrange
    when(mockClient.from('table').select())
        .thenAnswer((_) async => [{'id': '1'}]);

    // Act
    final result = await service.fetch();

    // Assert
    expect(result, isNotEmpty);
    verify(mockClient.from('table').select()).called(1);
  });
});
```

### Widget Test Template

```dart
testWidgets('Widget displays text', (WidgetTester tester) async {
  await pumpWidget(tester, TestWidget());

  expect(find.text('Expected'), findsOneWidget);
  await tapText(tester, 'Button');
  expect(find.text('Updated'), findsOneWidget);
});
```

### Integration Test Template

```dart
testWidgets('User flow', (WidgetTester tester) async {
  await tester.pumpWidget(ShareRideApp());

  // Step 1: Login
  await enterText(tester, 'email@example.com');
  await tapText(tester, 'Send Code');

  // Step 2: Verify
  await waitForFuture(tester);
  expect(find.text('Enter Code'), findsOneWidget);
});
```

## Continuous Integration

### GitHub Actions

Run tests automatically on:
- Push to any branch
- Pull requests

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: subosito/flutter-action@v1
      - run: flutter test
      - run: flutter test --coverage
```

### Pre-commit Hook

Run tests before committing:

```bash
#!/bin/bash
flutter test || exit 1
```

## Monitoring & CI/CD

### Test Metrics

Track in CI/CD:
- Pass rate (target: 100%)
- Coverage % (target: 75%+)
- Build time
- Test execution time

### Performance Metrics

Monitor in production:
- App startup time (target: <3s)
- Screen transition time (target: <500ms)
- API response time (target: <2s)
- Message latency (target: <500ms)
- Memory usage (target: <200MB)
- CPU usage (target: <50% average)

### Crash Reporting

- All crashes logged to Sentry
- Monitor dashboard: sentry.io
- Alert on crash rate spike
- Auto-create issues for new crash patterns

## Troubleshooting

### Tests Hang

```bash
# Increase timeout
flutter test --verbose --timeout=30s
```

### Mock Issues

```dart
// Reset mocks between tests
reset(mockClient);
```

### Platform-Specific Issues

```bash
# Test on specific platform
flutter test -d android
flutter test -d ios
```

## Resources

- [Flutter Testing Docs](https://flutter.dev/docs/testing)
- [Mockito Guide](https://pub.dev/packages/mockito)
- [Integration Testing](https://flutter.dev/docs/testing/integration-tests)
- [Performance Profiling](https://flutter.dev/docs/perf)
- [Sentry Docs](https://docs.sentry.io/platforms/dart)

## Next Steps

- [ ] Expand unit test coverage to 80%+
- [ ] Add widget tests for all screens
- [ ] Implement integration tests for all flows
- [ ] Set up CI/CD pipeline
- [ ] Configure performance monitoring
- [ ] Create crash reporting dashboard
- [ ] Implement automated performance regression detection
