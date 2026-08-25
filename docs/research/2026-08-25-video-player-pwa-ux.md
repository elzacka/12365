# Research: Video player UX in Opplæring (fullscreen, overlay, controls)

**Date:** 2026-08-25

## Problem Statement

The video player in Opplæring (`src/pages/VideoPage.tsx`) uses a bare native `<video controls playsInline preload="auto">` for local mp4 files, and provider `<iframe>` embeds for YouTube/Vimeo/Canva. Three UX weaknesses were flagged:

1. No way to reliably watch full screen on mobile in both portrait and landscape.
2. Playback should start with no disturbing overlay, visible and audible from the very first frame.
3. Controls should be standard, discoverable, and non-disruptive (auto-hiding, no invented gestures).

## Key Findings

### 1. Fullscreen in both orientations

| Claim | Status as of Aug 2026 | Source |
|---|---|---|
| iOS Safari routes `<video>` fullscreen through its own native player (`webkitEnterFullscreen`), which is landscape-oriented | Still true — no WebKit blog/bug entry found lifting this for plain `<video>` | webkit.org/blog 17.1/18.0 posts; bugs.webkit.org #240312 |
| Fullscreen API (`requestFullscreen()`) on **arbitrary elements** (not `<video>` itself) shipped on iPhone | Landed Safari 17.2 beta (Oct 2023), stable since | WebKit team (X/Jen Simmons); bugs.webkit.org #240312 |
| `screen.orientation.lock()` | **Unsupported on iOS Safari** — throws `NotSupportedError`. Works on Android Chrome, only inside an active fullscreen context | MDN compat data; mdn/browser-compat-data#19355; caniuse.com/screen-orientation |
| Practical workaround reported by developers | Wrap the video in a container `<div>` and call `.requestFullscreen()` on the **div**, not the `<video>` — this escapes iOS's native landscape-locked video-fullscreen UI and behaves like ordinary element fullscreen, which fills the screen in whatever orientation the device is physically in | Apple Developer Forums #133248; community guide (xjavascript.com); Vidstack docs (explicitly disable orientation-lock attempts on iOS) |
| Vidstack/Media Chrome | Both document this iOS limitation and configure orientation-lock as a no-op on iOS rather than trying to force it | vidstack.io/docs/player/api/screen-orientation |

**Conclusion:** "requestFullscreen + object-fit: cover + orientation.lock" is not a reliable single cross-platform recipe. The orientation-lock half only works on Android. The fullscreen-in-either-orientation half is achievable on iOS today, but only by fullscreening a wrapper element, not the `<video>` element itself.

App-specific constraint: `vite.config.ts` sets the PWA manifest `orientation: 'portrait'` (installed app is locked portrait at the OS level). This does not block element-level `requestFullscreen()` on a video container — that's independent of the manifest's install-time orientation lock — so portrait+landscape fullscreen playback is achievable without loosening the app-wide install orientation.

### 2. No overlay, sound from the first frame

| Claim | Status | Source |
|---|---|---|
| Unmuted autoplay without a prior user gesture | Not possible on iOS Safari or Android Chrome, standalone PWA or browser tab — no exception found for installed/standalone display mode | MDN Autoplay guide (updated 28 Jul 2026); webkit.org/blog/7734; Chrome autoplay policy docs |
| Muted autoplay | Always allowed | Same sources |
| A single tap can both start playback and unmute in the same event handler | Functionally supported — the tap itself is the qualifying gesture | MDN Autoplay guide; Chromium autoplay design rationale |
| Real-world fragility | Multiple reports of autoplay/playback breaking specifically in **standalone PWA mode** even when the same code works in a normal Safari tab, across iOS point releases | TeamPiped/Piped#1425; Apple Developer Forums #805900, #762582 |

**Conclusion:** "Audio from the very beginning with zero interaction" is not achievable on mobile web — it's a platform policy, not a bug to engineer around. What's achievable and what actually fixes the reported UX problem: replace the current static poster + separate play-button-overlay (Opplaering.tsx tile, and no equivalent play affordance inside VideoPage) with **immediate silent motion** (muted autoplay starts the instant the page/video is in view) plus a single tap anywhere on the frame that simultaneously unmutes, confirms playback, and (optionally) enters fullscreen — one fluid motion instead of "dismiss overlay, then find play button, then find fullscreen button."

### 3. Standard, non-disruptive controls

| Option | Verdict for this stack |
|---|---|
| Native `<video controls>` only | Not styleable consistently cross-browser; `::-webkit-media-controls-*` is non-standard WebKit-only, and MDN itself recommends a custom control layer for consistent UX rather than relying on it |
| Media Chrome (muxinc) | Actively maintained (releases through Apr–Jun 2026), framework-agnostic web components, wraps native `<video>` directly, installable via npm and bundled by Vite — fits the existing CSP (`script-src 'self'`, no CDN) without changes |
| Vidstack | Official React bindings, modular/tree-shakeable, documents the iOS orientation-lock limitation explicitly |
| Plyr | Still maintained but reported to be folding into a new cross-project effort (see below) — not the forward-looking pick |
| Video.js v10 | In beta since Mar 2026: an explicit merger of Video.js, Plyr, Vidstack, and Media Chrome maintainers combining forces, GA targeted later 2026 — worth watching, likely too early to adopt today (still beta) |

No tier-1 (MDN/web.dev/WebKit/vendor) source names a definitive "best PWA video UX in 2026" practitioner. YouTube shipped a player redesign (Oct 2025, translucent rounded controls, less content obstruction, in-place engagement controls) but reception was mixed — not an unambiguous model to copy wholesale.

### Addendum: re-checked against Safari 26.6.2 specifically

- `requestFullscreen()` on iPhone (landed Safari 17.2, Oct 2023) is still the current mechanism — WebKit release notes for Safari 26.0, 26.3, and 26.4 were read directly and contain no change to portrait-fullscreen video behavior, positive or negative.
- `screen.orientation.lock()` traces to bugs.webkit.org #257695: implemented in WebKit but sits behind an experimental flag, disabled by default. Last update on that bug is July 2024 — no 2025/2026 confirmation it shipped. Current MDN/caniuse tables (fetched live) still mark it unsupported. Treat as still unsupported, though not freshly reconfirmed for 26.x specifically.
- **New, directly relevant finding:** a live 2026 Apple Developer Forums report (thread 805900, "PWA video playback stopped working after updating iOS to 26.0.1") describes `AudioContext` getting stuck `suspended` on load in **standalone/installed PWA mode specifically**, where `resume()` inside a tap handler throws `InvalidStateError` — breaking both video and audio playback, while the same content works fine in a normal Safari tab. No fix or workaround was posted in the thread as of this check. This is a real risk for the "single tap unmutes and plays" pattern recommended below, specific to this app's installed-PWA use case — test the chosen implementation on an actual iOS 26.0.1+ home-screen-installed instance, not just in Safari tabs, before relying on the tap-to-unmute pattern.

### Test matrix (target platforms as of this research)

| Platform | Version |
|---|---|
| macOS | Tahoe 26.6.2 |
| iOS | 26.6.1 |
| Chrome | 151.0.7922.170 |
| Edge | 151.0.4129.78 |

The standalone-PWA `AudioContext`-suspended report (thread 805900) was filed against 26.0.1; no confirmation either way whether it's still present in 26.6.1 — verify directly on a home-screen-installed instance at this version before relying on the tap-to-unmute pattern.

## Codebase Patterns

- `src/pages/VideoPage.tsx:31-40` — bare `<video controls playsInline preload="auto">`, no autoplay, no fullscreen/orientation code anywhere in `src/`.
- `src/pages/Opplaering.tsx:96-104` — decorative-only play-button overlay SVG on video tiles (local-file videos only; not shown for iframe-embedded videos).
- `vite.config.ts:61-96` — PWA manifest: `display: 'standalone'`, `orientation: 'portrait'`.
- `vite.config.ts:15-30` — CSP: `script-src 'self'` (no CDN scripts allowed — any library must be npm-installed and bundled), `style-src 'self' 'unsafe-inline'`, `frame-src` allow-lists only youtube-nocookie.com / player.vimeo.com / canva.com, `media-src 'self' blob:`.
- `public/content/videos.json` — no autoplay/orientation/aspect-ratio fields in the schema; two current entries are both Canva iframe embeds (custom controls only meaningfully apply to the local-mp4 `file` case, since iframe embeds use the provider's own player chrome).

## Verification notes (post-implementation)

Implemented: `MediaController`-wrapped local-mp4 player (Media Chrome) with muted autoplay and a standard control bar, in `src/pages/VideoPage.tsx`. Confirmed via Playwright:

- **Chromium mobile emulation** (iPhone device profiles): muted autoplay works, control bar renders correctly, fullscreen button successfully fullscreens the `<media-controller>` wrapper (not the `<video>`), mute toggle works, zero console errors.
- **Real WebKit engine** (Playwright's `webkit` browser, matching Safari 26.5, with `iPhone 17`/`iPhone 17 landscape` device profiles): muted autoplay and mute-toggle confirmed working identically. **Fullscreen could not be verified** — `document.fullscreenEnabled` and `HTMLVideoElement.webkitEnterFullscreen` both fail (`InvalidStateError`, `webkitSupportsFullscreen: false`) even when called from the most minimal possible test (a raw native `<button>` with no Media Chrome or app code involved, tapped directly). The same desktop-viewport WebKit context (no `isMobile` flag) has full working Fullscreen API. This means Playwright's mobile-WebKit emulation does not expose OS-level fullscreen presentation at all — a testing-environment limitation, not something caused by this implementation, but it also means **fullscreen behavior on real iOS Safari remains unverified by automated testing** and should be checked by hand on an actual iPhone (the project's target is iOS 26.6.1) before relying on it.

## Recommended Approach

Scope custom controls to the local-mp4 (`file`) case only — iframe embeds (YouTube/Vimeo/Canva) already provide their own fullscreen/control UX via `allowFullScreen`, and building a control layer on top of a cross-origin iframe isn't possible anyway.

1. **Fullscreen (both orientations):** Wrap the `<video>` in a container `<div>`. Call `containerRef.current.requestFullscreen()` (with the legacy `webkitRequestFullscreen` fallback) on that div, not on the `<video>` element — this is what escapes iOS's landscape-locked native video-fullscreen player. Style the container with `object-fit: cover` sizing so it fills the screen in whichever orientation the device is currently in. Do not call `screen.orientation.lock()` on iOS (it throws); optionally attempt it on Android as a progressive enhancement, wrapped in try/catch.
2. **No overlay / sound timing:** Replace the static poster/play-button-overlay pattern with muted autoplay starting immediately (motion visible from frame one), and make the entire video frame the tap target: first tap unmutes + confirms play + (optionally) requests fullscreen, in one handler — not a two-step "click to reveal player, then click play." This is the closest achievable version of "sound from the very beginning," since true zero-gesture unmuted autoplay is blocked by both iOS Safari and Android Chrome regardless of PWA install state.
3. **Controls:** Adopt Media Chrome for the local-mp4 case — it's a thin, actively maintained, framework-agnostic web-components layer that wraps the existing native `<video>` without replacing it, installs via npm (fits the `script-src 'self'` CSP with no changes needed), and can be styled with Tailwind classes on its slotted elements rather than fighting `::-webkit-media-controls`. Avoid Plyr (likely being superseded) and hold off on Video.js v10 (still beta as of Aug 2026).
4. Leave the app manifest's `orientation: 'portrait'` untouched — element-level fullscreen on the video container is independent of it.

This is a recommendation for review, not yet implemented.

## Sources

- https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock
- https://github.com/mdn/browser-compat-data/issues/19355
- https://caniuse.com/screen-orientation
- https://webkit.org/blog/15865/webkit-features-in-safari-18-0/
- https://webkit.org/blog/14735/ (Safari 17.1 features)
- https://bugs.webkit.org/show_bug.cgi?id=240312
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/
- https://developer.chrome.com/blog/autoplay
- https://developer.chrome.com/blog/autoplay-2
- https://www.chromium.org/audio-video/autoplay/autoplay-policy-design-rationale/
- https://www.mux.com/blog/media-chrome-turns-1-0
- https://github.com/muxinc/media-chrome
- https://videojs.org/blog/videojs-v10-beta-hello-world-again
- https://vidstack.io/docs/player/getting-started/installation/react/
- https://vidstack.io/docs/player/api/screen-orientation/
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Video_player_styling_basics
- https://9to5google.com/2025/10/14/youtube-video-player-redesign-more/
- https://github.com/sampotts/plyr/issues/1501, #1190, #811
- https://github.com/vidstack/player/issues/1180, #1154, #1366, #987; discussion #1446
- https://developer.apple.com/forums/thread/133248, #805900, #762582
- https://xjavascript.com/blog/go-fullscreen-with-html5-video-on-ipad-iphone/
