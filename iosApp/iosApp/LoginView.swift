import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authState: AuthState
    @State private var email = ""
    @State private var isLoading = false
    @State private var linkSent = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            if linkSent {
                linkSentView
            } else {
                emailEntryView
            }
        }
    }

    private var emailEntryView: some View {
        VStack(spacing: 0) {
            Spacer()
            Text("SawaariShare")
                .font(.system(size: 34, weight: .bold))
                .foregroundColor(.green)
            Text("Share rides, split costs")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .padding(.top, 4)
                .padding(.bottom, 40)

            VStack(alignment: .leading, spacing: 8) {
                Text("Email Address")
                    .font(.footnote)
                    .fontWeight(.semibold)
                TextField("you@university.edu", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .autocorrectionDisabled()
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
            }

            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.top, 4)
            }

            Button {
                Task { await sendLink() }
            } label: {
                Group {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("Send Magic Link")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(email.isEmpty || isLoading ? Color.green.opacity(0.4) : Color.green)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(email.isEmpty || isLoading)
            .padding(.top, 12)

            Spacer()

            Text("Contributions cover trip costs only.\nThis platform does not provide transportation services.")
                .font(.caption2)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.bottom, 24)
        }
        .padding(.horizontal, 24)
    }

    private var linkSentView: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "envelope.open.fill")
                .font(.system(size: 64))
                .foregroundColor(.green)
            Text("Check your inbox")
                .font(.title2)
                .fontWeight(.bold)
            Text("We sent a sign-in link to")
                .foregroundColor(.secondary)
            Text(email.lowercased())
                .fontWeight(.semibold)
            Text("Tap the link in the email — the app will open and sign you in automatically.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .padding(.top, 4)
            Spacer()
            Button("Use a different email") {
                linkSent = false
                email = ""
            }
            .foregroundColor(.green)
            .padding(.bottom, 32)
        }
    }

    private func sendLink() async {
        errorMessage = nil
        isLoading = true
        do {
            try await authState.sendMagicLink(email: email.trimmingCharacters(in: .whitespaces).lowercased())
            linkSent = true
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
