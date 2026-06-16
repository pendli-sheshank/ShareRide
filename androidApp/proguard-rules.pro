# Keep Supabase-kt and Ktor serialization from being stripped
-keep class io.github.jan.supabase.** { *; }
-keep class io.ktor.** { *; }
-keepattributes *Annotation*, Signature, Exception

# Kotlinx serialization
-keepclassmembers class kotlinx.serialization.json.** { *** *; }
-keep @kotlinx.serialization.Serializable class * { *; }
