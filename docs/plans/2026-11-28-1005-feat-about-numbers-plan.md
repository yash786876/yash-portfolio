---
title: About Numbers - Plan
type: feat
date: 2026-11-28
topic: about-numbers
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# About Numbers - Plan

## Goal Capsule

- **Objective:** A visitor scrolling the About page sees Yash's track record at a glance: four big rust numbers with short labels. The numbers count up as they come into view, and visitors without scripts still see the real values.
- **Means:** Rework `js/counter.js` to animate values already in the page (KTD1), and fill section 01 in `about.html`.
- **Product authority:** Backlog Feature 7 (`docs/backlog.md`). The other About sections (02 What I do, 03 Industries, 04 What matters to me) are separate features and not in scope here.
- **Execution profile:** Plain JS and CSS, no dependencies. Two small units, inline, in order.
- **Stop conditions:** Stop and ask if the numbers can't keep 3:1 under the vignette, or if "2,500+" can't fit its cell at every width from 390px to 1440px without dropping below about 40px.
- **Open blockers:** None.

---

## Product Contract

### Summary

Section 01 Numbers on the About page fills with a two-by-two grid of big rust numbers: ₹8 Cr, 2,500+, 4+ and 20M+. Each has a small label underneath. When the grid enters view, the digits count up while staying sharp, and the labels resolve from ink blots. `js/counter.js` learns prefixes, suffixes and thousands separators, and the page itself holds the real values.

### Problem Frame

The About page's 01 Numbers section is an empty shell, though it's the fastest way to show what Yash has actually done. The existing counter can't format "₹", "Cr", commas or "M+". It also starts its markup at "0", so anyone without scripts sees zero. And its suffix only appears at the very end, so the number jumps in width as it lands.

### Key Decisions

- **Prefix and suffix marks are half size and raised beside the digits, like the reference's "35+".** (session-settled: user-directed — chosen over full-size extras and half-size extras on the baseline, after comparing all three in a browser sketch.) Governs R3.
- **Numbers count while staying sharp, and only the labels blot in.** This matches reference 08, where the digits are sharp while the labels are still ink. Governs R4, R5.

### Requirements

**Content and layout**

- R1. Under the existing "Numbers / 01" section header, a two-by-two grid shows these figures and labels exactly as written:

  | Figure | Label |
  |---|---|
  | ₹8 Cr | revenue built from zero in 24 months |
  | 2,500+ | retail counters reached |
  | 4+ | years across founding, sales, ops and tech consulting |
  | 20M+ | customer records analysed at ZS |

- R2. Numbers are big rust display figures. Labels are small, dark ink text of one to three lines under each number (references 06/07).
- R3. Prefix and suffix marks (₹, Cr, +, M+) are about half the digits' size and sit raised beside them.

**Motion**

- R4. When the grid enters view, each number counts up from zero to its value in about 1.4 seconds, staying sharp. The four are staggered slightly in reading order. The marks and thousands separators show throughout the count.
- R5. Each label uses the ink-blot reveal (`data-reveal`, Feature 6) and resolves as the grid enters view.
- R6. A number keeps its final width while counting, so nothing around it shifts.

**Robustness and access**

- R7. The page markup holds the real values. Without scripts the grid reads exactly as in R1, and the count-up only plays over values already in the page.
- R8. Screen readers hear each final value with its marks, never the intermediate digits.
- R9. With reduced motion on, numbers show their final values with no count, and labels show sharp.
- R10. `js/counter.js` stays the reusable count-up effect: other pages can mark a number for count-up with a prefix, a suffix and thousands separators.

**Fit and quality**

- R11. On a 390px phone the grid stays two by two, with numbers sized down (about 44px) so "2,500+" fits its half.
- R12. Numbers keep at least 3:1 (large text) and labels at least 4.5:1, measured from rendered pixels with grain and vignette on. Lighthouse mobile stays at 90 or above, with no layout shift and no console errors.

### Acceptance Examples

- AE1. **Covers R4, R6.** Given the About page scrolled to section 01, when the grid comes into view, "₹8 Cr" counts ₹0 Cr → ₹8 Cr and "2,500+" counts through comma-formatted values to 2,500+. Neither changes width.
- AE2. **Covers R7.** Given scripts are off, the grid shows ₹8 Cr, 2,500+, 4+ and 20M+ with their labels.
- AE3. **Covers R9.** Given reduced motion is on, the grid shows final values and sharp labels immediately.

### Scope Boundaries

- Sections 02–04 and their content are later features (8–10).
- The figures and labels are Yash's own. This feature displays them and does not verify or reword them.
- No new libraries. Count-up and reveal stay in plain JS (CLAUDE.md).

### Sources / Research

- `js/counter.js`: the current count-up. It starts its markup at "0", handles only a suffix, and adds the suffix only at the end.
- `js/reveal.js`: the Feature 6 ink-blot reveal, used for the labels.
- `about.html`: section 01 shell (`#s-numbers`) in the cream column.
- `css/tokens.css`: `.big-number` (rust, clamp 56–96px) and `.section-head`.
- References: `reference/06-about-bio-split.jpg`, `07-about-numbers.jpg`, `08-about-numbers-2.jpg` and `09-about-what-i-do.jpg`.
- `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md`: how to measure contrast under the overlays, and the 3:1 rule for large text.

**Product Contract preservation:** Product Contract unchanged.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **The markup holds the final value; the script only animates the digits.** Each figure is a `.big-number` element with `data-count` and three parts: an optional prefix mark, the digits, and an optional suffix mark. Marks get a `.big-number__mark` class, digits a `.big-number__value` class. `counter.js` reads the target from the digits' own text, for example "2,500" → 2500, so no number is duplicated in attributes. It rewrites only the digits while counting, formatted with `toLocaleString("en-IN")`. Without scripts nothing changes. Governs R1, R7, R10.
- KTD2. **Width is locked before counting.** Digits use `font-variant-numeric: tabular-nums`. The script measures the digits' final width, sets it as `min-width` (right-aligned inline-block), and clears it when done. Governs R6.
- KTD3. **Screen readers get a fixed copy.** On start, the script inserts a visually hidden copy of the full final text (a new shared `.sr-only` utility in `css/tokens.css`). It marks the whole visual figure `aria-hidden`, marks and digits together, so the hidden copy is the only text read aloud. Governs R8.
- KTD4. **One trigger per grid, staggered in reading order.** An IntersectionObserver uses the same trigger as `reveal.js`: threshold 0, rootMargin `0px 0px -10% 0px`. Numbers that enter together start 120ms apart in DOM order and run 1.4s each with ease-out. Reduced motion leaves the markup untouched. Governs R4, R9.
- KTD5. **Marks styled per the settled decision.** `.big-number__mark` is `max(0.5em, 24px)`, raised about 0.62em, with a small margin, as in sketch option B. The 24px floor keeps the marks large text (3:1) at the phone size, where half of 44px would be 22px and need 4.5:1. Governs R3.
- KTD6. **The old API is replaced.** The `data-suffix` attribute and the "start at 0" markup are gone. No page uses them any more, since the About stub's counters were removed in Feature 4. Governs R10.

### Assumptions

- Outfit's subset has no ₹ (U+20B9), so ₹ renders from the fallback stack (Arial or Roboto). That's accepted at half size and checked visually in U2.
- `toLocaleString("en-IN")` gives "2,500" and "20". Values here stay below 1,00,000, so Indian grouping looks the same as Western grouping.

---

## Implementation Units

### U1. Count-up that animates values already in the page

- **Goal:** `js/counter.js` supports a prefix, digits with thousands separators, and a suffix. It keeps the real values in the markup, holds width steady, and gives screen readers the final value.
- **Requirements:** R4, R6, R7, R8, R9, R10. KTD1–KTD4, KTD6.
- **Dependencies:** None.
- **Files:** `js/counter.js`, `css/tokens.css` (`.sr-only`, `.big-number__mark` and the `.big-number__value` tabular figures).
- **Approach:**
  1. Find `[data-count]`. For each, find `.big-number__value`, parse its digits as the target and measure its width.
  2. On entering view (KTD4), lock the width, insert the screen-reader copy and mark the whole visual figure (marks and digits) `aria-hidden`. Tween 0 → target, writing the formatted value, then restore the exact original text and release the width lock.
  3. Under reduced motion, return immediately and leave the markup as is.
  4. Update the usage comment at the top of the file and the CLAUDE.md line.
- **Patterns to follow:** The IntersectionObserver, stagger and reduced-motion handling in `js/reveal.js`.
- **Test scenarios:**
  - Covers AE1. "2,500" counts through comma-formatted values to "2,500", and its box width never changes. Check by sampling `getBoundingClientRect().width` during the count.
  - "₹8 Cr" counts 0 → 8 with ₹ and Cr visible throughout.
  - Covers AE2. With scripts disabled (an iframe without counter.js), the text reads ₹8 Cr / 2,500+ / 4+ / 20M+.
  - Covers AE3. With reduced motion stubbed in an iframe, the values are final at once.
  - The accessible text of each number is exactly the final value, with marks heard once: the screen-reader copy exists, and the whole visual figure is `aria-hidden`.
- **Verification:** All scenarios pass, with no console errors.

### U2. Section 01 Numbers on the About page

- **Goal:** Section 01 shows the two-by-two grid of numbers and labels.
- **Requirements:** R1, R2, R3, R5, R11, R12. KTD5.
- **Dependencies:** U1.
- **Files:** `about.html`.
- **Approach:**
  1. Under the existing `#s-numbers` header, add a two-column grid. Each cell holds a `.big-number` with the KTD1 parts and a small `data-reveal` label in body ink at about 13px.
  2. Size the numbers to the cell, not the viewport, roughly `clamp(44px, 4.2vw, 96px)` in the grid, so "2,500+" fits each half-column across the 900–1200px split range. Below 900px, keep two columns at about 44px.
  3. Load `js/counter.js` (deferred). The reveal head snippet is already on the page.
- **Patterns to follow:** The `.section-head`, `.big-number` and About column styles. The Feature 5 hero markup for `data-reveal`.
- **Test scenarios:**
  - At 390, 960, 1100, 1272 and 1440, the grid is two by two and "2,500+" fits its cell.
  - At 390, the marks render at 24px or larger and measure at least 3:1. ₹ looks acceptable in its fallback font at 1440 and 390.
  - The labels blot and resolve as the grid enters view, and the numbers stay sharp while counting.
  - Number contrast is at least 3:1 and label contrast at least 4.5:1, measured from pixels with the overlays on.
  - Lighthouse mobile is 90 or above for Performance and Accessibility, with CLS 0.
- **Verification:** Scenarios pass, and nothing else on the page shifts.

---

## Verification Contract

There is no test runner (CLAUDE.md), so verification is browser-driven, like Features 1–6.

| Check | How | Pass |
|---|---|---|
| Local serve | `python -m http.server 5500`, then open `/about.html` | Page loads |
| Count-up | Scroll section 01 into view; sample text and width during the count | Values and marks correct, width fixed |
| No-JS and reduced motion | iframe without `counter.js`; iframe with `matchMedia` stubbed to reduce | Final values shown |
| Screen reader text | Inspect the accessible name and text of each number | Final value only |
| Desktop and phone | 390, 960, 1100, 1272 or 1440 | Two by two, "2,500+" fits |
| Contrast | Pixel sampling per `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md` | Numbers ≥ 3:1, labels ≥ 4.5:1 |
| Lighthouse | Mobile, `about.html` | Both ≥ 90, CLS 0 |
| Console | DevTools | No errors |

---

## Definition of Done

- U1 and U2 are complete, and every Verification Contract row passes.
- R1–R12 hold, and AE1–AE3 are demonstrated.
- `counter.js` has an updated usage comment, and CLAUDE.md describes the new markup. No leftover test markup.
