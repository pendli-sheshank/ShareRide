import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            TripsView()
                .tabItem { Label("Rides", systemImage: "car.fill") }
            PostTripView()
                .tabItem { Label("Post", systemImage: "plus.circle.fill") }
            ChatListView()
                .tabItem { Label("Messages", systemImage: "message.fill") }
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.fill") }
        }
        .accentColor(.green)
    }
}
