import 'dart:developer' as developer;

import 'package:firebase_crashlytics/firebase_crashlytics.dart';

class MonitoringService {
  static final MonitoringService _instance = MonitoringService._internal();
  bool _initialized = false;

  MonitoringService._internal();

  factory MonitoringService() {
    return _instance;
  }

  /// Initialize monitoring service (safe to call multiple times)
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
      _initialized = true;
    } catch (e) {
      developer.log(
        'Warning: Monitoring initialization failed: $e',
        name: 'MonitoringService',
      );
      _initialized = true;
    }
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
  Future<void> trackScreenLoad(
    String screenName,
    Future<void> Function() operation,
  ) async {
    return trackTrace(
      'screen_load_$screenName',
      operation,
      attributes: {'screen': screenName},
    );
  }

  /// Track API query duration
  Future<T> trackQuery<T>(String queryName, Future<T> Function() query) async {
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
    return trackTrace(
      'message_send_$matchId',
      sendOperation,
      attributes: {'match_id': matchId},
    );
  }

  /// Log breadcrumb for debugging
  void logBreadcrumb(String message, {String? category, String? level}) {
    final breadcrumb = [
      if (level != null) 'level=$level',
      if (category != null) 'category=$category',
      'message=$message',
    ].join(' ');

    try {
      FirebaseCrashlytics.instance.log(breadcrumb);
    } catch (e, stackTrace) {
      developer.log(
        'Failed to write Crashlytics breadcrumb: $breadcrumb',
        name: category ?? 'MonitoringService',
        error: e,
        stackTrace: stackTrace,
      );
    }
  }

  /// Capture exception with context
  Future<void> captureException(
    Object exception,
    StackTrace? stackTrace, {
    String? context,
  }) async {
    try {
      await FirebaseCrashlytics.instance.recordError(
        exception,
        stackTrace,
        reason: context,
      );
    } catch (e, errorStackTrace) {
      final errorMessage =
          'Failed to record exception${context != null ? ' ($context)' : ''}: '
          '$exception';
      developer.log(
        errorMessage,
        name: 'MonitoringService',
        error: e,
        stackTrace: errorStackTrace,
      );
    }
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
