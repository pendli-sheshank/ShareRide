plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.hilt)
    kotlin("kapt")
}

android {
    namespace = "com.shareride.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.shareride.android"
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("VERSION_CODE") ?: "1").toInt()
        versionName = System.getenv("VERSION_NAME") ?: "1.0.0"

        buildConfigField("String", "SUPABASE_URL", "\"${System.getenv("SUPABASE_URL") ?: project.findProperty("SUPABASE_URL") ?: ""}\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"${System.getenv("SUPABASE_ANON_KEY") ?: project.findProperty("SUPABASE_ANON_KEY") ?: ""}\"")
    }

    signingConfigs {
        create("release") {
            val ksFile = System.getenv("ANDROID_KEYSTORE_FILE")
            if (!ksFile.isNullOrEmpty()) {
                storeFile = file(ksFile)
                storePassword = System.getenv("ANDROID_STORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            val ksFile = System.getenv("ANDROID_KEYSTORE_FILE")
            signingConfig = if (!ksFile.isNullOrEmpty()) signingConfigs.getByName("release") else null
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }

    kotlinOptions { jvmTarget = "17" }

    packaging {
        resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
    }
}

dependencies {
    implementation(project(":shared"))

    // Compose BOM
    val composeBom = platform(libs.compose.bom)
    implementation(composeBom)
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.material3)
    implementation(libs.compose.icons.extended)
    debugImplementation(libs.compose.ui.tooling)

    // AndroidX
    implementation(libs.activity.compose)
    implementation(libs.navigation.compose)
    implementation(libs.lifecycle.viewmodel.compose)
    implementation(libs.lifecycle.runtime.compose)
    implementation(libs.datastore.preferences)
    implementation(libs.security.crypto)

    // Hilt
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)

    // Kotlin
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)

    // Desugar
    coreLibraryDesugaring(libs.desugar.jdk)
}

kapt {
    correctErrorTypes = true
}
