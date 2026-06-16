package com.shareride.repository

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.gotrue
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.user.UserInfo

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
            accessToken = accessToken,
            refreshToken = refreshToken,
        )
    }

    suspend fun signOut(): Result<Unit> = runCatching {
        supabase.gotrue.logout()
    }

    fun isLoggedIn(): Boolean = supabase.gotrue.currentSessionOrNull() != null
}
