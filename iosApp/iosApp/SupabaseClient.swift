import Foundation
import Supabase

// URL and anon key are injected at build time via Info.plist build settings.
// In CI they come from GitHub secrets; locally create iosApp/Config.xcconfig.
private enum SupabaseConfig {
    static let url: URL = {
        let raw = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String ?? ""
        guard let url = URL(string: raw), !raw.isEmpty else {
            fatalError("SUPABASE_URL missing from Info.plist — check Config.xcconfig or build settings")
        }
        return url
    }()
    static let anonKey: String = {
        let key = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String ?? ""
        precondition(!key.isEmpty, "SUPABASE_ANON_KEY missing from Info.plist — check Config.xcconfig")
        return key
    }()
}

let supabase = SupabaseClient(
    supabaseURL: SupabaseConfig.url,
    supabaseKey: SupabaseConfig.anonKey
)
