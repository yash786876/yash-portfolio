---
title: Thousands of per-speck drawImage calls fail Lighthouse mobile; stamp into one ImageData buffer instead
date: 2026-11-26
category: performance-issues
module: dust canvas (js/dust.js)
problem_type: performance_issue
component: frontend
symptoms:
  - "Lighthouse mobile Performance 72 (index.html) and 75 (about.html) with Accessibility 100 and CLS 0"
  - "Total Blocking Time 1.4-2.2 s, almost all from js/dust.js"
  - "Every animation frame is a 100-150 ms long task under Lighthouse's 4x CPU throttle"
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [canvas, performance, lighthouse, total-blocking-time, imagedata, drawimage, dust, animation]
---

# Thousands of per-speck drawImage calls fail Lighthouse mobile; stamp into one ImageData buffer instead

**Feature:** 2. Dust canvas

## Problem
The dust canvas needs thousands of specks to match the reference look: about 13k on a 1440×900 dark intro and about 10k on cream. Drawing each speck with its own `ctx.drawImage(sprite, …)` call plus a `globalAlpha` change made every frame a long task on a throttled phone. Lighthouse mobile Performance dropped to 72–75, below the project's bar of 90 (CLAUDE.md quality bar).

## Symptoms
- On the desktop it looked smooth and DevTools showed nothing alarming. The cost only shows under Lighthouse's mobile emulation (412×823, 4× CPU slowdown).
- The Lighthouse `long-tasks` audit listed about 20 tasks of 100–150 ms, each attributed to `js/dust.js`. This was the per-frame draw, not setup.
- Feature 1's old dust (a few hundred `arc()` particles) scored 100, so the regression came from the number of draw calls, not from canvas as such.

## What Didn't Work
- **Lowering speck counts.** Phones already got a reduced density. To get each frame under the 50 ms long-task threshold at 4× throttle, the count would have to drop far enough to lose the reference's dense cloud look. The plan's stop condition said to try a cheaper draw before giving up on the density.
- **Pre-rendered gradient sprites (the plan's original KTD5).** Sprites made each call cheap to rasterise, but the cost per call stayed, and the per-call cost is what scales.

## Solution
Draw every speck into one `ImageData` buffer in plain JS, then make a single `putImageData` call per frame (`js/dust.js`, `draw()`):

- **Stamps instead of sprites.** `makeStamps` (`js/dust.js:72`) builds small soft-disc alpha kernels once, using 4×4 supersampled coverage with a soft edge. Specks under 0.8px become a single point split bilinearly across 4 pixels, so slow drift stays smooth instead of stepping.
- **One colour per canvas.** Every speck in a canvas is the same colour, so each pixel only accumulates alpha (`add()`, `js/dust.js:136`: `a + v·(255 − a)`). The RGB stays fixed.
- **Cheap clear.** Each frame starts with one native `Uint32Array.fill(clearPixel)` (`js/dust.js:144`). `clearPixel` is built from the bytes `[r, g, b, 0]`, so it works on any byte order. A JS loop over every alpha byte would be slower.
- **CSS-pixel resolution.** The buffer is `clientWidth × clientHeight`, not ×DPR (`js/dust.js:126`). The dust is soft, so 1× is visually fine, and it keeps the buffer and the `putImageData` small.

Result: Lighthouse mobile Performance went to **98 on both pages**, Total Blocking Time from 2.2 s to 0.15 s, and Accessibility stayed at 100. The look, the composition, the push, pausing off-screen and reduced motion were all unchanged and were re-verified in the browser.

## Why This Works
The bottleneck was the number of canvas API calls per frame: thousands of `drawImage` calls, each with its own state change. The pixel work behind them was small. A typed-array loop that writes about 15 alpha values per speck is cheap even at 4× throttle, and the canvas then gets one call per frame. The total work became roughly proportional to the covered pixels, not to the number of API round-trips.

## Prevention
- Don't "simplify" the renderer back to `drawImage`, `arc()` or `fillRect` per speck, and don't move it to a sprite or particle library, without re-running Lighthouse mobile. The simplify pass on this feature considered exactly that, and the buffer design is the reason the page passes.
- When adding specks, a second look or a new effect on the dust, measure with `npx lighthouse <url> --only-categories=performance,accessibility --form-factor=mobile`, and check the `long-tasks` audit, not only the score.
- DevTools on a fast desktop will not show this problem. The 4× mobile throttle does.

## Related
- Plan: `docs/plans/2026-11-26-1241-feat-dust-canvas-plan.md`. KTD5 originally chose pre-rendered sprites with `drawImage`, and this replaced it during U2 and U3.
- `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md`: the other half of this feature's checks. The dust fades out under the nav to protect that contrast budget.
