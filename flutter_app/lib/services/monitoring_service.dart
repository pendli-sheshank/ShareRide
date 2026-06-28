import 'package:sentry_flutter/sentry_flutter.dart';

class MonitoringService {
  static final MonitoringService _instance = MonitoringService._internal();

  MonitoringService._internal();

  factory MonitoringService() {
    return _instance;
  }

  Future<void> initialize() async {
    // Performance monitoring is automatically enabled by Firebase
    // Sentry is initialized in main.dart with SentryFlutter.init
  }

  /// Track custom operation duration via breadcrumb
  Future<void> trackTrace(
    String name,
    Future<void> Function() operation, {
    Map<String, String>? attributes,
  }) async {
    final stopwatch = Stopwatch()..start();

    try {
      await operation();
      stopwatch.stop();
      logBreadcrumb(
        '$name completed in ${stopwatch.elapsedMilliseconds}ms',
        category: 'trace',
        level: 'info',
      );
    } catch (e) {
      stopwatch.stop();
      logBreadcrumb(
        '$name failed after ${stopwatch.elapsedMilliseconds}ms',
        category: 'trace',
        level: 'error',
      );
      rethrow;
    }
  }

  /// Track screen load time
  Future<void> trackScreenLoad(String screenName, Future<void> Function() operation) async {
    return trackTrace('screen_load_$screenName', operation, attributes: {
      'screen': screenName,
    });
  }

  /// Track API query duration
  Future<T> trackQuery<T>(
    String queryName,
    Future<T> Function() query,
  ) async {
    final stopwatch = Stopwatch()..start();

    try {
      final result = await query();
      stopwatch.stop();
      logBreadcrumb(
        'query_$queryName completed in ${stopwatch.elapsedMilliseconds}ms',
        category: 'query',
        level: 'info',
      );
      return result;
    } catch (e) {
      stopwatch.stop();
      logBreadcrumb(
        'query_$queryName failed after ${stopwatch.elapsedMilliseconds}ms',
        category: 'query',
        level: 'error',
      );
      rethrow;
    }
  }

  /// Track message send latency
  Future<void> trackMessageLatency(
    String matchId,
    Future<void> Function() sendOperation,
  ) async {
    return trackTrace('message_send_$matchId', sendOperation, attributes: {
      'match_id': matchId,
    });
  }

  /// Log breadcrumb for debugging
  void logBreadcrumb(
    String message, {
    String? category,
    String? level,
  }) {
    Sentry.captureMessage(
      message,
      level: level == 'error'
          ? SentryLevel.error
          : level == 'warning'
              ? SentryLevel.warning
              : SentryLevel.info,
    );
  }

  /// Capture exception with context
  Future<void> captureException(
    Object exception,
    StackTrace? stackTrace, {
    String? context,
  }) async {
    await Sentry.captureException(
      exception,
      stackTrace: stackTrace,
      withScope: (scope) {
        if (context != null) {
          scope.setContext('error_context', {'details': context});
        }
      },
    );
  }

  /// Record custom metric
  void recordMetric(String name, num value, {String? unit}) {
    logBreadcrumb('$name: $value${unit ?? ''}', category: 'metric');
  }

  /// Track app startup time
  Future<void> trackAppStartup(Future<void> Function() initOperation) async {
    final stopwatch = Stopwatch()..start();
    await trackTrace('app_startup', initOperation);
    stopwatch.stop();
    recordMetric('startup_time_ms', stopwatch.elapsedMilliseconds);
  }
}
