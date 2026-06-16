package com.shareride.android

import android.app.Application
import com.shareride.createSupabaseClient
import dagger.hilt.android.HiltAndroidApp
import io.github.jan.supabase.SupabaseClient
import javax.inject.Inject

@HiltAndroidApp
class SawaariShareApp : Application()
