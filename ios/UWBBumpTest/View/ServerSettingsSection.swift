import SwiftUI

/// Testing tools: point the app at a BUMP server and check it. On a physical
/// iPhone, "localhost" is the phone itself, so use the Mac's LAN address instead.
struct ServerSettingsSection: View {
    @ObservedObject var store: Store
    @ObservedObject var engine: BumpEngine

    @State private var draft = ""
    @State private var status: String?
    @State private var tone: StatusTone = .neutral
    @State private var checking = false

    private var buildDefault: String {
        (Bundle.main.object(forInfoDictionaryKey: "BumpAPIBaseURL") as? String) ?? ""
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Space.s) {
            SectionHeading(title: "Aster server",
                           subtitle: "An optional server for voice transcription, Grok and relay transport. Build default: \(buildDefault.isEmpty ? "none (local mode)" : buildDefault). From an iPhone, use a reachable HTTPS address or your Mac's .local address.")
            BumpField(label: "Server URL override", placeholder: buildDefault.isEmpty ? "http://your-mac.local:8787" : buildDefault, text: $draft)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .keyboardType(.URL)
                .onSubmit(save)
            HStack(spacing: Space.s) {
                Button("Save & check", action: save)
                    .buttonStyle(.bumpSecondary(.small))
                Button("Use build default") { draft = ""; save() }
                    .buttonStyle(.bumpOutlined(.small))
            }
            if checking {
                LoadingIndicator(size: 22)
            } else if let status {
                StatusPill(text: status, tone: tone)
            }
        }
        .onAppear { draft = store.settings.apiBaseURL ?? "" }
    }

    private func save() {
        let value = draft.trimmed()
        store.settings.apiBaseURL = value.isEmpty ? nil : value
        guard let client = BumpAPIClient.resolve(override: store.settings.apiBaseURL) else {
            if value.isEmpty && buildDefault.trimmed().isEmpty {
                status = "Local mode · no server configured"
                tone = .neutral
            } else {
                status = "Not a valid http(s) URL"
                tone = .bad
            }
            engine.refreshCloudStatus()
            return
        }
        checking = true
        Task {
            do {
                let health = try await client.health()
                status = health.grokConfigured
                    ? "Reachable · Grok ready (\(health.model ?? "model unknown"))"
                    : "Reachable · no xAI key on the server"
                tone = health.grokConfigured ? .good : .warn
            } catch {
                status = "Unreachable: \(BumpAPIError.map(error).localizedDescription)"
                tone = .bad
            }
            checking = false
            engine.refreshCloudStatus()
        }
    }
}
