---
title: About Industries - Plan
type: feat
date: 2026-11-28
topic: about-industries
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# About Industries - Plan

## Goal Capsule

- **Objective:** A visitor reading the About page sees at a glance how wide Yash's industry experience is, as one large flowing list like reference 11, without reading a paragraph.
- **Product authority:** Backlog Feature 9 (`docs/backlog.md`). The list in R2 comes from the user's brief and replaces the backlog's provisional list ("Food & agro / Spices / Recycling / Healthcare / Travel / Consumer / VC"). Section 04 What matters to me is a separate feature.
- **Open blockers:** None.

---

## Product Contract

### Summary

Section 03 Industries on the About page shows a small label, "Worked with businesses across industries". Below it is a large flowing list of ten industries in ink, separated by thin rust slashes and wrapping naturally. The label and list resolve from ink blots as they come into view.

### Problem Frame

The 03 Industries section is an empty shell. Earlier sections show the numbers and the kinds of work. This one has to show range, the spread of sectors Yash has worked across, in a way that reads in a second rather than as another block of prose.

### Requirements

**Content**

- R1. Under the existing "Industries / 03" header, a small label reads exactly "Worked with businesses across industries".
- R2. Below it, the ten industries appear in this order, exactly as written: FMCG / Food & agro / Spices / Pharma / Consumer brands / Retail & distribution / Marketing tech / Healthcare / Recycling / Venture capital.

**Look**

- R3. The list is one large flowing paragraph in ink (`--ink`) at medium weight: about 36px on desktop and about 28px on phones. It wraps naturally to the column width, as in reference 11.
- R4. Thin rust slashes separate the items. Each industry stays whole on one line, and each slash stays attached to the item before it, so lines end on a slash. The last item has no slash.
- R5. The label uses the small section-label style used elsewhere on the page.

**Motion and access**

- R6. The label and the list each resolve from ink blots (`data-reveal`) as they come into view.
- R7. Screen readers hear a plain list of the ten industries. The slashes are decorative and silent. With reduced motion on, or without scripts, everything shows sharp.

**Quality**

- R8. The list keeps at least 4.5:1 and the label at least 4.5:1, measured from rendered pixels with grain and vignette on at 1440, 390 and a short laptop window (about 1272×540). The decorative slashes are exempt.
- R9. The section keeps the `--section-gap` spacing (160px desktop, 96px phone). Lighthouse mobile stays at 90 or above, with no layout shift and no console errors.

### Acceptance Examples

- AE1. **Covers R3, R4.** At any width, no industry name is split across lines, every line except the last ends with a rust slash, and "Venture capital" ends the list with no slash.
- AE2. **Covers R7.** A screen reader announces a list of 10 items: FMCG, Food & agro, … Venture capital, with no "slash".

### Scope Boundaries

- Section 04 What matters to me is Feature 10.
- The industries are Yash's own list, used as written.

### Sources / Research

- `reference/11-about-values.jpg`: the flowing industry list with rust slashes (top part).
- `about.html`: section 03 shell (`#s-industries`), the sections 01/02 patterns, and the `reveal-pending` snippet already in place.
- `css/tokens.css`: `--ink`, `--accent`, `--section-gap`, `.section-head`, `--fs-small`.
- `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md`: measuring under the overlays, including at short heights.

**Product Contract preservation:** Product Contract unchanged.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **A real list that flows like a sentence.** The industries are a `<ul class="industries__list" role="list" data-reveal>` with ten inline `<li>`s. The `role="list"` keeps list semantics in Safari, where `list-style: none` removes them. Each `<li>` is `white-space: nowrap`, so an industry never splits. The whitespace between `<li>`s is the only break point. Governs R2, R3, R4, R7.
- KTD2. **Slashes live inside the item before them, hidden from screen readers.** Every `<li>` except the last ends with `<span class="industries__slash" aria-hidden="true">/</span>`. Because the `<li>` is nowrap, the slash is glued to its item, so a line ends "Spices /" and the next starts with an industry. Slashes are rust (`--accent`), weight 300 and a little smaller, so they read as thin dividers. Markup spans are used, not CSS `::after` content, because generated content is still announced by some screen readers. Governs R4, R7.
- KTD3. **Type.** The list is `--ink`, weight 500, `clamp(28px, 2.5vw, 36px)` (36px at 1440, 28px on phones) with line-height 1.25. The label is `<p class="industries__label" data-reveal>` at `--fs-small` in `--ink-soft`, the same as the `.section-head` label. If the label measures below 4.5:1 under the vignette, it switches to `--ink`. Governs R3, R5, R8.
- KTD4. **No new script.** `js/reveal.js` blurs and resolves any element with `data-reveal`, including the `<ul>` as one block, and its `reveal-pending` head snippet is already on the page. Governs R6, R7.

---

## Implementation Units

### U1. Section 03 Industries list

- **Goal:** Section 03 shows the label and the flowing slash-separated list of ten industries.
- **Requirements:** R1–R9. KTD1–KTD4.
- **Dependencies:** None.
- **Files:** `about.html`, `docs/backlog.md` (Feature 9 line wording to R2's list).
- **Approach:**
  1. Under `#s-industries`'s `.section-head`, add the label and the `<ul>` from KTD1–KTD2, with the ten industries in R2's order. Write "&" as `&amp;`.
  2. Add the `.industries*` styles next to `.services`. The `<ul>` resets margin, padding and `list-style`. Each `<li>` is `display: inline; white-space: nowrap`. Phone sizing comes from the clamp, with no media rule needed.
  3. Update the backlog Feature 9 line to R2's list.
- **Patterns to follow:** `.numbers__label` for the label's size, line height and spacing only (its colour comes from KTD3, not from `.numbers__label`), `.services` in `about.html`, and the `data-reveal` usage in sections 01 and 02.
- **Test scenarios:**
  - Covers AE1. At 1440, 1272, 390 and about 1000px, every rendered line except the last ends in a slash, and no `<li>` spans two lines. Check that each `<li>` has exactly one client rect.
  - Covers AE2. The accessibility tree shows a list of 10 items with names matching R2 and no "/". Check the `<li>` text with the `aria-hidden` slashes excluded.
  - The visible text matches R1 and R2 exactly.
  - The list's font size is 36px at 1440 and 28px at 390. Its weight is 500 and its colour `--ink`. The slashes are rust.
  - The label and list resolve from blots when scrolled into view. With reduced motion they show sharp at once.
  - Contrast: list and label at least 4.5:1, measured from rendered pixels at 1440, 390 and about 1272×540.
  - The gap from section 03 to the section 04 rule is still 160px on desktop and 96px on phones.
- **Verification:** Scenarios pass, Lighthouse mobile is 90 or above with CLS 0, and there are no console errors.

---

## Verification Contract

There is no test runner (CLAUDE.md), so verification is browser-driven.

| Check | How | Pass |
|---|---|---|
| Wrapping | Client rects per `<li>` and line-end checks at 1440, 1272, 1000 and 390 | No split items, lines end in "/" |
| Content and access | `<li>` text without slashes against R2; label text against R1 | Exact match, 10 items |
| Contrast | Pixel sampling per `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md` at 1440, 390 and a short window | List and label ≥ 4.5:1 |
| Spacing | Section 03 content to section 04 rule | 160px desktop, 96px phone |
| Lighthouse | Mobile, `about.html` | ≥ 90, CLS 0 |
| Console | DevTools | No errors |

---

## Definition of Done

- U1 is complete, every Verification Contract row passes, and R1–R9 and AE1–AE2 hold.
- No leftover test markup.
