package com.shareride.repository

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.gotrue
import io.github.jan.supabase.gotrue.user.UserInfo
import io.github.jan.supabase.gotrue.user.UserSession

class AuthRepository(private val supabase: SupabaseClient) {

    val currentUser: UserInfo?
        get() = supabase.gotrue.currentUserOrNull()

    suspend fun sendMagicLink(email: String, redirectTo: String): Result<Unit> = runCatching {
        supabase.gotrue.sendMagicLinkTo(email = email) {
            this.redirectTo = redirectTo
        }
    }

    suspend fun setSession(accessToken: String, refreshToken: String): Result<Unit> = runCatching {
        supabase.gotrue.importSession(
            UserSession(
                accessToken = accessToken,
                refreshToken = refreshToken,
                expiresIn = 3600L,
                tokenType = "bearer",
                user = null,
            )
        )
    }

    suspend fun signOut(): Result<Unit> = runCatching {
        supabase.gotrue.logout()
    }

    fun isLoggedIn(): Boolean = supabase.gotrue.currentSessionOrNull() != null
}
