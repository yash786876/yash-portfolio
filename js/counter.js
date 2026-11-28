// Count-up numbers. The page holds the real value; this only animates the digits over it.
// Usage:
//   <span class="big-number" data-count>
//     <span class="big-number__mark">₹</span><span class="big-number__value">8</span><span class="big-number__mark">Cr</span>
//   </span>
// Marks (prefix/suffix) are optional. Digits may carry thousands separators ("2,500").
// Optional data-spoken="20 million plus" sets what screen readers hear (default: the visible text).
// Without scripts, or with reduced motion, the written value simply shows.
(() => {
  const els = [...document.querySelectorAll("[data-count]")];
  if (!els.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const DURATION = 1400, STAGGER = 120;
  const format = (n) => n.toLocaleString("en-IN");

  // Set up at once (so a staggered number never flashes its final value), count after `delay`.
  const run = (el, delay) => {
    const value = el.querySelector(".big-number__value");
    if (!value) return;
    const final = value.textContent, target = Number(final.replace(/[^\d]/g, ""));
    if (!Number.isFinite(target)) return;

    // Screen readers get the final text once; the moving figure is hidden from them.
    const spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = el.dataset.spoken || el.textContent.replace(/\s+/g, " ").trim();
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    visual.append(...el.childNodes);
    el.append(spoken, visual);

    // Hold the final width so nothing shifts while the digits change.
    value.style.display = "inline-block";
    value.style.textAlign = "right";
    value.style.minWidth = `${value.getBoundingClientRect().width}px`;

    value.textContent = format(0);
    setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / DURATION), eased = 1 - (1 - k) ** 3;
        value.textContent = k < 1 ? format(Math.round(target * eased)) : final;
        if (k < 1) requestAnimationFrame(tick);
        else value.style.minWidth = "";
      };
      requestAnimationFrame(tick);
    }, delay);
  };

  const io = new IntersectionObserver((entries) => {
    const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    entering.forEach((el, n) => { run(el, n * STAGGER); io.unobserve(el); });
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });   // same trigger as reveal.js
  els.forEach((el) => io.observe(el));
})();
