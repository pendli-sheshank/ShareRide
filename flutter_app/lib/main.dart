import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app/routes.dart';
import 'constants/theme.dart';
import 'firebase_options.dart';
import 'services/feature_flags_service.dart';
import 'services/monitoring_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: '.env');

  // Initialize Supabase
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL'] ?? '',
    anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? '',
    authFlowType: AuthFlowType.pkce,
  );

  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize Feature Flags (Phase 5: Flutter rollout)
  try {
    await FeatureFlagsService().initialize();
  } catch (e) {
    print('Warning: Feature flags initialization failed: $e');
  }

  // Initialize Monitoring (crash reporting + performance)
  try {
    await MonitoringService().initialize();
  } catch (e) {
    print('Warning: Monitoring initialization failed: $e');
  }

  // Initialize Sentry for crash reporting
  await SentryFlutter.init(
    (options) {
      options.dsn = dotenv.env['SENTRY_DSN'];
      options.tracesSampleRate = 1.0;
      options.environment = const bool.fromEnvironment('dart.vm.profile')
          ? 'debug'
          : 'release';
    },
    appRunner: () => runApp(const ProviderScope(child: ShareRideApp())),
  );
}

// Handler for widget binding errors
class ErrorHandler {
  static void handleError(FlutterErrorDetails details) {
    // Log to Sentry
    Sentry.captureException(
      details.exception,
      stackTrace: details.stack,
    );
  }
}

class ShareRideApp extends ConsumerWidget {
  const ShareRideApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'ShareRide',
      theme: appTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
