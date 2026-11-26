// Dust hanging in the air: composed cloud patches over a thin drifting field.
// Usage: <canvas data-dust="dark"></canvas> (light specks on dark) or data-dust="light" (brown on cream).
(() => {
  const TAU = Math.PI * 2;
  const PHONE = 600;            // canvas width below which the phone name zone and density apply
  const REF_AREA = 1440 * 900;  // speck counts in the recipes are for a canvas this size

  // One recipe per look. x/y/rx/ry are fractions of the canvas width/height.
  // nameZone [x0, x1, y0, y1] is where the intro name sits: no cloud speck is ever
  // placed there, even at full sway, so the clouds can never cover the name.
  const RECIPES = {
    dark: {
      rgb: "238,234,226",
      field: { n: 5200, r: [0.35, 1.5], a: [0.1, 0.5] },
      speck: { r: [0.35, 1.4], a: [0.2, 0.75] },
      soft: 0.45,
      clouds: [
        { x: 0.53, y: 0.21, rx: 0.075, ry: 0.11, n: 1300, phone: { x: 0.84, y: 0.13 } }, // top centre
        { x: 0.75, y: 0.62, rx: 0.13, ry: 0.12, n: 2600 },  // middle right
        { x: 0.31, y: 0.80, rx: 0.1, ry: 0.085, n: 1700 },  // bottom left
        { x: 0.45, y: 0.97, rx: 0.62, ry: 0.06, n: 2400 },  // settled band along the bottom
      ],
      nameZone: { desk: [0, 0.34, 0.18, 0.48], phone: [0, 0.72, 0.18, 0.48] },
    },
    light: {
      rgb: "92,74,58",
      field: { n: 3600, r: [0.5, 2.6], a: [0.14, 0.5] },
      speck: { r: [0.5, 2.4], a: [0.2, 0.6] },
      soft: 0.7,                // out-of-focus look
      clouds: [
        { x: 0.47, y: 0.5, rx: 0.2, ry: 0.8, n: 6500 },  // dense band down the middle
      ],
      nameZone: { desk: [0, 0.29, 0.18, 0.48], phone: [0, 0.72, 0.18, 0.48] },
    },
  };

  const SWAY = 0.022;           // cloud sway amplitude, fraction of the canvas
  const FIELD_DRIFT = [3, -1.8];   // thin-field drift, css px per second
  const SPRITE_STEPS = 8;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const gauss = () => {        // standard normal, redrawn beyond ±2.5 so clouds fade out softly
    for (;;) {
      let u = 0; while (!u) u = Math.random();
      const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random());
      if (Math.abs(g) <= 2.5) return g;
    }
  };
  const inZone = (x, y, z, m) => x > z[0] - m && x < z[1] + m && y > z[2] - m && y < z[3] + m;

  // Round speck sprites at a few sizes; soft edges come from the gradient, not a blur filter.
  const makeSprites = (rgb, soft, maxR, dpr) => Array.from({ length: SPRITE_STEPS }, (_, i) => {
    const r = maxR * (i + 1) / SPRITE_STEPS;
    const px = Math.ceil(r * 2 * dpr) + 2;
    const c = document.createElement("canvas");
    c.width = c.height = px;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, r * dpr);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(Math.max(0.01, 1 - soft), `rgba(${rgb},1)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, px, px);
    return { c, size: px / dpr };
  });

  document.querySelectorAll("canvas[data-dust]").forEach((canvas) => {
    const recipe = canvas.dataset.dust === "light" ? RECIPES.light : RECIPES.dark;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = canvas.clientWidth, h = canvas.clientHeight;

    // Counts and the phone layout are fixed at load; a resize only rescales (no reshuffle).
    const phone = w < PHONE;
    const scale = (w * h) / REF_AREA * (phone ? 0.6 : 1);
    const zone = phone ? recipe.nameZone.phone : recipe.nameZone.desk;
    const maxR = Math.max(recipe.field.r[1], recipe.speck.r[1]);
    const sprites = makeSprites(recipe.rgb, recipe.soft, maxR, dpr);
    const pick = (r) => sprites[Math.min(SPRITE_STEPS - 1, Math.floor((r / maxR) * SPRITE_STEPS))];
    const sized = ([lo, hi]) => lo + (hi - lo) * Math.random() ** 2; // mostly small, a few large

    const clouds = recipe.clouds.map((c) => {
      const home = phone && c.phone ? { ...c, ...c.phone } : c;
      return { x: home.x, y: home.y, rx: c.rx, ry: c.ry, n: c.n,
        px: rand(45, 90), py: rand(45, 90), ph: rand(0, TAU), ph2: rand(0, TAU) };
    });

    const specks = [];
    for (let i = 0; i < Math.round(recipe.field.n * scale); i++) {
      const r = sized(recipe.field.r);
      specks.push({ cloud: null, x: Math.random(), y: Math.random(), r, s: pick(r),
        a: rand(...recipe.field.a), vx: FIELD_DRIFT[0] * rand(0.6, 1.4), vy: FIELD_DRIFT[1] * rand(0.6, 1.4) });
    }
    for (const c of clouds) {
      const n = Math.round(c.n * scale);
      for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
        const x = c.x + gauss() * c.rx / 2, y = c.y + gauss() * c.ry / 2;
        if (y > 1 || inZone(x, y, zone, SWAY)) continue;
        const r = sized(recipe.speck.r);
        specks.push({ cloud: c, x, y, r, s: pick(r), a: rand(...recipe.speck.a), ph: rand(0, TAU), f: rand(0.4, 1.1) });
        i++;
      }
    }

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t) => {         // t in seconds
      ctx.clearRect(0, 0, w, h);
      for (const c of clouds) {
        c.sx = SWAY * Math.sin(TAU * t / c.px + c.ph) * w;
        c.sy = SWAY * Math.sin(TAU * t / c.py + c.ph2) * h;
      }
      for (const p of specks) {
        let x, y;
        if (p.cloud) {
          x = p.x * w + p.cloud.sx + Math.sin(t * p.f + p.ph) * 1.2;
          y = p.y * h + p.cloud.sy + Math.cos(t * p.f * 0.8 + p.ph) * 1.2;
        } else {
          x = ((p.x * w + p.vx * t) % w + w) % w;
          y = ((p.y * h + p.vy * t) % h + h) % h;
        }
        ctx.globalAlpha = p.a;
        ctx.drawImage(p.s.c, x - p.s.size / 2, y - p.s.size / 2, p.s.size, p.s.size);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => { draw(now / 1000); requestAnimationFrame(frame); };

    resize();
    addEventListener("resize", () => { resize(); if (reduce) draw(0); });
    if (reduce) draw(0); else requestAnimationFrame(frame);
  });
})();
