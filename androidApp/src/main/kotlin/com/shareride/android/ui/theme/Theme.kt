package com.shareride.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = Green600,
    onPrimary = SurfaceWhite,
    primaryContainer = Green100,
    onPrimaryContainer = Green600,
    background = NeutralGray100,
    onBackground = NeutralGray800,
    surface = SurfaceWhite,
    onSurface = NeutralGray800,
    surfaceVariant = Green50,
    onSurfaceVariant = NeutralGray600,
    outline = NeutralGray300,
    error = ErrorRed,
)

@Composable
fun SawaariShareTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content,
    )
}
