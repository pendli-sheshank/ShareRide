import SwiftUI

struct RootView: View {
    @EnvironmentObject var authState: AuthState

    var body: some View {
        if authState.isLoading {
            ProgressView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(.systemGroupedBackground))
        } else if authState.isLoggedIn {
            MainTabView()
        } else {
            LoginView()
        }
    }
}
