// Ink-blot -> sharp text reveal. Usage: <h2 data-reveal>Text</h2> (headings, body text, numbers).
// Each element starts as a melted ink mass in its own colour and resolves into sharp text over
// ~1.2s when it enters view, once. Elements that enter together play in DOM order, 0.25s apart.
//
// Pages using it add this to <head> so blots never flash as sharp text first (and text still
// shows if this script never runs):
//   <script>document.documentElement.classList.add("reveal-pending");
//   setTimeout(() => document.documentElement.classList.remove("reveal-pending"), 3000);</script>
(() => {
  const root = document.documentElement;
  const els = [...document.querySelectorAll("[data-reveal]")];
  if (!els.length || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.remove("reveal-pending");
    return;
  }

  const DURATION = 1200, STAGGER = 250;
  const SVGNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  document.body.appendChild(svg);

  // One filter per element: blur, then a hard alpha threshold, so letters melt into ink blots.
  // The starting blur scales with the font size so each word becomes its own blot. Small text
  // needs a steeper threshold, or its thin strokes fade below it and the text just vanishes.
  const setup = (el, i) => {
    const id = `ink-${i}`;
    const size = parseFloat(getComputedStyle(el).fontSize), small = size < 24;
    const start = small ? size * 0.2 : Math.min(16, size * 0.12);
    const filter = document.createElementNS(SVGNS, "filter");
    filter.id = id;
    filter.setAttribute("x", "-10%"); filter.setAttribute("y", "-40%");
    filter.setAttribute("width", "120%"); filter.setAttribute("height", "180%");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    const blur = document.createElementNS(SVGNS, "feGaussianBlur");
    blur.setAttribute("stdDeviation", start);
    const ink = document.createElementNS(SVGNS, "feColorMatrix");
    ink.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${small ? "40 -6" : "22 -9"}`);
    filter.append(blur, ink);
    svg.appendChild(filter);
    el.style.filter = `url(#${id})`;
    return { el, blur, start };
  };

  const play = ({ el, blur, start }, delay) => setTimeout(() => {
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / DURATION), eased = 1 - (1 - k) ** 3;
      blur.setAttribute("stdDeviation", start * (1 - eased));
      if (k < 1) requestAnimationFrame(step);
      else el.style.filter = "";   // fully sharp: drop the filter entirely
    };
    requestAnimationFrame(step);
  }, delay);

  const items = new Map(els.map((el, i) => [el, setup(el, i)]));
  root.classList.remove("reveal-pending");   // blots are in place; safe to show

  const io = new IntersectionObserver((entries) => {
    const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    entering.forEach((el, n) => { play(items.get(el), n * STAGGER); io.unobserve(el); });
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });   // plays once its top is 10% into view, at any height
  els.forEach((el) => io.observe(el));
})();
