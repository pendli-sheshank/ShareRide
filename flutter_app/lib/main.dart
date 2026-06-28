import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app/routes.dart';
import 'constants/theme.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables (use try-catch for CI/CD environments where .env might not exist)
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {
    // .env file not found or couldn't be loaded - use defaults/empty values
    // This is expected in CI/CD builds
  }

  // Initialize Supabase
  try {
    await Supabase.initialize(
      url: dotenv.env['SUPABASE_URL'] ?? '',
      anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? '',
      authFlowType: AuthFlowType.pkce,
    );
  } catch (e) {
    // Supabase initialization failed - will show error in app
    // This can happen in test/build environments without proper credentials
  }

  // Initialize Firebase
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    // Firebase initialization failed - continue without it (notifications won't work but app will run)
  }

  // Initialize Sentry for crash reporting
  try {
    await SentryFlutter.init((options) {
      options.dsn = dotenv.env['SENTRY_DSN'];
      options.tracesSampleRate = 1.0;
      options.environment =
          const bool.fromEnvironment('dart.vm.profile') ? 'debug' : 'release';
    }, appRunner: () => runApp(const ProviderScope(child: ShareRideApp())));
  } catch (e) {
    // Sentry initialization failed - run app without crash reporting
    runApp(const ProviderScope(child: ShareRideApp()));
  }
}

// Handler for widget binding errors
class ErrorHandler {
  static void handleError(FlutterErrorDetails details) {
    // Log to Sentry
    Sentry.captureException(details.exception, stackTrace: details.stack);
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
