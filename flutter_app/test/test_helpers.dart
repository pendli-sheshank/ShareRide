import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

/// Helper to wrap widgets with required providers for testing
Widget testableWidget(Widget widget) {
  return MaterialApp(
    home: ProviderScope(
      child: widget,
    ),
  );
}

/// Helper to pump widget and settle animations
Future<void> pumpWidget(
  WidgetTester tester,
  Widget widget,
) async {
  await tester.pumpWidget(testableWidget(widget));
  await tester.pumpAndSettle();
}

/// Helper to find and tap a widget by text
Future<void> tapText(WidgetTester tester, String text) async {
  await tester.tap(find.text(text));
  await tester.pumpAndSettle();
}

/// Helper to find and enter text in a text field
Future<void> enterText(WidgetTester tester, String text) async {
  await tester.enterText(find.byType(TextField), text);
  await tester.pumpAndSettle();
}

/// Helper to wait for future to complete
Future<void> waitForFuture(WidgetTester tester) async {
  await tester.pumpAndSettle();
  await Future.delayed(const Duration(milliseconds: 100));
}

/// Helper to measure widget build time
Future<Duration> measureBuildTime(
  WidgetTester tester,
  Widget widget,
) async {
  final stopwatch = Stopwatch()..start();
  await pumpWidget(tester, widget);
  stopwatch.stop();
  return stopwatch.elapsed;
}

/// Helper to measure animation performance
Future<Duration> measureAnimationTime(
  WidgetTester tester,
  Widget widget,
) async {
  final stopwatch = Stopwatch()..start();
  await tester.pumpWidget(testableWidget(widget));
  // Run through animation frames
  for (int i = 0; i < 60; i++) {
    await tester.pump(const Duration(milliseconds: 16));
  }
  stopwatch.stop();
  return stopwatch.elapsed;
}
