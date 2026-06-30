# Flutter
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Supabase / OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep crash reporting stack traces readable
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
