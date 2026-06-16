import SwiftUI

struct ChatListView: View {
    var body: some View {
        NavigationStack {
            ContentUnavailableView(
                "No messages yet",
                systemImage: "message",
                description: Text("Chat opens after a join request is accepted")
            )
            .navigationTitle("Messages")
        }
    }
}
