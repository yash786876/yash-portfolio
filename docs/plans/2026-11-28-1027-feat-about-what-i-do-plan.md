---
title: About What I Do - Plan
type: feat
date: 2026-11-28
topic: about-what-i-do
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# About What I Do - Plan

## Goal Capsule

- **Objective:** A visitor reading the About page sees the four kinds of work Yash does: growth, operations, data and business technology. Each comes with the concrete proof that makes it believable, laid out like reference 09.
- **Means:** Fill the section 02 shell in `about.html`, following the section 01 grid pattern (KTD1).
- **Product authority:** Backlog Feature 8 (`docs/backlog.md`). The four areas in R1 come from the user's brief and replace the backlog's provisional names ("Venture & strategy · AI product building · Founder/operator · Data & analytics"). The backlog line is updated to match during the build. Sections 03 Industries and 04 What matters to me are separate features and not in scope here.
- **Execution profile:** One small unit in `about.html`. Plain HTML and CSS, no new script.
- **Stop conditions:** Stop and ask if a number, title or paragraph can't keep its contrast (3:1 for the number and title, 4.5:1 for the paragraph) under the vignette at the short laptop window.
- **Open blockers:** None.

---

## Product Contract

### Summary

Section 02 What I do on the About page fills with a two-by-two grid of four items. Each item has a rust bold number, a rust title and a short paragraph in dark ink. The titles and paragraphs resolve from ink blots as they come into view. On phones the grid becomes one column.

### Problem Frame

The About page's 02 What I do section is an empty shell. The Numbers section above it gives the headline figures. This section has to explain what kind of work produced them, and back each area with specifics: the revenue, the team, the data scale and the tools.

### Key Decisions

- **Item numbers are rust, bold, at about 19px, slightly larger than the reference's ~13px.** (session-settled: user-directed — chosen over small dark-ink numbers and over small rust numbers that fail contrast: 19px bold counts as large text, so rust passes at 3:1, while staying clearly smaller than the titles.) Governs R2.
- **Only titles and paragraphs blot in. Numbers stay sharp.** This matches how section 01 treats numbers. Governs R4.

### Requirements

**Content**

- R1. Under the existing "What I do / 02" header, four items appear in this order, with titles and text exactly as written:

  | # | Title | Text |
  |---|---|---|
  | 01 | Go-to-market & growth | I built Shubhrashi from zero to ₹8 Cr in 24 months: GTM, target-setting, key accounts, a 76-client B2B network and 2,500+ retail counters. |
  | 02 | Operations & finance | I hired and ran a 19-person team, built supply chain from scratch at 98% order accuracy, cut production cost 25%, and ran cash flow, payroll and GST from day one. |
  | 03 | Data & analytics | SQL, Python, PySpark, Tableau and Power BI. At ZS I analysed 20M+ customer records to segment users and lift campaign CTR by 50%. |
  | 04 | Business technology & AI | BRDs, UAT, Salesforce Marketing Cloud setups and API integrations; now building AI tools that turn business workflows into products. |

**Look and layout**

- R2. Each item stacks a rust bold number (about 19px), a rust title (about 26px, weight 600) and a paragraph in small dark ink (body line height), as in reference 09.
- R3. On desktop the items form a two-by-two grid within the cream column. Below 900px they form a single column.

**Motion and access**

- R4. Titles and paragraphs use the ink-blot reveal (`data-reveal`) when they come into view. Numbers stay sharp.
- R5. Titles are real headings (under the section's "What I do" heading), so screen readers can navigate the items. With reduced motion on, or without scripts, everything shows sharp.

**Quality**

- R6. Numbers and titles keep at least 3:1 (large text), and paragraphs at least 4.5:1. All are measured from rendered pixels with grain and vignette on, at 1440, 390 and a short laptop window (about 1272×540).
- R7. The section keeps the `--section-gap` spacing above and below (160px desktop, 96px phone). Lighthouse mobile stays at 90 or above with no layout shift and no console errors.

### Acceptance Examples

- AE1. **Covers R3, R4.** Given the About page at 1440, when section 02 scrolls into view, four items sit two by two and their titles and paragraphs resolve from blots while the numbers stay sharp.
- AE2. **Covers R3.** Given a 390px phone, the four items stack in one column in order 01–04.

### Scope Boundaries

- Sections 03 and 04 are later features (9 and 10).
- The text is Yash's own and is used word for word, with no edits to wording or figures.

### Sources / Research

- `reference/09-about-what-i-do.jpg`: item layout (number, title, paragraph in a 2×2 grid).
- `about.html`: section 02 shell (`#s-what`), and the section 01 grid as the closest layout pattern.
- `js/reveal.js`: the ink-blot reveal and its `reveal-pending` head snippet, already on the page.
- `css/tokens.css`: `--accent`, `--ink`, `--section-gap` and `.section-head`.
- `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md`: measuring under the overlays; rust only as large text; re-measure at short heights.

**Product Contract preservation:** Product Contract unchanged.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Reuse the section 01 grid pattern.** Use a `.services` grid with two columns and the same column gap as `.numbers`, falling to one column below 900px. Spacing comes from the existing `--section-gap`. Governs R3, R7.
- KTD2. **Item markup.** Each item is an `<article>` holding a `<p class="services__num">` (rust, 19px, weight 700, so it counts as large text: 18.66px+ bold), an `<h3 class="services__title" data-reveal>` (rust, a fixed 26px, weight 600, not `--fs-h3`, which drops to 22px; it must stay at 24px or more so rust at 600 stays large text) and a `<p class="services__text" data-reveal>` (15px, `--ink`, body line height, max width about 30rem). The `h3`s sit under the section's `h2` "What I do". Governs R2, R4, R5.
- KTD4. **Enable a real bold.** The Outfit `@font-face` declares `font-weight: 300 600`, so weight 700 would render at 600. At 19px and weight 600, the number would no longer be large text, and rust would fail. The font file's weight axis reaches 900 (checked by loading it with a 100–900 range and measuring the widths at 600, 700 and 900). Widen the descriptor to `300 700`. Governs R2, R6.
- KTD3. **No new script.** `js/reveal.js` and its `reveal-pending` head snippet are already on the page and pick up the new `data-reveal` elements. Governs R4, R5.

---

## Implementation Units

### U1. Section 02 What I do grid

- **Goal:** Section 02 shows the four items in a 2×2 grid on desktop and one column on phones, with reveals on titles and text.
- **Requirements:** R1–R7. KTD1–KTD3.
- **Dependencies:** None.
- **Files:** `about.html`, `css/tokens.css` (Outfit weight range, KTD4), `docs/backlog.md` (Feature 8 line wording).
- **Approach:**
  0. Widen the Outfit `@font-face` to `font-weight: 300 700` (KTD4), and update the backlog Feature 8 line to R1's four titles.
  1. Under `#s-what`'s `.section-head`, add the `.services` grid with the four items from R1, word for word. Write "&" as `&amp;` and "₹" literally.
  2. Add the `.services*` styles next to `.numbers`, with the one-column rule in the existing `max-width: 899px` block.
- **Patterns to follow:** The `.numbers` grid and labels in `about.html`, and the Feature 5 `data-reveal` usage.
- **Test scenarios:**
  - Covers AE1. At 1272 (or 1440), the four items sit 2×2. Titles and paragraphs resolve from blots, and the numbers stay sharp.
  - Covers AE2. At 390, the items are one column in order 01–04.
  - The text matches R1 exactly, checked by comparing each item's `textContent` to R1.
  - Contrast: number and title at least 3:1, paragraph at least 4.5:1, measured from rendered pixels at the default window, at 390px and at a short window (about 540px tall).
  - The rendered number weight is 700: its strokes are visibly heavier than a 600 title, and the computed `font-weight` is 700.
  - The heading outline is h1, then h2 "What I do", then four h3s.
  - The gap above "Industries" (03) is still 160px on desktop and 96px on phones.
- **Verification:** Scenarios pass, Lighthouse mobile is 90 or above with CLS 0, and there are no console errors.

---

## Verification Contract

There is no test runner (CLAUDE.md), so verification is browser-driven.

| Check | How | Pass |
|---|---|---|
| Layout | `localhost:5500/about.html` at 1272/1440 and in a 390 iframe | 2×2 on desktop, 1 column on phones |
| Content | Item `textContent` against R1 | Exact match |
| Contrast | Pixel sampling per `docs/solutions/ui-bugs/contrast-under-grain-vignette-overlays.md` at 1440, 390 and a short window | Numbers and titles ≥ 3:1, text ≥ 4.5:1 |
| Spacing | Gap from the section 02 content to the section 03 rule | 160px desktop, 96px phone |
| Lighthouse | Mobile, `about.html` | ≥ 90, CLS 0 |
| Console | DevTools | No errors |

---

## Definition of Done

- U1 is complete, every Verification Contract row passes, and R1–R7 and AE1–AE2 hold.
- No leftover test markup.
