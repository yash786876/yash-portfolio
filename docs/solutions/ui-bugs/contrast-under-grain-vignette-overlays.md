---
title: Text contrast under grain and vignette overlays can't be checked with DevTools or Lighthouse
date: 2026-11-25
last_updated: 2026-11-26
category: ui-bugs
module: global shell (grain, vignette, nav)
problem_type: ui_bug
component: frontend
symptoms:
  - DevTools contrast picker reports the nav links pass (4.8:1) while the rendered top-right corner reads about 3:1
  - Lighthouse Accessibility scores 100 although nav text in the darkened vignette corner fails 4.5:1
  - Making the vignette corners darker drops even full-ink nav text below 4.5:1
root_cause: missing_tooling
resolution_type: code_fix
severity: high
related_components:
  - design_tokens
tags: [contrast, accessibility, vignette, film-grain, overlay, wcag, lighthouse, pixel-sampling]
---

# Text contrast under grain and vignette overlays can't be checked with DevTools or Lighthouse

**Feature:** 1. Global shell (and its follow-up fix, "vignette too weak")

## Problem
CLAUDE.md requires "Text contrast checked on top of grain". The grain and vignette are fixed full-screen layers drawn *above* the nav and the content. They sit at `z-index: 100`, above the nav's `z-index: 50` (`js/grain.js:11`, `css/tokens.css:116`). The usual tools never see those layers, so contrast that fails on screen still reports as passing.

## Symptoms
- With the first vignette (inset shadow, alpha .55), the cream behind the dimmed "Contacts" link rendered at about 40% of its luminance: 3.3:1 measured, 2.7:1 against the darkest pixels. DevTools still said 4.8:1.
- Lighthouse mobile scored Accessibility 100 on both pages the whole time.
- When the user asked for darker, reference-style corners, the nav in the top corners fell to 2.9:1 ("Contacts", dimmed) and 3.8:1 (the name, in full ink #1E1B18).

## What Didn't Work
- **DevTools contrast picker / Lighthouse (axe):** both compute contrast from the element's own colour and its CSS background chain. Separate fixed overlays painted on top are ignored, so they can't catch this.
- **Sampling the "darkest background pixel" from a crop of the text:** anti-aliased glyph edges count as background. That reported 2.4:1 for a bold link that actually measured 11.6:1. Far too pessimistic.
- **Sampling a strip beside the text:** the strip sits closer to the frame edge than the glyphs, so it is darker than what's really behind the text. Also pessimistic.
- **Lowering the vignette alpha alone:** the broad inset falloff adds up in the corner, where the top and right edges overlap, and that does most of the darkening. Easing the alpha from .28 to .2 barely moved the corner.
- **Padding the nav inward (34px / 52px):** under strong corners "Contacts" still measured 3.7:1.
- **Darker text alone under strong corners:** once the corner background gets as dark as luminance 0.15–0.2, even near-black ink can't reach 4.5:1.

## Solution
**Measure rendered pixels with the overlays on, against the text-free background behind the glyphs:**

1. Freeze the grain on one frame (`animation: none; transform: translate(-3%, 2%)`) so the text and background shots match.
2. Get the text's exact box with a Range: `document.createRange().selectNodeContents(el).getBoundingClientRect()`.
3. Screenshot (zoom-crop) that box with the text visible.
4. Set the text to `color: transparent`, then screenshot the same box again. That is the real background behind the glyphs, grain and vignette included.
5. Glyph colour = the median of the darkest 3% of pixels in shot 3 (glyph cores; for light text use the lightest 3%). Background = the 5th percentile of shot 4 (for light text, the 95th). Compute the WCAG ratio from those two.

The decoder was a throwaway pure-Python script (stdlib `zlib`/`struct`; Pillow wasn't installed). The core calculation:

```python
def lum(rgb):  # WCAG relative luminance
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)

ratio = (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05)
```

Sanity check: on plain cream with both overlays hidden this read 4.76:1, against 4.83:1 in theory for #5A524A on #D9CCB4.

**Fixes that kept the look and passed (current values):**
- **Shift the corner darkness toward the bottom.** The corner shade is a radial gradient centred high: `ellipse 130% 120% at 50% 26%` (`js/grain.js:48`). The bottom corners get the full shade and the top corners, where the nav sits, get less. The user chose this over "all four corners dark".
- **Use a separate dimmed-nav token, not opacity, and no lighter than needed.** `--ink-dim: #433E39` (`css/tokens.css:50`) is used only for dimmed nav links on cream. The original `--ink-soft` at about 4.8:1 on plain cream had only about 7% darkening headroom, and the old `opacity: .6` gave about 3.4:1 even without any overlay.
- **Darken the small label token slightly:** `--ink-soft: #554E47` (`css/tokens.css:49`) keeps the "01" section label near the right edge at 4.66:1.
- Results at the viewports measured then: cream desktop "Contacts" 4.82:1 and "Portfolio," 5.03:1; phone nav 5.1:1 or better; dark page dimmed "Contacts" 4.75:1.
- **Not a true worst case (found 2026-11-26).** The vignette's corner shade scales with the viewport, so a short window pulls the darker region closer to the nav. At 1257×540 (a laptop window with the browser chrome showing), cream "Contacts" on `about.html` measures **4.47:1** — below 4.5 — with the dust canvas hidden, so it is the shell, not the dust. Still open: it needs a vignette or `--ink-dim` adjustment and a re-measure at short heights.

## Why This Works
Multiply grain and dark vignette shading darken the text *and* the background behind it. With dark text on a light background, contrast falls as both get darker. The budget is set by how dark the background can get: for dark ink with luminance L1 the background must stay at or above 4.5·(L1+0.05) − 0.05. For #5A524A that is luminance 0.567, only about 7% below plain cream (0.612). Each step darker on the dimmed token buys real headroom. Moving the shade's centre up keeps the corners that hold text inside the budget, and the reference's heavy-corner feel survives at the bottom.

On dark pages it works the other way. Light text gets darker under the vignette while the background is already near black, so check dimmed light text there too (4.75:1 here).

## Prevention
- After any change to grain opacity or blend mode, `--fx-edge-*`, `--fx-falloff-*`, `--fx-corner-shade`, the gradient centre, nav padding or a nav colour token, re-measure the nav corners on a cream page and a dark page, at 1440px and 390px, **and at a short height (about 540px tall)**, using the method above.
- **Attribute a low reading before fixing it.** Re-measure the same box with one layer hidden (for example the dust canvas set to `visibility: hidden`). If the ratio barely moves, that layer isn't the cause. That is how the 4.47:1 above was traced to the shell rather than to Feature 2's dust.
- **Anything painted behind the nav spends the same budget.** The dust canvas (`js/dust.js`) fades out under the top 64px of the *viewport*, not of the canvas, because the nav is fixed and keeps sitting over the dust while the page scrolls. With the dust, the dark page's dimmed "Contacts" went from 4.75:1 to 4.63:1.
- **Animated text opacity: measure the faintest frame.** If text pulses or fades while it is meant to be read, freeze it at its lowest opacity (for example `animation: none; opacity: .7`) before measuring. The intro's "Scroll" hint is kept between 0.7 and 1 so it stays at 6.2:1 or better.
- Don't accept DevTools or Lighthouse contrast results as proof for any text under the overlays.
- Treat "stronger vignette" and "nav in the corners" as one design decision. If the corners must go darker everywhere, the nav has to move, get a backing, or change colour, and that is the user's call (Feature 1 plan KTD8 / Goal Capsule stop condition).

## Related Issues
- Plan: `docs/plans/2026-11-25-2223-feat-global-shell-plan.md` (R9, KTD8). The plan anticipated the budget, and the build confirmed it.

## Rule for next time
Measure text contrast under the grain and vignette from rendered pixels (text vs the same box with the text made transparent); DevTools and Lighthouse ignore the overlays.
