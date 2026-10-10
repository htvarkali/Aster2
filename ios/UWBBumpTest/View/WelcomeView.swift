import SwiftUI

/// The site's hero on a phone: backdrop, drawn phones, wordmark, one action.
struct WelcomeView: View {
    var onStart: () -> Void

    var body: some View {
        ZStack {
            BumpColor.background.ignoresSafeArea()
            Backdrop(style: .hero).ignoresSafeArea()
            VStack(spacing: Space.m) {
                Spacer(minLength: Space.l)

                PhonesIllustration(animated: true)
                    .padding(.vertical, 60)
                    .padding(.horizontal, Space.gutter)

                Wordmark(size: .hero)
                    .padding(.horizontal, Space.gutter)

                Text("Find your people. Build your constellation.")
                    .font(BumpFont.sectionTitle)
                    .foregroundStyle(BumpColor.navy)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, Space.xl)

                Text("Tap phones with someone new. Aster finds the specific things you actually have in common, and gives you something to say.")
                    .font(BumpFont.body)
                    .foregroundStyle(BumpColor.secondaryText)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, Space.l)

                Spacer(minLength: Space.m)

                Button(action: onStart) {
                    TrailingIconLabel("Get started", systemImage: "arrow.right")
                }
                .buttonStyle(.bumpPrimary)
                .padding(.horizontal, Space.gutter)
                .padding(.bottom, Space.l)
            }
        }
    }
}

#Preview {
    WelcomeView(onStart: {})
}
