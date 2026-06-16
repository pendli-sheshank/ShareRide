import SwiftUI
import Auth

@main
struct iOSApp: App {
    @StateObject private var authState = AuthState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(authState)
                .onOpenURL { url in
                    Task { await authState.handleDeepLink(url) }
                }
        }
    }
}
