package com.shareride

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage

fun createSupabaseClient(url: String, anonKey: String): SupabaseClient =
    createSupabaseClient(supabaseUrl = url, supabaseKey = anonKey) {
        install(GoTrue)
        install(Postgrest)
        install(Realtime)
        install(Storage)
    }
