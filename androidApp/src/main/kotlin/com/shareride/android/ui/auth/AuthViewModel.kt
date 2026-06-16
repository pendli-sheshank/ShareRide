package com.shareride.android.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shareride.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val MAGIC_LINK_SCHEME = "com.shareride://auth"

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _isLoggedIn = MutableStateFlow(authRepository.isLoggedIn())
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun sendMagicLink(email: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.sendMagicLink(email, redirectTo = MAGIC_LINK_SCHEME)
                .onSuccess { _uiState.value = AuthUiState.LinkSent(email) }
                .onFailure { _uiState.value = AuthUiState.Error(it.message ?: "Unknown error") }
        }
    }

    fun handleDeepLink(url: String) {
        if (!url.startsWith(MAGIC_LINK_SCHEME)) return
        val tokens = parseHashTokens(url)
        val access = tokens["access_token"] ?: return
        val refresh = tokens["refresh_token"] ?: return

        viewModelScope.launch {
            authRepository.setSession(access, refresh)
                .onSuccess { _isLoggedIn.value = true }
                .onFailure { _uiState.value = AuthUiState.Error("Link expired. Request a new one.") }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            _isLoggedIn.value = false
            _uiState.value = AuthUiState.Idle
        }
    }

    val currentEmail: String?
        get() = authRepository.currentUser?.email

    fun resetState() { _uiState.value = AuthUiState.Idle }

    private fun parseHashTokens(url: String): Map<String, String> {
        val hashStart = url.indexOf('#')
        if (hashStart == -1) return emptyMap()
        return url.substring(hashStart + 1)
            .split('&')
            .mapNotNull { pair ->
                val eq = pair.indexOf('=')
                if (eq == -1) null
                else pair.substring(0, eq) to pair.substring(eq + 1)
            }
            .toMap()
    }
}

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    data class LinkSent(val email: String) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}
