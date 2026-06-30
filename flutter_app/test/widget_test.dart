import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../lib/main.dart';

void main() {
  testWidgets('ShareRideApp renders without errors', (WidgetTester tester) async {
    // Build the app
    await tester.pumpWidget(const ProviderScope(child: ShareRideApp()));

    // Verify the app is rendered
    expect(find.byType(MaterialApp), findsWidgets);
  });
}
