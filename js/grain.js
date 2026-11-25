// Film grain + rounded film-frame vignette. Include once per page:
// <script src="js/grain.js" defer></script>  (any folder depth works)
(() => {
  // Resolve the texture next to this script, not the page, so pages in
  // subfolders and the GitHub Pages sub-path still find it.
  const script = document.currentScript;
  const grainUrl = new URL("../assets/grain.svg", script ? script.src : location.href).href;

  const style = document.createElement("style");
  style.textContent = `
    .fx-grain, .fx-vignette { position: fixed; pointer-events: none; z-index: 100; }

    /* Oversized so the stepped jitter never exposes an edge. */
    .fx-grain {
      inset: -15%;
      background-image: url("${grainUrl}");
      opacity: .12; mix-blend-mode: multiply;
      animation: fx-grain .6s steps(4) infinite;
    }
    body.is-dark .fx-grain { mix-blend-mode: screen; opacity: .08; }
    @keyframes fx-grain {
      0%   { transform: translate(0, 0); }
      25%  { transform: translate(-3%, 2%); }
      50%  { transform: translate(2%, -3%); }
      75%  { transform: translate(-2%, -1%); }
      100% { transform: translate(0, 0); }
    }

    /* Rounded film frame: the outward spread paints solid corners outside
       the curve, the inset shadow gives the falloff. Thinner on phones. */
    .fx-vignette {
      --fx-radius: clamp(10px, 1.6vw, 22px);
      --fx-edge: clamp(8px, 1.2vw, 16px);         /* tight dark frame band */
      --fx-falloff: clamp(60px, 12vw, 180px);     /* broad, light falloff */
      --fx-falloff-alpha: .2;
      inset: 0;
      border-radius: var(--fx-radius);
      box-shadow:
        0 0 0 40px #0b0a09,
        inset 0 0 var(--fx-edge) calc(var(--fx-edge) * .15) rgba(0, 0, 0, .6),
        inset 0 0 var(--fx-falloff) rgba(0, 0, 0, var(--fx-falloff-alpha));
    }

    @media (prefers-reduced-motion: reduce) { .fx-grain { animation: none; } }
  `;
  document.head.appendChild(style);

  for (const cls of ["fx-grain", "fx-vignette"]) {
    const el = document.createElement("div");
    el.className = cls;
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
  }
})();
