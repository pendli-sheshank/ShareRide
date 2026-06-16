package com.shareride.android

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.shareride.android.navigation.AppNavigation
import com.shareride.android.navigation.Screen
import com.shareride.android.ui.auth.AuthViewModel
import com.shareride.android.ui.theme.SawaariShareTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Handle cold-start deep link (magic link from email)
        intent?.data?.toString()?.let { authViewModel.handleDeepLink(it) }

        setContent {
            SawaariShareTheme {
                val isLoggedIn by authViewModel.isLoggedIn.collectAsState()
                AppNavigation(
                    startDestination = if (isLoggedIn) Screen.Trips.route else Screen.Login.route
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        // Handle warm-start deep link (app was in background)
        intent.data?.toString()?.let { authViewModel.handleDeepLink(it) }
    }
}
