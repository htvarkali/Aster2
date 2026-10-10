# Aster website

Aster is the Crafting Constellations adaptation of [Bump](https://github.com/bump-hackgt/bump). This standalone website uses the landing-page UI from [Lanyardly](https://github.com/tejavarkali-hub/lanyardly), adapted to React, TypeScript, and Vite.

The reference's layout, Geist typography, animated dither background, draggable 3D lanyard, feature cards, journey layout, rounded closing panel, and footer are retained. At the user's request, the monochrome palette is replaced with navy surfaces, cobalt accents, and pale blue text. Event-specific dates, sponsors, venue, registration links, social posting, and analytics are replaced with accurate Aster content and real links. The original Bump team remains credited in the root README.

## Run locally

Use Node 22.12+:

```sh
cd web
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173).

```sh
npm run build       # TypeScript checks and production build in dist/
npm run preview     # localhost:4173
npm run typecheck
```

The website requires no account, API key, subscription, or backend. Badge personalization and PNG export happen entirely in the browser. The website does not pair real phones. Product copy describes the local typed-profile flow; cloud transcription and Grok are optional backend features and are not needed by this site.

## Active UI

- `src/components/LanyardLanding.tsx` and its CSS: page composition, header, mobile menu, local badge controls, feature cards, meeting steps, closing panel, and footer.
- `src/components/Lanyard3D.tsx`: reference GLB with React Three Fiber, Drei, Rapier rope joints, and Meshline. Pointer dragging moves the actual 3D badge.
- `src/components/DitherBackground.tsx`: the reference React Bits wave shader and ordered dither effect, through React Three Fiber and Postprocessing.
- `src/components/asterBadge.ts`: Aster artwork on the model's square UV atlas plus a separate front-facing PNG export. Name and blue/light choices are local state.
- `src/styles/global.css`: active blue palette and semantic color variables; `index.html` loads Geist and Geist Mono.
- `public/lanyard/card.glb` and `public/lanyard/strap.png`: original model and strap assets copied from Lanyardly. A custom texture replaces its original badge artwork before the card renders.

The former Aster/Bump page components remain as inactive source references. `App.tsx` renders only `LanyardLanding`.

## Motion and fallback

Pause motion freezes the dither, 3D physics, and context strip. Reduced-motion preferences start with a stable badge and readable page. Expensive hero rendering pauses when the hero leaves the viewport. WebGL, asset, or context failures retain a static Aster badge. The controls and download work with that fallback too.

The 3D code is loaded separately from the main UI. Its physics/WASM dependencies make that optional chunk larger than the rest of the page. Lower-power devices can use the static badge if WebGL is unavailable.

## Verification

`npm run build` performs TypeScript checking and builds the production site. Browser review should cover desktop/mobile layouts, the mobile menu, badge dragging, name and color application, PNG download, pause/resume, reduced motion, static fallback, anchors, and horizontal overflow.

The blue revision passed the production build and desktop/narrow-screen browser review. The actual 3D card rendered and responded to dragging; personalization, both badge colors, PNG export, pause, and all in-page anchor destinations were checked. No application errors were observed. Rapier emits an upstream WASM initialization deprecation warning. Reduced-motion behavior is implemented and was reviewed in source; the browser's system preference was not changed for this check.

The inherited `verify-reveal.mjs`, `robustness.mjs`, and `shots.mjs` target the older pinned-phone layout and are not checks for this page. `verify-constellation.mjs` targets the earlier ivory Aster design and is also inactive.

## Template attribution

The requested visual template is [tejavarkali-hub/lanyardly](https://github.com/tejavarkali-hub/lanyardly), including its original lanyard geometry, strap asset, and dither shader. Its components credit [Tailark](https://tailark.com/) and [React Bits](https://reactbits.dev/). Aster's app and backend are inherited from [Bump](https://github.com/bump-hackgt/bump). Aster's source destination is [htvarkali/Aster2](https://github.com/htvarkali/Aster2); the page's source buttons point there while original-project attribution keeps the Bump links.
