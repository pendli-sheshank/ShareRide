import SwiftUI

struct PostTripView: View {
    @State private var origin = ""
    @State private var destination = ""
    @State private var departDate = ""
    @State private var seats = ""
    @State private var cost = ""
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Route") {
                    TextField("From (e.g. Columbus, OH)", text: $origin)
                    TextField("To (e.g. Chicago, IL)", text: $destination)
                }
                Section("Details") {
                    TextField("Departure (e.g. 2026-07-04 09:00)", text: $departDate)
                    HStack {
                        TextField("Seats", text: $seats).keyboardType(.numberPad)
                        Divider()
                        TextField("Est. cost ($)", text: $cost).keyboardType(.decimalPad)
                    }
                }
                Section("Notes (optional)") {
                    TextField("Meeting point, luggage limits…", text: $notes, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                }
                Section {
                    Text("Cost contributions cover trip expenses only. Cash is exchanged in person.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Post a Ride")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Post") {
                        // TODO: submit via PostgREST
                    }
                    .fontWeight(.semibold)
                    .disabled(origin.isEmpty || destination.isEmpty || departDate.isEmpty)
                }
            }
        }
    }
}
