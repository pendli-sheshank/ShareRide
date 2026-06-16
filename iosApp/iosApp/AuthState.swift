import Foundation
import Auth

@MainActor
final class AuthState: ObservableObject {
    @Published var isLoggedIn = false
    @Published var isLoading = true

    init() {
        Task { await checkSession() }

        Task {
            for await (event, _) in await supabase.auth.authStateChanges {
                switch event {
                case .signedIn:  isLoggedIn = true
                case .signedOut: isLoggedIn = false
                default: break
                }
            }
        }
    }

    private func checkSession() async {
        do {
            _ = try await supabase.auth.session
            isLoggedIn = true
        } catch {
            isLoggedIn = false
        }
        isLoading = false
    }

    func sendMagicLink(email: String) async throws {
        try await supabase.auth.signInWithOTP(
            email: email,
            redirectTo: URL(string: "com.shareride://auth")!
        )
    }

    func signOut() async throws {
        try await supabase.auth.signOut()
    }

    func handleDeepLink(_ url: URL) async {
        guard url.scheme == "com.shareride", url.host == "auth" else { return }
        do {
            try await supabase.auth.session(from: url)
        } catch {
            print("[Auth] Deep link session error: \(error.localizedDescription)")
        }
    }
}
