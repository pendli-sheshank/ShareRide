import SwiftUI
import Auth

struct ProfileView: View {
    @EnvironmentObject var authState: AuthState
    @State private var userEmail: String?
    @State private var isSigningOut = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.green)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(userEmail ?? "—")
                                .font(.headline)
                            Text("Email Verified")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    // TODO: Host mode toggle, vehicle details
                    Label("Host mode", systemImage: "car.fill")
                        .foregroundColor(.secondary)
                }

                Section {
                    Button(role: .destructive) {
                        Task {
                            isSigningOut = true
                            try? await authState.signOut()
                            isSigningOut = false
                        }
                    } label: {
                        HStack {
                            if isSigningOut { ProgressView().padding(.trailing, 4) }
                            Text("Sign Out")
                        }
                    }
                }
            }
            .navigationTitle("Profile")
            .task { await loadUser() }
        }
    }

    private func loadUser() async {
        userEmail = try? await supabase.auth.session.user.email
    }
}
