import SwiftUI
import PostgREST

struct TripOffer: Decodable, Identifiable {
    let id: String
    let originLabel: String
    let destLabel: String
    let departAt: String
    let seatsTotal: Int
    let seatsAvailable: Int
    let costEstimate: Double
    let notes: String?

    enum CodingKeys: String, CodingKey {
        case id
        case originLabel = "origin_label"
        case destLabel = "dest_label"
        case departAt = "depart_at"
        case seatsTotal = "seats_total"
        case seatsAvailable = "seats_available"
        case costEstimate = "cost_estimate"
        case notes
    }
}

@MainActor
final class TripsViewModel: ObservableObject {
    @Published var offers: [TripOffer] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            offers = try await supabase
                .from("trip_offers")
                .select()
                .gt("depart_at", value: "now()")
                .order("depart_at", ascending: true)
                .limit(30)
                .execute()
                .value
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct TripsView: View {
    @StateObject private var vm = TripsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = vm.errorMessage {
                    ContentUnavailableView("Couldn't load rides", systemImage: "exclamationmark.triangle", description: Text(error))
                } else if vm.offers.isEmpty {
                    ContentUnavailableView("No rides posted yet", systemImage: "car", description: Text("Be the first to post a ride"))
                } else {
                    List(vm.offers) { offer in
                        TripOfferRow(offer: offer)
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Available Rides")
            .task { await vm.load() }
            .refreshable { await vm.load() }
        }
    }
}

struct TripOfferRow: View {
    let offer: TripOffer

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(offer.originLabel).fontWeight(.semibold)
                Image(systemName: "arrow.right").foregroundColor(.secondary)
                Text(offer.destLabel).fontWeight(.semibold)
            }
            HStack(spacing: 16) {
                Label("\(offer.seatsAvailable)/\(offer.seatsTotal) seats", systemImage: "person.2")
                Label("$\(Int(offer.costEstimate))/rider", systemImage: "dollarsign.circle")
                    .foregroundColor(.green)
                    .fontWeight(.semibold)
            }
            .font(.caption)
            .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}
