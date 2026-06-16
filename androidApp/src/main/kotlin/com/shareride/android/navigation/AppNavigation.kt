package com.shareride.android.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.shareride.android.ui.auth.LoginScreen
import com.shareride.android.ui.chat.ChatListScreen
import com.shareride.android.ui.post.PostTripScreen
import com.shareride.android.ui.profile.ProfileScreen
import com.shareride.android.ui.trips.TripsScreen

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Trips : Screen("trips")
    object PostTrip : Screen("post_trip")
    object ChatList : Screen("chat_list")
    object Profile : Screen("profile")
}

@Composable
fun AppNavigation(
    startDestination: String,
    navController: NavHostController = rememberNavController(),
) {
    NavHost(navController = navController, startDestination = startDestination) {
        composable(Screen.Login.route) {
            LoginScreen(onLoggedIn = { navController.navigate(Screen.Trips.route) {
                popUpTo(Screen.Login.route) { inclusive = true }
            }})
        }
        composable(Screen.Trips.route) {
            TripsScreen(onPostTrip = { navController.navigate(Screen.PostTrip.route) })
        }
        composable(Screen.PostTrip.route) {
            PostTripScreen(onBack = { navController.popBackStack() })
        }
        composable(Screen.ChatList.route) {
            ChatListScreen()
        }
        composable(Screen.Profile.route) {
            ProfileScreen(onSignOut = { navController.navigate(Screen.Login.route) {
                popUpTo(0) { inclusive = true }
            }})
        }
    }
}
