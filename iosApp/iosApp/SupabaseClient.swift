import Foundation
import Supabase

enum SupabaseConfig {
    // Anon key is public by design — security enforced by RLS on the server.
    static let url = URL(string: "https://oqivckjpjtwishdnjumo.supabase.co")!
    static let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xaXZja2pwanR3aXNoZG5qdW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTE3ODQsImV4cCI6MjA5Njk2Nzc4NH0.yEuLJXYvXgUzydgHtP4BRzFiccnyVDEd4SJYYMNFg8c"
}

let supabase = SupabaseClient(
    supabaseURL: SupabaseConfig.url,
    supabaseKey: SupabaseConfig.anonKey
)
