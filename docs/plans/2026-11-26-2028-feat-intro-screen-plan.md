---
title: Intro Screen - Plan
type: feat
date: 2026-11-26
topic: intro-screen
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Intro Screen - Plan

## Goal Capsule

- **Objective:** On the home page, a visitor first sees your name glow into view over the dust. Scrolling then hands them off naturally to a bold full-screen hero, the way reference 01 leads into reference 02.
- **Means:** The intro stays an ordinary page section that scrolls away (KD1). A placeholder hero section follows it, and Feature 11 later replaces the placeholder's content.
- **Product authority:** Backlog Feature 3 (`docs/backlog.md`), the decisions settled in the brainstorm conversation (Key Decisions below), then this plan. The seated-person photo (Feature 11) and the project grid (Feature 12) are out of scope.
- **Execution profile:** Plain HTML and CSS plus a few lines of page script, no new dependencies. Two small units in `index.html`, executed inline in order.
- **Stop conditions:** Stop and ask if the name's entrance or scroll fade pulls Lighthouse mobile below 90, or if the nav or yellow headline can't keep 4.5:1 over the hero.
- **Open blockers:** None.

---

## Product Contract

### Summary

On load the dust appears first, then your name fades in as its glow builds. The intro is a normal section, so scrolling slides it up and away, and your name fades a little as it leaves. Underneath sits a full-screen dark placeholder hero with the draft headline spread across in the yellow display style. Feature 11 swaps in the seated-person photo there.

### Problem Frame

Today the home page is one dark screen with nothing below it. Scrolling leads nowhere, and the name simply appears. The reference's opening works because a quiet intro gives way to a bold hero on the first scroll. Feature 11 (the real hero photo) needs a section to land in, so this feature creates that section now with placeholder content.

### Key Decisions

- KD1. **The intro scrolls away as a normal section, with no pinning.** (session-settled: user-directed — chosen over a pinned cross-fade and over the name flying into the nav, after comparing all three in a browser sketch: the plain scroll felt right.) Governs R3, R4.
- KD2. **The name's glow fades in on load.** (session-settled: user-directed — chosen over an ink-blot reveal, which would build part of Feature 6 now, and over no entrance.) Governs R1, R2.
- KD3. **A small "Scroll" hint sits bottom-centre of the intro.** (session-settled: user-directed — reversed after the first build; originally no cue, to keep the screen clean like reference 01.) Governs R5.
- KD4. **The placeholder hero shows the headline on plain dark.** (session-settled: user-directed — chosen over a blank section and over a stand-in photo.) Governs R6, R7.

### Requirements

**Intro**

- R1. On load the dust is visible first, and your name fades in with its glow building over about 1.5 seconds.
- R2. With reduced motion on, your name is visible from the first frame, with no fade-in.
- R3. The intro is a normal full-screen section that scrolls up and away with the page.
- R4. As the intro scrolls away, your name fades. It is fully gone before it reaches the nav, and scrolling back up brings it back. With reduced motion on, the name doesn't fade.
- R5. A small "Scroll" text hint sits bottom-centre of the intro, gently pulsing, and hides once scrolling starts. It returns at the very top. With reduced motion on, it doesn't pulse. It keeps 4.5:1 at its faintest.

**Hero placeholder**

- R6. A full-screen dark section follows the intro. It shows the headline "AI & product" | "Builder" in the yellow display style, split across the width (reference 02), on a warm dark background with a subtle amber glow bottom-right (updated after the first build; was the backlog draft in three parts).
- R7. The section is clearly a placeholder that Feature 11 replaces with the seated-person photo. Its structure lets that happen without touching the intro.
- R8. On a 390px phone the headline stays readable and inside the frame, wrapping as needed.

**Whole page**

- R9. Your name stays the page's main heading, and the hero headline is a secondary heading.
- R10. The nav stays on top of both sections and keeps its dark-page colours. The nav text and the yellow headline keep 4.5:1, measured from rendered pixels with the grain and vignette on (`docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md`).
- R11. Lighthouse mobile stays at 90 or above for Performance and Accessibility, with no console errors.

### Acceptance Examples

- AE1. **Covers R1.** Given a fresh load at 1440px, the dust is visible at once and your name reaches full glow within about 2 seconds.
- AE2. **Covers R2, R4.** Given reduced motion is on, your name is fully visible at load and stays fully visible while scrolling.
- AE3. **Covers R3, R4.** Given you scroll down slowly, the intro moves up, your name fades out before it leaves, the hero headline arrives, and scrolling back up restores the name.

### Scope Boundaries

- The seated-person photo and the final hero layout are Feature 11. The project grid below the hero is Feature 12. After the hero the page simply ends for now.
- Dust stays in the intro only. The hero has none.
- Final headline wording is not decided. The backlog draft is used until you supply the real wording.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **The entrance animates the name, and the scroll fade animates a wrapper around it.** A CSS keyframe fades opacity in and grows the `text-shadow` glow on the `h1`, using `animation-fill-mode: backwards` so the animation stops controlling the name once it ends. Page script sets the scroll fade's opacity on the intro's text wrapper. Putting the two on separate elements means they never fight over the same property. Governs R1, R4.
- KTD2. **The scroll fade comes from a passive `scroll` listener batched through `requestAnimationFrame`.** The fade distance is the name wrapper's top offset in the intro minus the nav height (about 30vh − 48px), and opacity is `1 − scrollY / distance`, clamped to 0–1. That way the name is gone before it passes under the nav. CSS scroll-driven animations are skipped because they're not supported in all target browsers. The listener does nothing when reduced motion is on. Governs R4.
- KTD3. **The page-specific behaviour stays in `index.html`.** It's about ten lines of inline script plus page styles, like the current starter page. The reusable effects in `js/` (grain, dust) are untouched. Governs R1–R8.
- KTD4. **The hero headline is an `h2` with three spans laid out by flexbox.** The spans are spread across the width with `justify-content: space-between`, in `--accent-dark`, weight 600. The size follows the copy's real length, roughly `clamp(28px, 3.4vw, 64px)`, so the full line takes about 75vw and fits on one row inside the side padding. `flex-wrap: wrap` is on at all widths as a safety net. Below 600px the parts wrap and left-align. The section has a `hero--placeholder` modifier and a comment naming Feature 11. Governs R6–R9.

### Assumptions

- The headline wording is the backlog draft until the user supplies final copy.
- The name's glow at full strength matches the current `text-shadow` on the intro `h1`. Only its build-up is new.

---

## Implementation Units

### U1. Name glow on load and fade on scroll

- **Goal:** Your name fades in with a growing glow after load, and fades as the intro scrolls away.
- **Requirements:** R1, R2, R3, R4, R5, R9. KD1, KD2, KD3. KTD1, KTD2, KTD3.
- **Dependencies:** None.
- **Files:** `index.html`.
- **Approach:**
  1. Wrap the intro `h1` in a text wrapper. Add a keyframe that goes from opacity 0 and no glow to opacity 1 and the current glow. Use a short delay (about 0.3s) so the dust is seen first, a duration of about 1.5s, and `animation-fill-mode: backwards`.
  2. Under `prefers-reduced-motion: reduce`, turn the animation off.
  3. Add the inline script from KTD2 to set the wrapper's opacity on scroll. Skip it entirely under reduced motion.
  4. Leave the dust canvas and nav untouched.
- **Patterns to follow:** The reduced-motion rules in `js/grain.js` and `js/reveal.js`, and the existing `.intro` styles in `index.html`.
- **Test scenarios:**
  - Covers AE1. Hard-reload at 1440×900: the name starts invisible, glows in, and reaches full glow within about 2 seconds.
  - Covers AE3. Scroll slowly: the name reaches 0 before it passes under the nav, and scrolling back restores it.
  - Covers AE2. Emulate reduced motion: the name is visible at load and doesn't fade on scroll.
- **Verification:** All scenarios pass at 1440 and 390, with no console errors.

### U2. Hero placeholder section

- **Goal:** A full-screen dark hero with the spread yellow headline follows the intro, ready for Feature 11.
- **Requirements:** R6, R7, R8, R9, R10. KD4. KTD4.
- **Dependencies:** U1 (same file, sequential edits).
- **Files:** `index.html`.
- **Approach:** Add a `section.hero.hero--placeholder` after the intro inside `<main>`. Give it a full-viewport height and the dark background, with the `h2` and three spans from KTD4, vertically placed a little above centre like reference 02. Update the page's top comment so it says which features replace each section.
- **Patterns to follow:** The `.intro` section sizing in `index.html` and the tokens in `css/tokens.css` (`--accent-dark`, `--bg-dark`, spacing).
- **Test scenarios:**
  - At 1440×900 and 1024×768, the three headline parts sit on one row spread across the width, inside the side padding, like reference 02.
  - At 390×844, the headline wraps, stays inside the frame and stays readable.
  - The nav stays over the hero with its dark-page colours. The nav links and the yellow headline measure at least 4.5:1 from rendered pixels with the overlays on.
  - The dust stops animating once the intro is scrolled out (existing behaviour) and doesn't appear in the hero.
- **Verification:** Scenarios pass, and Lighthouse mobile scores at least 90 for Performance and Accessibility.

---

## Verification Contract

There's no test runner (CLAUDE.md), so verification is browser-driven, as in Features 1 and 2.

| Check | How | Pass |
|---|---|---|
| Local serve | `python -m http.server 5500`, then open `http://localhost:5500` | Page loads |
| Desktop and phone | Chrome at 1440×900 and 390×844 | U1 and U2 scenarios hold |
| Reduced motion | DevTools → Rendering → emulate `prefers-reduced-motion: reduce` | Name visible at once, no scroll fade |
| Contrast | Pixel sampling per `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md` over the hero | Nav links and headline at least 4.5:1 |
| Console | DevTools console | No errors |
| Lighthouse | `npx lighthouse http://localhost:5500/index.html --only-categories=performance,accessibility --form-factor=mobile` | Both at least 90 |

---

## Definition of Done

- U1 and U2 are complete, and every Verification Contract row passes.
- R1–R11 hold, and AE1–AE3 are demonstrated.
- No leftover test markup or experiments. The page's top comment states which features replace which sections.
