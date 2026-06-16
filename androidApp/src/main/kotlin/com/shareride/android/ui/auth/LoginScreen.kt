package com.shareride.android.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun LoginScreen(
    onLoggedIn: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isLoggedIn by viewModel.isLoggedIn.collectAsStateWithLifecycle()

    LaunchedEffect(isLoggedIn) {
        if (isLoggedIn) onLoggedIn()
    }

    when (val state = uiState) {
        is AuthUiState.LinkSent -> LinkSentScreen(
            email = state.email,
            onBack = viewModel::resetState,
        )
        else -> EmailEntryScreen(
            isLoading = state is AuthUiState.Loading,
            errorMessage = (state as? AuthUiState.Error)?.message,
            onSend = viewModel::sendMagicLink,
        )
    }
}

@Composable
private fun EmailEntryScreen(
    isLoading: Boolean,
    errorMessage: String?,
    onSend: (String) -> Unit,
) {
    var email by remember { mutableStateOf("") }
    val keyboard = LocalSoftwareKeyboardController.current

    fun submit() {
        if (email.isNotBlank()) {
            keyboard?.hide()
            onSend(email.trim().lowercase())
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "SawaariShare",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
        Text(
            text = "Share rides, split costs",
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp, bottom = 40.dp),
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            placeholder = { Text("you@university.edu") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Send,
            ),
            keyboardActions = KeyboardActions(onSend = { submit() }),
            modifier = Modifier.fillMaxWidth(),
            isError = errorMessage != null,
            supportingText = errorMessage?.let { { Text(it) } },
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = ::submit,
            enabled = email.isNotBlank() && !isLoading,
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) {
            if (isLoading) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
            else Text("Send Magic Link")
        }

        Spacer(Modifier.height(32.dp))

        Text(
            text = "Contributions cover trip costs only.\nThis platform does not provide transportation services.",
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.outline,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun LinkSentScreen(email: String, onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = Icons.Outlined.Email,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(64.dp),
        )
        Spacer(Modifier.height(24.dp))
        Text("Check your inbox", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("We sent a sign-in link to", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(email, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 2.dp))
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Tap the link in the email — the app will open and sign you in automatically.",
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(32.dp))
        TextButton(onClick = onBack) { Text("Use a different email") }
    }
}
