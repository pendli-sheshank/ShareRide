import 'package:firebase_performance/firebase_performance.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class MonitoringService {
  static final MonitoringService _instance = MonitoringService._internal();
  late FirebasePerformance _performance;

  MonitoringService._internal();

  factory MonitoringService() {
    return _instance;
  }

  Future<void> initialize() async {
    _performance = FirebasePerformance.instance;
    // Enable collection by default
    await _performance.setPerformanceCollectionEnabled(true);
  }

  /// Track custom trace (e.g., API call duration)
  Future<void> trackTrace(
    String name,
    Future<void> Function() operation, {
    Map<String, String>? attributes,
  }) async {
    final trace = _performance.newTrace(name);
    await trace.start();

    try {
      // Add attributes if provided
      if (attributes != null) {
        for (final entry in attributes.entries) {
          trace.putAttribute(entry.key, entry.value);
        }
      }

      await operation();
      trace.incrementMetric('success', 1);
    } catch (e) {
      trace.incrementMetric('failure', 1);
      rethrow;
    } finally {
      await trace.stop();
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
    final trace = _performance.newTrace('query_$queryName');
    await trace.start();

    try {
      final result = await query();
      trace.incrementMetric('success', 1);
      return result;
    } catch (e) {
      trace.incrementMetric('failure', 1);
      rethrow;
    } finally {
      await trace.stop();
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
