---
title: Global Shell - Plan
type: feat
date: 2026-11-25
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Global Shell - Plan

## Goal Capsule

- **Objective:** Every page of Yash's portfolio opens inside the same finished cinematic frame: the right fonts, a tiny readable nav, moving film grain and a rounded film-frame vignette. It looks right at 1440px and 390px and never gets in the way of reading or clicking.
- **Means:** Improve the existing `css/tokens.css` and `js/grain.js` in place, and self-host the fonts (KTD1, KTD3).
- **Authority:** CLAUDE.md quality bar > this plan's Requirements > KTDs > unit Approach notes.
- **Stop conditions:** Stop and ask Yash if the nav links on a cream page cannot reach 4.5:1 contrast without moving the nav out from under the vignette (R9). Also stop if self-hosting a font is blocked (no network or license problem) rather than falling back to Google's CDN.
- **Execution profile:** Plain HTML/CSS/vanilla JS, no build step. Verification is in the browser, not unit tests.
- **Finishes and ships:** `ce-work` implements. Yash reviews in the browser and commits.

---

## Product Contract

### Summary

Turn the starter tokens and grain script into a finished shared shell. Fonts load from the repo. The nav floats over the page, with colours set per page and a contrast-safe dimmed state. The grain flickers without exposing edges and resolves its texture path from wherever the page lives. The vignette reproduces the reference's rounded, dark-cornered film frame and thins on phones. Two starter pages prove the shell on a dark and a cream background.

### Problem Frame

Every later backlog feature (dust intro, About split, home hero, project pages) sits inside this frame. If the frame is unfinished, each feature works around it and the look drifts page by page. The starter has three concrete defects:
- Fonts load through a render-blocking Google `@import`, which costs Lighthouse points.
- The nav uses `mix-blend-mode: difference`, which turns it blue-black on cream instead of ink.
- The flickering grain layer is exactly viewport-sized, so its jitter exposes bare strips at the edges.

The reference (`reference/02`, `05`, `06`, `11`) shows a rounded TV-style frame with solid dark corners. The current inset shadow alone leaves those corners transparent.

### Requirements

**Type**
- R1. Headings and body use Outfit and accent details use Fraunces, both served from the repo with no request to Google.
- R2. Text stays visible while fonts load, and the page does not visibly jump when the heading font arrives.

**Nav**
- R3. Every page shows the tiny nav: "Yash Santwani" on the left, linking home; "Portfolio, About, Contacts" on the right, with the commas as part of the text.
- R4. The current page's link is bright and bold. The other links are dimmed but still readable. Home counts as "Portfolio".
- R5. The nav floats over the page with no bar or background, and content scrolls underneath it.
- R6. Each page declares its nav colours, and the name and the links can be coloured independently (e.g. a white name over a photo, ink links over cream).
- R7. The "Contacts" link is a placeholder for now and must not break whether feature 14 makes it a page or a footer anchor.
- R8. At 390px the nav stays on one line with no hamburger menu.

**Grain and vignette**
- R9. All nav text and body text keeps at least 4.5:1 contrast against the page background as rendered under the vignette's darkened corners and the grain. Brief overlap with content scrolling under the floating nav is accepted (see Key Decisions: nav floats, text passes under it).
- R10. Film grain covers every page and flickers subtly, with no visible edge or seam at any moment.
- R11. The vignette is a rounded frame with solid dark corners outside the curve and a dark falloff inward, as in the reference.
- R12. On phones the vignette is thinner and its corner radius smaller, so content keeps its room.
- R13. Grain and vignette sit above the nav and content but never intercept clicks, taps, hover or text selection.
- R14. With `prefers-reduced-motion`, the grain is static and all content is visible.

**Reuse**
- R15. A new page gets the whole shell by linking one stylesheet, one script and the nav markup. Grain works from any folder depth, including future project pages in a subfolder and the GitHub Pages `/yash-portfolio/` path.

### Key Decisions

- **Outfit + Fraunces, self-hosted** (session-settled: user-directed — chosen over buying TT Norms Pro or comparing other free fonts: free, close enough, no third-party request). Governs R1.
- **Nav floats like the reference; text passes under it** (session-settled: user-directed — chosen over hide-on-scroll, a top-edge text fade, and a frosted bar: purest match to the reference feel). Governs R5.
- **Grain flickers on every page** (session-settled: user-directed — chosen over static grain and flicker on dark pages only: feels alive like film). Governs R10, R14.
- **Contacts target decided at feature 14** (session-settled: user-directed — chosen over committing now to a contacts page or a footer anchor). Governs R7.
- **Vignette scales down on phones** (session-settled: user-directed — chosen over full-strength on all sizes and no frame on phones). Governs R12.
- **Nav sits under the vignette** (session-settled: user-directed — chosen over nav above the vignette and nav padded inward: more authentic to the reference, with the known risk to contrast on cream pages). Governs R9, R13.
- **Per-page nav colours instead of a blend mode** (session-settled: user-approved — proposed over keeping `mix-blend-mode: difference` because difference turns ink text blue-black on cream). Governs R6.

### Success Criteria

- Placed side by side with `reference/02` and `reference/06`, the frame, grain and nav read as the same family. Yash judges this.
- Lighthouse mobile Performance and Accessibility are both at least 90 on `index.html` and `about.html`.

### Scope Boundaries

- Dust canvas, intro screen, About split layout, home hero and project grid are later backlog features. This plan only keeps the existing demos working.
- Contacts page or footer: feature 14.
- The reference's "Nominee" side badge is not part of this site.
- Not built: automatic nav-colour detection that reads what's behind the nav while scrolling. On every planned page, each nav element has one background behind it (About's photo-name / cream-links split is handled by R6). Revisit if a page ever mixes dark and cream sections under the nav.
- Not built: a JS-injected shared nav. Copied markup is simpler and has no flash or JS dependency (KTD4).

#### Deferred to Follow-Up Work

- `CLAUDE.md` "Learned rules" entries and `docs/solutions/` notes from this feature belong to the compound step after review.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Self-host latin-subset WOFF2 files and declare them in `tokens.css`.** Download Outfit (variable, or static 300/400/600) and Fraunces 400 normal + italic, latin subset only, into `assets/fonts/`. Use `font-display: swap`, and preload only the Outfit file each page uses for headings. Replace the Google `@import`, which chains a blocking CSS request before any font starts. Both families are SIL OFL, so redistribution is allowed. Keep the OFL licence text alongside the fonts. Implements R1, R2.
- KTD2. **Reduce font-swap shift with a metric-adjusted fallback.** Add a local fallback `@font-face` (based on Arial/Helvetica) with `size-adjust` / `ascent-override` tuned to Outfit, so 160px display text barely moves on swap. Exact values are found at implementation. Implements R2.
- KTD3. **Nav colours as CSS custom properties set per page on `body`.** Use separate properties for name colour, link colour and dimmed-link colour, with defaults for light and dark themes and a per-page override. Drop `mix-blend-mode`. Show the dimmed state with a dimmer colour token, not opacity. On cream, `opacity: .6` ink gives about 3.4:1 and fails R9, while `--ink-soft` (#5A524A) on #D9CCB4 gives about 4.8:1. Implements R4, R6, R9.
- KTD4. **Nav markup is copied into each page from one canonical snippet.** The snippet lives as a comment at the top of the nav section in `tokens.css`. Each page sets `aria-current="page"` on its own link. There is no build step to share partials (CLAUDE.md), and a JS-injected nav would flash and fail without JS. Implements R3, R15.
- KTD5. **Grain layer is oversized and jittered by `transform`.** Make the layer larger than the viewport (about 10–15% overscan on every side) so the stepped translate never shows an edge. A transform-only animation stays on the compositor. Implements R10, R14.
- KTD6. **Grain texture URL resolves from the script's own location**, not the page's. Derive it from the current script's `src`, so pages in subfolders and the GitHub Pages sub-path work. Today `url("assets/grain.svg")` sits in an injected `<style>` and resolves against the page URL. Implements R15.
- KTD7. **Vignette uses a rounded element plus an outward spread for the solid corners, and an inset shadow for the falloff.** Inset shadows alone leave the area outside the rounded corners transparent. A large outward spread fills it. Blur, spread and radius are set with `clamp()` and `vw`, so the frame thins on phones without a breakpoint jump. Implements R11, R12.
- KTD8. **Meet R9 by shaping the vignette, not by moving the nav.** Budget: with `--ink-soft` as the dim colour (4.83:1 on plain cream), grain and vignette combined must keep the rendered cream behind every nav link at relative luminance ≥ 0.567, about 7% darkening at most. The current multiply grain already uses much of that. If the top-right corner darkens the cream behind the dimmed links below 4.5:1, first ease the corner falloff (smaller blur reach or lower top-edge alpha) and/or move the links to a slightly darker dim token. If neither works while keeping the reference look, hit the Goal Capsule stop condition and ask Yash. Implements R9 within the settled "nav under vignette" decision.
- KTD9. **Layering order: content < nav (z 50) < grain and vignette (z 100), all overlays `pointer-events: none`**, matching the existing `grain.js`. Implements R13.

### Implementation Constraints

- No frameworks, bundler or build step. GSAP is not needed.
- Images and fonts stay small. Fonts are latin subsets, and each WOFF2 should be well under 100 KB.
- Keep the existing public hooks working: `body.is-dark`, `.nav`, `.section-head`, `.display`, `.big-number`, and `js/grain.js` included with `defer`.

### Assumptions

- Each nav element (name, links) has one consistent background behind it on any page. Home and Portfolio are dark/photo throughout. The real About page (feature 4) has the photo behind the name and cream behind the links. R6's independent name and link colours handle that split, so no background detection is needed. Until then, the `about.html` stub is cream throughout.

---

## Implementation Units

### U1. Self-hosted fonts and token cleanup

- **Goal:** Fonts load from the repo with no layout jump. Tokens gain the nav colour properties.
- **Requirements:** R1, R2, R6 (tokens only)
- **Dependencies:** none
- **Files:** `assets/fonts/` (new WOFF2 files + OFL licence text), `css/tokens.css`
- **Approach:**
  1. Fetch the latin-subset WOFF2 files for Outfit and Fraunces (KTD1). Keep the OFL text.
  2. Replace the `@import` with `@font-face` rules and the metric-adjusted fallback (KTD2). Put the fallback in `--font-sans` and `--font-serif`.
  3. Add the nav colour tokens with light-theme and dark-theme defaults (KTD3).
- **Patterns to follow:** existing token naming in `css/tokens.css` (`--ink`, `--ink-soft`, `--ink-on-dark`).
- **Test scenarios:**
  - Load `index.html` with the network panel open: no request to `fonts.googleapis.com` or `fonts.gstatic.com`, and the WOFF2 files load from `assets/fonts/`.
  - Throttle to Slow 4G: headline text is visible before the font arrives, and the swap moves the display headline by only a few pixels.
  - The Fraunces italic renders as a true italic, not a synthesized one.
- **Verification:** The network shows only same-origin font requests. Lighthouse reports no render-blocking font CSS.

### U2. Nav: per-page colours, readable dimmed state, canonical markup

- **Goal:** The nav matches the reference on every background, with no blend mode.
- **Requirements:** R3, R4, R5, R6, R7, R8, R9 (nav text without the vignette)
- **Dependencies:** U1
- **Files:** `css/tokens.css`, `index.html`
- **Approach:**
  1. Rewrite the `.nav` rules per KTD3: separate name and link colours, current link bold and bright, others use the dim token, hover brightens.
  2. Add the canonical nav snippet comment (KTD4). The Contacts link points to a harmless placeholder (`#contacts`) per R7.
  3. Check the 390px fit. If it is tight, reduce gap or padding before reducing font size below 13px.
- **Patterns to follow:** current `.nav` and `.nav__links` structure in `css/tokens.css`. Commas live inside the link text as in `index.html`.
- **Test scenarios:**
  - On a dark page (`body.is-dark`), the name and links are light, "Portfolio," is bold and bright, and the others are dimmed and at least 4.5:1.
  - On a cream page, the links are ink and the dimmed ones are at least 4.5:1 against #D9CCB4. Check with DevTools' contrast picker.
  - A page overriding only the name colour (white name, ink links) renders both correctly. Test this on a temporary page or with a DevTools override, with a dark block behind the name, and remove it afterwards.
  - At 390px, the name and all three links fit on one line with no wrap or overlap.
  - Keyboard: Tab reaches the name and each link in order with a visible focus style.
  - Scrolling text passes under the nav, and the nav has no background (R5).
- **Verification:** The nav reads correctly on dark and cream at 1440 and 390 widths.

### U3. Grain and vignette rebuild in `js/grain.js`

- **Goal:** Edge-free flickering grain and a reference-accurate rounded frame that thins on phones and works from any page path.
- **Requirements:** R9, R10, R11, R12, R13, R14, R15
- **Dependencies:** U2 (contrast is measured against the finished nav)
- **Files:** `js/grain.js`, `assets/grain.svg` (only if tile tuning is needed)
- **Approach:**
  1. Resolve the texture URL from the script's own `src` (KTD6).
  2. Oversize the grain layer and keep the stepped transform jitter (KTD5). Keep the current blend modes for cream and dark unless contrast fails.
  3. Make a first rough build of the vignette per KTD7, then straight away measure nav contrast in the top-right corner on the cream page against the KTD8 budget, before any visual polish. Hit the stop condition early if the budget can't be met.
  4. Polish the vignette with fluid blur, spread and radius, re-measuring after each change.
  5. Keep the reduced-motion rule. Keep `aria-hidden` and `pointer-events: none` on both overlays (KTD9).
- **Patterns to follow:** existing IIFE + injected `<style>` structure of `js/grain.js` and `js/reveal.js`.
- **Test scenarios:**
  - Watch the edges for 10 seconds at 1440 and at 390: no bare strip appears during the flicker.
  - All four corners show solid dark fill outside the curve, as in `reference/06`.
  - At 390px the dark edge is visibly thinner than at 1440, and content near the edges stays readable.
  - Open a page in a subfolder (temporary test page, deleted afterwards) and from a GitHub-Pages-like sub-path: grain still loads.
  - With reduced motion emulated in DevTools: the grain is still and all content is visible.
  - Clicking nav links and selecting body text work through the overlays. A link in the darkened bottom-right corner is still clickable.
  - On the cream page, take a screenshot with grain and vignette active. Eyedrop the glyph colour of each nav link and the darkest adjacent background pixel ("Contacts" in the top-right corner included), and compute the ratio from those two sampled colours. It must be at least 4.5:1, otherwise apply KTD8. The DevTools contrast picker and Lighthouse ignore the overlays, so they cannot prove this.
- **Verification:** No edge artefacts, the frame matches the reference, and all contrast checks pass.

### U4. Starter pages prove the shell on dark and cream

- **Goal:** Two real pages demonstrate the shell, and the nav's current-page state works across them.
- **Requirements:** R3, R4, R15, Success Criteria
- **Dependencies:** U1, U2, U3
- **Files:** `index.html`, `about.html` (new stub)
- **Approach:**
  1. Make `index.html` fully dark (dust intro only), so the floating nav never sits over cream there.
  2. Move the cream demo content (display heading, numbers demo) into a minimal `about.html` stub. It uses the cream theme defaults (ink name, ink links), "About," marked current, and the same stylesheet, scripts and font preload. The stub has no portrait behind the name, so the white-name override waits for feature 4, which adds the photo half. Feature 4 replaces its body.
  3. Add the Outfit preload to both heads.
- **Patterns to follow:** current `index.html` head and script includes.
- **Test scenarios:**
  - Navigate Home → About → Home: the bold current link follows the page.
  - `about.html` shows reveal and counter demos still working on cream under the grain.
  - Console is empty on both pages.
- **Verification:** Both pages pass the Verification Contract below.

---

## Verification Contract

| Check | How | Pass |
|---|---|---|
| Local serve | `python -m http.server 5500` (or `python3`), open `http://localhost:5500` | Both pages load |
| Desktop / phone | Chrome DevTools at 1440×900 and 390×844 | R3–R12 visually hold |
| Reduced motion | DevTools → Rendering → emulate `prefers-reduced-motion: reduce` | Grain static, content visible |
| Contrast | Screenshot pixel sampling with grain and vignette active: glyph colour vs darkest adjacent background, for nav links (top-right corner on `about.html` included) and body text near the edges. The DevTools picker and Lighthouse ignore the overlays and do not count. | ≥ 4.5:1 everywhere |
| Clicks through overlays | Click every nav link and select text near each corner | All work |
| Console | DevTools console on both pages | No errors |
| Lighthouse | DevTools Lighthouse, mobile, on both pages (or `npx lighthouse http://localhost:5500 --only-categories=performance,accessibility`) | Performance ≥ 90, Accessibility ≥ 90 |
| Fonts | Network panel | No Google Fonts requests |

## Definition of Done

- U1–U4 complete and every Verification Contract row passes on `index.html` and `about.html`.
- If R9 could not be met with the nav under the vignette, Yash has been asked and decided (Goal Capsule stop condition).
- Font files carry their OFL licence and every WOFF2 is under 100 KB.
- No leftover temporary test pages, commented-out experiments or unused tokens from abandoned attempts.
