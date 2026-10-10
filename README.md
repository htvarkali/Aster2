# Aster

**Find your people. Build your constellation.**

[Aster source repository](https://github.com/htvarkali/Aster2)

Aster helps people in the same room find common ground and start a conversation. Create a profile, meet someone nearby, tap phones, and confirm each other to reveal shared interests and conversation starters grounded in what you both chose to share.

Aster brings the **Crafting Constellations** theme to nearby introductions: shared interests become connections, and connections become a personal constellation. The project includes a native iOS app, an interactive website, and an optional backend. The current native revision still needs an Xcode build and physical-device validation.

## Crafting Constellations

Every person is a star with their own interests, experiences, and goals. Finding common ground gives two stars a reason to connect. Meeting more people gradually builds a personal constellation of conversations and saved connections.

The theme describes the experience we want to create. The website illustrates it with constellation artwork on an interactive badge; the current app saves connections as a list. A visual map of actual saved connections is a future idea.

## What the code does

- **Build an editable profile.** Type an introduction, or record up to 45 seconds with cloud transcription. Review the transcript, answer up to three follow-up questions, and approve interests, experiences, and goals before saving.
- **Discover participating phones.** Automatic room joining uses the backend relay when available and MultipeerConnectivity otherwise. Event codes are also supported.
- **Confirm a meeting.** Core Motion detects a tap; Nearby Interaction adds peer-specific distance evidence on supported hardware. Ambiguous signals are rejected, with manual selection available. Both people must confirm before the full profile exchange.
- **Reveal grounded common ground.** Matching prioritizes specific shared interests, can identify broader shared topics, and separates complementary conversation prompts from exact overlap. It does not calculate compatibility or population rarity.
- **Generate conversation starters.** Consented xAI Grok requests go through the backend. Apple Foundation Models, when available, and deterministic templates provide local fallbacks. The source is labelled, and one phone generates the result for both participants.
- **Keep a local connection history.** Save people and their shared interests, review connections, delete records, and privately record which topics came up in conversation.
- **Surface nearby teasers.** StreetPass includes a foreground nearby-encounter flow using MultipeerConnectivity and UWB. Its limited broadcast contains a name, optional thumbnail, and up to five interests before a confirmed meeting.

The post-conversation profile-unlock and match celebration flow currently uses `LocalMutualLikeResolver`, which derives a simulated partner response locally. It is a demo mechanism, not a real reciprocal follow-up service.

## Project structure

| Directory | Purpose | Stack |
|---|---|---|
| [`ios/`](ios/README.md) | Native app, sensors, pairing, matching, local storage | Swift, SwiftUI, Core Motion, Nearby Interaction, MultipeerConnectivity |
| [`backend/`](backend/README.md) | AI proxy and temporary room-message relay | Node.js, xAI API, no runtime dependencies |
| [`web/`](web/README.md) | Redesigned standalone marketing website | React, TypeScript, Vite, Three.js, React Three Fiber, Rapier, Motion |
| [`ios-mockup/`](ios-mockup/README.md) | Clickable browser mockup for UI review | HTML, CSS, JavaScript |

The website is separate from the native app. The mockup uses sample data and simulated transitions; it does not connect real phones.

## Website design

The website uses deep blue surfaces, Geist typography, a moving blue dither background, a draggable 3D lanyard, bordered feature cards, a dashed step-by-step journey and a rounded closing panel. The badge uses Aster artwork and can be personalized and downloaded locally as a PNG.

Motion can be paused, with a static fallback for reduced motion or unavailable WebGL. The badge is an illustrative website interaction, separate from the native app and its saved profiles. Navigation links lead to project source and sections of the page.

## Free iPhone development path

Xcode and Apple's [free Personal Team](https://developer.apple.com/help/account/basics/about-your-developer-account) support testing on your own iPhone without paid developer membership. Free provisioning requires rebuilding after seven days. This checkout has no configured xAI key and defaults to local mode: typed onboarding, local drafting, grounded conversation starters, saved connections and Multipeer transport. Recorded transcription and Grok require a separately configured cloud service and are optional.

Both app build defaults use an empty server URL. A runtime server override can point to your own reachable server if needed and takes priority over a build default. The transfer, signing and installation walkthrough is in [`ios/README.md`](ios/README.md).

For the handoff, use the [copy-paste Codex prompt](ios/README.md#copy-into-codex-on-the-friends-mac) and [two-phone rehearsal checklist](ios/README.md#two-phone-rehearsal-checklist). The website can be shown separately on the Mac; it does not pair the phones.

## Run locally

Run these commands from the repository root unless a `cd` is shown. Use **Node 22.12+** for the website and backend; the backend alone supports Node 20+.

### Website

```sh
cd web
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173). To build and preview:

```sh
npm run build
npm run preview
```

The preview runs at [localhost:4173](http://localhost:4173).

### Backend

```sh
cd backend
cp .env.example .env
# Set XAI_API_KEY in .env for transcription and Grok features.
npm start
```

In a separate terminal, check [localhost:8787/healthz](http://localhost:8787/healthz):

```sh
curl http://localhost:8787/healthz
```

The server listens on port 8787. A key is required for xAI features; the relay can run without one. Never commit `.env` or put an API key in the app. See [`backend/CONTRACT.md`](backend/CONTRACT.md) and the backend source for endpoint details.

### Native iOS app

Requires a Mac with **Xcode 26+**. The deployment target is **iOS 17**; optional on-device AI requires iOS 26 and an eligible device. Real sensor and pairing validation requires two physical iPhones.

```sh
open ios/*.xcodeproj
```

Choose your signing team and bundle identifier in Xcode, select a connected iPhone, and run the app scheme identified in the [iOS setup guide](ios/README.md). Grant the requested Nearby Interaction, Local Network, Motion, and Microphone permissions as needed. Repeat on the second phone.

For the free local demo, choose **Keep everything on this phone** during onboarding and type your introduction. No backend or API key is needed. Leave the Server URL empty and choose **Nearby only** in Testing tools. Complete profiles on both phones, keep the app open, tap phones, confirm the partner on both sides, and save the result. A single phone can test onboarding and UI; a real exchange requires two phones.

An optional relay/cloud setup requires a reachable server URL under **You > Testing tools**. `localhost` on a phone points to the phone itself. See the backend and iOS READMEs for that separate configuration.

### Browser mockup

```sh
python3 -m http.server 8000 --bind 127.0.0.1 -d ios-mockup
```

Open [localhost:8000](http://localhost:8000) to explore the existing native-app prototype or compare screens. Its layout has not been redesigned to match the new website; native UI work is planned for later.

## Checks and current limits

The repository contains local backend tests and iOS logic, contract, onboarding, and design tests. To run the backend tests and compile the website:

```sh
npm --prefix backend test
npm --prefix web run build
```

For an unsigned iOS compile check and Simulator tests on a Mac with the required SDK, follow the [native build commands](ios/README.md#optional-build-and-test-commands).

The blue website passed the production build and desktop/narrow-screen browser review. The 3D badge renders and can be dragged; local name/color application, PNG export, pause, and in-page destinations work. No application errors were observed. Rapier logs an upstream WASM initialization deprecation warning. Reduced-motion handling was reviewed in source; the browser's system preference was not changed.

All 78 Swift files passed syntax parsing during the native branding pass, and the app/widget plists and Xcode project passed plist validation. Full Xcode is not installed in this local environment, so no native compile or physical-device test was run.

The current native build and two-phone journey need fresh Xcode and hardware validation. [`RESULTS.md`](RESULTS.md) contains unfilled physical-test templates, so there are no measured accuracy, latency, crowded-room, or UWB reliability claims. Simulator fixtures demonstrate screens, not sensor performance. Rooms are currently capped at eight participating phones.

There is no account system, chat service, or durable follow-up backend. Profiles, saved connections, and ratings are stored as local JSON. The relay holds temporary messages in memory and currently has no authentication. Multipeer sessions require encryption; relay frames are forwarded as base64 payloads, without application-level end-to-end encryption. Use the relay for controlled testing.

Cloud consent controls AI processing, not the relay transport. With consent, introductions and answers are sent through the backend to xAI; talking-point requests send verified candidate labels only when both participants allow cloud processing. Local AI fallbacks are available, but recorded-audio transcription needs the cloud service. The backend does not write audio to disk; that does not establish xAI's retention policy.

## Next steps

- Transfer the current source to the friend's MacBook, install compatible Xcode, select a free Personal Team and run the app on the connected iPhone.
- Build and inspect the current SwiftUI app in Xcode, then measure the two-phone and crowded-room flows in `RESULTS.md`.
- Explore a visual constellation of saved connections after the core meeting flow is validated.
- Replace simulated reciprocal follow-up with a real consented service if that feature is pursued.

## Third-party notices

Source acknowledgments and license information are documented in
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
