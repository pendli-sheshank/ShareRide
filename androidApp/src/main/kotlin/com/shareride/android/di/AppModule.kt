package com.shareride.android.di

import com.shareride.BuildConfig
import com.shareride.createSupabaseClient
import com.shareride.repository.AuthRepository
import com.shareride.repository.TripRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideSupabaseClient(): SupabaseClient =
        createSupabaseClient(
            url = com.shareride.android.BuildConfig.SUPABASE_URL,
            anonKey = com.shareride.android.BuildConfig.SUPABASE_ANON_KEY,
        )

    @Provides
    @Singleton
    fun provideAuthRepository(client: SupabaseClient): AuthRepository =
        AuthRepository(client)

    @Provides
    @Singleton
    fun provideTripRepository(client: SupabaseClient): TripRepository =
        TripRepository(client)
}
