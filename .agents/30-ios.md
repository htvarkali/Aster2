# ios/ — the Aster app (formerly Bump)

2026-10-10 branding update: app/widget display names and user-facing brand
strings use Aster. The Wordmark asset is a transparent Archivo ExtraBold
derivative and the app icon uses a constellation A. Technical identifiers,
bundle IDs, Bonjour service names, storage paths, and API configuration keys
remain unchanged. All 78 Swift files passed a syntax parse in this local Mac
checkout. Full Xcode is not installed; no native build or device test was run
for this revision. UI redesign is pending.

## Current iPhone readiness, 2026-10-10

- The human requested a free path. Typed onboarding, local profile drafting,
  grounded conversation prompts and MultipeerConnectivity require no AI key
  or server. Recorded transcription and Grok are unavailable in this setup.
  Do not request a paid API key or run live AI requests for this task.
- This is a Mac running macOS 26.5.2, not the historical WSL checkout.
  `xcode-select -p` points to `/Library/Developer/CommandLineTools`. The App Store
  Xcode install required macOS 26.6 and was blocked. Apple's
  [compatibility table](https://developer.apple.com/xcode/system-requirements)
  lists Xcode 26.6 for macOS 26.2–26.x. Full Xcode is not installed here.
  The latest plan is to use the friend's MacBook for Xcode, with the current
  source ZIP and the free setup walkthrough in `ios/README.md`. The friend's
  setup is reported as macOS 26.6.2 with Xcode 26.6; the user's phone is
  iPhone 13 running iOS 26.6.2. Start with that Xcode and verify device
  preparation; update Xcode for free if it reports unsupported iOS. The second
  phone is reported as iPhone 14 on iOS 26.5. Both meet the app's iOS 17
  minimum. Use two real iPhones for the exchange; build on the iPhone 14 first.
- Signing still inherits team `56KWU9QP85` and Bump bundle IDs. Current user
  access to that team is unverified. Configure app, widget and test targets
  using the user's free Personal Team and unique IDs as required. The widget
  ID must remain under the app ID. Native signing/build/install are pending.
- `BumpAPIClient.resolve` now validates the explicit override first, then the
  build default. Invalid overrides cannot mask a valid default; clearing an
  override restores the default; no valid candidate disables the API client.
  `ContractTests` pass `buildDefault: nil` so an invalid test URL cannot send
  a request to a configured build endpoint.
- Six `APIResolutionTests` methods passed in a standalone Foundation harness
  with the production resolver and assertion adapters. This was not XCTest;
  CLI Swift has no XCTest module. Changed Swift files parsed after the fix.
  The earlier whole-tree syntax parse covered 78 files. No current native
  build, type check, Simulator rendering or physical-phone test is claimed.
- Backend mocked tests passed 53/53. A retained backend session (`69728`)
  started with `XAI_API_KEY= HOST=127.0.0.1 PORT=8787 npm start`; `/healthz`
  returns HTTP 200, `ok: true`, `relay: true`, `grokConfigured: false`.
  A cloud draft request returns HTTP 503 `not_configured`. `.env` is absent;
  no keys were printed or written, no live xAI calls or public tunnel started.
  Treat the session as transient and recheck health before relying on it.
- Real partner exchange needs two phones; one phone can exercise local
  onboarding and fixture screens. The mutual-like resolver remains a stand-in,
  not an actual remote follow-up response.

Swift + SwiftUI. **Requires a Mac with Xcode 26+; real partner exchange needs
two physical iPhones.** Deployment target iOS 17. UWB and on-device AI are
both optional and degrade cleanly. The Simulator cannot validate UWB or motion.

`open ios/UWBBumpTest.xcodeproj` then follow `ios/README.md` for signing.

**Historical UI work used `ios-mockup/` first** because the earlier environment
had no Mac. It is an
HTML version of every screen and state, restyled in the marketing site's
language with the brand kept (details, history and traps: `31-ios-mockup.md`).
`tokens.css` keeps the `Theme.swift` names, `screens.js` keeps the Swift copy and
names each view's file. The site-style redesign has been ported to Swift but
has not been built with Xcode. If you
change a Swift view's layout or copy, update the mockup too, or the two drift.
The latest reveal and tutorial badges select flat color and decorations from
interest keywords, with the approved interest's catalogue category as a fallback
for short labels. The tutorial receives the current profile's interests from
`BumpScreen`; the reveal receives canonical interest IDs. This logic lives in
`Design/Components.swift`; the mockup's filterable
`interest-themes.html` is the visual review page. The recording control uses a
fixed layout slot and equal-size idle/recording circles. These Swift edits
parsed in the earlier Linux environment but have not been type-checked or
rendered in Xcode for the current revision.
The badge decorations were later reduced to small edge symbols; night uses
the website's dark blue and navy palette with sparse stars.

The inherited app includes automatic nearby listening, a server relay fallback,
StreetPass, Live Activities and a notifications feed. The historical merge into
`ios-mockup-vis-charan` preserves the site-style SwiftUI screens and adds those
behaviors. Build and inspect the merged app on a Mac before treating the UI or
two-phone flow as verified.

## Server URL on test phones

Both Debug and Release `BUMP_API_BASE_URL` settings are now empty. The inherited
temporary public tunnel was removed to keep the default local and free.
`Info.plist` exposes the setting as `BumpAPIBaseURL`. With no saved override,
Automatic joins Multipeer immediately; it does not probe a server first. Do not
replace this default with an inherited tunnel or a machine-specific hostname.

**You ▸ Testing tools ▸ Aster server** accepts a valid per-phone override ahead
of the build default. **Use build default** clears it and shows
`Local mode · no server configured`. Invalid overrides fall through to a valid
default, if one exists. The Connection setting can select **Nearby only**;
changes apply after **Reset sensors & reconnect**. Cloud consent controls AI
requests, independently of a separately configured relay.

The current backend is loopback-only at `127.0.0.1:8787`, so it cannot serve a
physical iPhone. No `cloudflared` binary is on PATH and no tunnel is running.
For an optional free LAN relay test, stop the current session and restart the
backend with `XAI_API_KEY= HOST=0.0.0.0 PORT=8787 npm start`, then set the override
on each phone to `http://<your-mac-hostname>.local:8787`, using the Mac's
local hostname from `scutil --get LocalHostName`,
with both phones on the same Wi-Fi. Check `/healthz` for `ok: true` and
`relay: true`; `grokConfigured: false` is expected without a key and does not
disable relay. This LAN route and ATS behavior have not been device-tested.
The app sets `NSAllowsLocalNetworking`; prefer a `.local` name or reachable
HTTPS URL rather than assuming all numeric LAN IP HTTP routes work. `localhost`
on an iPhone means the phone itself, and is only useful for a Mac-hosted
Simulator backend.

## The journey

Create a profile → Aster automatically listens for nearby phones → bump phones →
both confirm → shared interests + a conversation opener → save the connection.

| Screen | What it does |
|---|---|
| Welcome | hero wordmark, one action |
| Onboarding | name → spoken intro (≤45 s, or type) → up to 3 follow-ups → an editable card you approve |
| Bump | Automatic nearby listening, first-run tour, readiness status, nearby list, error states, manual pick. Event codes behind "Have an event code?" |
| StreetPass | A nearby teaser card for a qualifying encounter; full overlap still requires a confirmed bump. |
| Notifications | Local feed of bumps and passers-by. |
| Confirm partner | "Did you bump with X?" — both sides must confirm before full profiles are exchanged |
| Reveal | up to three grounded shared interests with evidence, one opener, save |
| Connections | locally saved people, detail, swipe to delete, empty state |
| You | edit profile, permission/capability status, link to Testing tools |

## Architecture — one file per box, real boundaries

```
View/    SwiftUI screens only. No sensors, no sockets.
Design/  Theme.swift (colour/type/spacing) + Components.swift
Model/   Profile, SharedProfile, SavedConnection, Interest catalogue,
         InteractionRating, MutualMatch
Service/
  MotionDetector       CoreMotion → SpikeGate
  SpikeGate            pure threshold/rearm/cooldown state machine (unit-tested)
  RangingService       NISession per peer, bounded, attributed
  PeerTransport        MultipeerConnectivity or server relay, swappable
  StreetPass/          ambient encounter transport, ranging and gate
  LiveActivityController  bounded background session status
  WireProtocol         versioned + bounded + idempotent messages
  PairingMatcher       pure matching algorithm (unit-tested)
  InterestMatcher      grounded overlap (unit-tested)
  TalkingPointMatcher  shared vs complementary, each backed by both cards
  ConversationService  Grok (via bump-api) → Foundation Models → deterministic
  BumpAPI              client for bump-api + shared grounding checks
  OnboardingModel      the Pre-phase state machine (cancellation, fallbacks)
  IntroRecorder        45 s mic capture, interruptions, silence detection
  LocalDrafter         on-phone drafting + questions (local-only / fallback)
  RatingPrompter       pure timing policy for the post-bump card (unit-tested)
  MatchEvaluator       pure "did both say yes" rule (unit-tested)
  MutualLikeResolver   where the partner's thumb comes from — SEE BELOW
```

### The post-bump card, and what it unlocks

`View/RateInteractionSheet` asks two questions after a bump. They have
DIFFERENT privacy and say so in separate lines of copy:

- **what landed** (`InteractionRating.landedInterestIDs`) never leaves the phone;
- **the thumb** (`InteractionRating.wantsToConnect`) is revealed only when both
  people answered yes. A no, and a skipped question, are indistinguishable from
  the other side.

A yes/yes records a `MutualMatch` (`matches.json`), which raises
`View/MatchSuccessSheet`, adds a row to `View/NotificationsScreen`, and ungates
the partner's interests/experiences/goals on `ConnectionDetail`. The card being
unlocked is `SavedConnection.partnerProfile` — the `SharedProfile` that already
arrived at bump time and is now kept rather than discarded. Optional, so
connections saved before this say so instead of showing an empty profile.

A match is **sticky**: flipping your own answer to no later does not revoke a
profile the other person has already seen. Notification rows stay **derived**
from `connections` + `matches` + `streetpasses`; there is no separate
notification record.

**`LocalMutualLikeResolver` is a STAND-IN, not reciprocity.** BUMP has no user
database and no durable channel — `backend/src/server.js` is an xAI proxy plus a
relay whose mailboxes live only for the duration of a bump — so there is nowhere
to read a real answer from once the peer is gone. It derives a stable
pseudo-answer from the connection's `id` so the flow is exercisable and
demoable. Replacing it needs a durable per-person like mailbox and an identity
the app does not yet have; at that point the type is deleted and the real client
conforms to `MutualLikeResolver` instead. Nothing in the UI copy may describe
the current behaviour as a real two-sided check.

DEBUG demo entry points: `-BumpDemo rate`, `match`, `unlocked`, `notifications`.

Tests in `ios/BumpTests/` include `APIResolutionTests`, `ContractTests`, `LogicTests`,
`OnboardingTests`, `DesignTests`, `StreetPassTests`, `RatingTests`, and
`MatchTests`.

## The central honesty constraint

**Motion tells a phone *that* it was tapped, not *who* tapped it.**

The coordinator pairs bumps by its own arrival times. When several people bump
at the same instant that genuinely cannot identify partners, so BUMP
**rejects rather than guesses**, and offers a manual pick which is recorded
honestly *as a manual pick*. UWB distance is much stronger evidence about
*which* peer, when available.

The number that decides whether this works in a crowded room is the
**rejection rate**, reported separately from accuracy in `RESULTS.md` —
rejecting everything would otherwise look like perfect accuracy. That data does
not exist yet.

## Instrumentation

Live acceleration, live UWB distance, pairing sliders, event log, diagnostics
export — all behind **You ▸ Testing tools**, deliberately kept out of the
normal flow.

## Status

The current app has not been built or type checked in Xcode. Mac syntax parsing
and the standalone resolver checks pass; backend mocked tests pass separately.
Earlier inherited UI code was inspected in a Simulator and on one iPhone; those
historical results do not validate the Aster revision. **The current two-phone
flow is unproven.** See the dated readiness section above before following
older environment or tunnel instructions elsewhere in the notes.

## History

Evolved from a Nearby Interaction spike. The working `NISession` /
`NINearbyPeerConfiguration` / MultipeerConnectivity code was kept and refactored
into `RangingService` and `PeerTransport`. An earlier Node + Socket.io browser
experiment was removed from the tree; it is still in git history at commit
`278d2e0` if the matching algorithm or browser `devicemotion` work is needed.
