# Concepts

> Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Global shell

The frame every page of the portfolio sits inside: the shared fonts and colour tokens, the tiny nav, and the film grain and film-frame vignette laid over everything. A new page gets the whole shell by including one stylesheet, one script and the copied nav markup, rather than building any of it itself.

## Film-frame vignette

The rounded, dark-edged border drawn over every page to imitate an old film or TV frame. It has solid dark corners outside the curve, a dark rim band at the edge and a softer inward falloff, and it is thinner on phones. It sits above the page and the nav but never intercepts input. Its darkest point is deliberately kept toward the bottom corners so text in the top corners stays readable (see Contrast budget).

## Contrast budget

How much the grain and the film-frame vignette may darken the area behind a piece of text before that text falls below the project's minimum contrast ratio. The budget is set by the text colour: the closer a colour already sits to the minimum on a plain background, the less darkening it can tolerate. It is checked by measuring the rendered page, because the overlays are invisible to standard contrast tools. Changing overlay strength or a text colour spends or restores budget, so the two are always judged together.
