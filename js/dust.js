// Dust hanging in the air: composed cloud patches over a thin drifting field.
// Usage: <canvas data-dust="dark"></canvas> (light specks on dark), data-dust="light" (brown on cream)
// or data-dust="warm" (soft cream specks on a warm dark panel, e.g. the About portrait side).
(() => {
  const TAU = Math.PI * 2;
  const PHONE = 600;            // canvas width below which the phone name zone and density apply
  const REF_AREA = 1440 * 900;  // speck counts in the recipes are for a canvas this size

  // One recipe per look. x/y/rx/ry are fractions of the canvas width/height.
  // nameZone [x0, x1, y0, y1] is where the intro name sits: no cloud speck is ever
  // placed there, even at full sway, so the clouds can never cover the name.
  const RECIPES = {
    dark: {
      rgb: [238, 234, 226],
      field: { n: 5200, r: [0.35, 1.5], a: [0.1, 0.5] },
      speck: { r: [0.35, 1.4], a: [0.2, 0.75] },
      soft: 0.45,
      clouds: [
        { x: 0.53, y: 0.21, rx: 0.075, ry: 0.11, n: 1300, phone: { x: 0.84, y: 0.13 } }, // top centre
        { x: 0.75, y: 0.62, rx: 0.13, ry: 0.12, n: 2600 },  // middle right
        { x: 0.31, y: 0.80, rx: 0.1, ry: 0.085, n: 1700 },  // bottom left
      ],
      nameZone: { desk: [0, 0.34, 0.18, 0.48], phone: [0, 0.72, 0.18, 0.48] },
    },
    light: {
      rgb: [92, 74, 58],
      field: { n: 3600, r: [0.5, 2.6], a: [0.14, 0.5] },
      speck: { r: [0.5, 2.4], a: [0.2, 0.6] },
      soft: 0.7,                // out-of-focus look
      clouds: [
        { x: 0.47, y: 0.5, rx: 0.2, ry: 0.8, n: 6500 },  // dense band down the middle
      ],
      nameZone: { desk: [0, 0.29, 0.18, 0.48], phone: [0, 0.72, 0.18, 0.48] },
    },
    warm: {
      rgb: [236, 222, 198],
      field: { n: 2600, r: [0.5, 2.4], a: [0.08, 0.38] },
      speck: { r: [0.5, 2.2], a: [0.14, 0.5] },
      soft: 0.65,               // out of focus, like dust caught in warm light
      clouds: [
        { x: 0.68, y: 0.3, rx: 0.3, ry: 0.22, n: 2200 },  // light falling from upper right
        { x: 0.3, y: 0.78, rx: 0.26, ry: 0.16, n: 1300 },
      ],
      nameZone: null,           // no text over this panel (the nav already gets the top fade)
    },
  };

  const SWAY = 0.022;           // cloud sway amplitude, fraction of the canvas
  const FIELD_DRIFT = [3, -1.8];   // thin-field drift, css px per second
  const STAMP_STEPS = 8;
  const NAV_FADE = 64;          // css px: dust fades out under the nav so its text keeps 4.5:1
  const PUSH = { r: 90, rPhone: 70, force: 0.22, stiff: 0.012, damp: 0.88 }; // per 60fps frame
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cursor or finger position in viewport coords, or null. Listened for on window (passive)
  // so the dust never sits in the way of clicks, and touch keeps reporting while the page scrolls.
  let pointer = null;
  if (!reduce) {
    const set = (x, y) => { pointer = { x, y }; };
    const clear = () => { pointer = null; };
    addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") set(e.clientX, e.clientY); }, { passive: true });
    const touch = (e) => set(e.touches[0].clientX, e.touches[0].clientY);
    addEventListener("touchstart", touch, { passive: true });
    addEventListener("touchmove", touch, { passive: true });
    addEventListener("touchend", clear, { passive: true });
    addEventListener("touchcancel", clear, { passive: true });
    document.documentElement.addEventListener("mouseleave", clear);
    addEventListener("blur", clear);
  }

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const gauss = () => {        // standard normal, redrawn beyond ±2.5 so clouds fade out softly
    for (;;) {
      let u = 0; while (!u) u = Math.random();
      const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random());
      if (Math.abs(g) <= 2.5) return g;
    }
  };
  const inZone = (x, y, z, m) => !!z && x > z[0] - m && x < z[1] + m && y > z[2] - m && y < z[3] + m;

  // Round speck stamps at a few sizes, as alpha kernels with a soft edge. Specks are stamped
  // into one pixel buffer per frame (one canvas call), which keeps thousands of specks cheap.
  const makeStamps = (soft, maxR) => Array.from({ length: STAMP_STEPS }, (_, i) => {
    const r = maxR * (i + 1) / STAMP_STEPS;
    if (r < 0.8) return { k: 0, s: Math.min(1, 4 * r * r) };  // a single point, spread over 4 pixels
    const k = Math.ceil(2 * r) + 1, c = k / 2, inner = 1 - soft, a = new Float32Array(k * k);
    for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) {
      let cover = 0;              // 4x4 supersampled coverage of the soft disc
      for (let sy = 0.125; sy < 1; sy += 0.25) for (let sx = 0.125; sx < 1; sx += 0.25) {
        const d = Math.hypot(x + sx - c, y + sy - c) / r;
        cover += d <= inner ? 1 : d < 1 ? (1 - d) / soft : 0;
      }
      a[y * k + x] = cover / 16;
    }
    return { k, a };
  });

  document.querySelectorAll("canvas[data-dust]").forEach((canvas) => {
    const recipe = RECIPES[canvas.dataset.dust] || RECIPES.dark;
    const ctx = canvas.getContext("2d");
    canvas.style.pointerEvents = "none";
    let w = canvas.clientWidth, h = canvas.clientHeight;

    // Speck counts are fixed at load; a resize only rescales (no reshuffle). The phone layout
    // (cloud homes, name zone, push reach) is re-chosen only when a resize crosses PHONE.
    let phone = w < PHONE;
    const scale = (w * h) / REF_AREA * (phone ? 0.6 : 1);
    let zone = recipe.nameZone && (phone ? recipe.nameZone.phone : recipe.nameZone.desk);
    const maxR = Math.max(recipe.field.r[1], recipe.speck.r[1]);
    const stamps = makeStamps(recipe.soft, maxR);
    const pick = (r) => stamps[Math.min(STAMP_STEPS - 1, Math.floor((r / maxR) * STAMP_STEPS))];
    const sized = ([lo, hi]) => lo + (hi - lo) * Math.random() ** 2; // mostly small, a few large
    let reach = phone ? PUSH.rPhone : PUSH.r;

    const clouds = recipe.clouds.map((c) => {
      const home = (phone && c.phone) || c;
      return { x: home.x, y: home.y, desk: c, mobile: c.phone || c, rx: c.rx, ry: c.ry, n: c.n,
        px: rand(45, 90), py: rand(45, 90), ph: rand(0, TAU), ph2: rand(0, TAU) };
    });

    const specks = [];
    for (let i = 0; i < Math.round(recipe.field.n * scale); i++) {
      specks.push({ cloud: null, x: Math.random(), y: Math.random(), st: pick(sized(recipe.field.r)),
        a: rand(...recipe.field.a), dx: FIELD_DRIFT[0] * rand(0.6, 1.4), dy: FIELD_DRIFT[1] * rand(0.6, 1.4),
        ox: 0, oy: 0, vx: 0, vy: 0 });
    }
    for (const c of clouds) {
      const n = Math.round(c.n * scale);
      for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
        const gx = gauss() * c.rx / 2, gy = gauss() * c.ry / 2;   // offset from the cloud centre
        if (c.y + gy > 1 || inZone(c.x + gx, c.y + gy, zone, SWAY)) continue;
        specks.push({ cloud: c, gx, gy, hid: false, st: pick(sized(recipe.speck.r)), a: rand(...recipe.speck.a),
          ph: rand(0, TAU), f: rand(0.4, 1.1), ox: 0, oy: 0, vx: 0, vy: 0 });
        i++;
      }
    }

    // The buffer is at css-pixel resolution: the dust is soft, and this keeps each frame cheap.
    // Each frame starts from the dust colour at zero alpha, written as whole pixels in one call.
    const [cr, cg, cb] = recipe.rgb;
    const clearPixel = new Uint32Array(new Uint8Array([cr, cg, cb, 0]).buffer)[0];
    let img, data, pixels, W, H;
    // A rotation or resize across PHONE moves each cloud to that layout's home and hides any
    // speck that would now sit in the name zone, so the clouds never cover the name.
    const retier = () => {
      if ((w < PHONE) === phone) return;
      phone = w < PHONE;
      zone = recipe.nameZone && (phone ? recipe.nameZone.phone : recipe.nameZone.desk);
      reach = phone ? PUSH.rPhone : PUSH.r;
      for (const c of clouds) { const home = phone ? c.mobile : c.desk; c.x = home.x; c.y = home.y; }
      for (const p of specks) if (p.cloud) p.hid = inZone(p.cloud.x + p.gx, p.cloud.y + p.gy, zone, SWAY);
    };
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      retier();
      W = canvas.width = Math.max(1, Math.round(w)); H = canvas.height = Math.max(1, Math.round(h));
      img = ctx.createImageData(W, H); data = img.data; pixels = new Uint32Array(data.buffer);
    };
    const add = (px, py, v) => {  // composite v (0..1) of the dust colour over pixel (px, py)
      if (px < 0 || py < 0 || px >= W || py >= H) return;
      const i = (py * W + px) * 4 + 3, o = data[i];
      data[i] = o + v * (255 - o);
    };

    // t: seconds of dust time; k: elapsed time in 60fps frames (0 for a still frame)
    const draw = (t, k = 0) => {
      pixels.fill(clearPixel);
      // The nav is fixed to the viewport, so the fade under it follows the viewport too.
      const b = canvas.getBoundingClientRect(), top = b.top;
      let mx = 0, my = 0, near = false;
      if (pointer && k) {
        mx = pointer.x - b.left; my = pointer.y - b.top;
        near = mx > -reach && my > -reach && mx < w + reach && my < h + reach;
      }
      const damp = PUSH.damp ** k;
      for (const c of clouds) {
        c.sx = SWAY * Math.sin(TAU * t / c.px + c.ph) * w;
        c.sy = SWAY * Math.sin(TAU * t / c.py + c.ph2) * h;
      }
      for (const p of specks) {
        if (p.hid) continue;
        let x, y;
        if (p.cloud) {
          x = (p.cloud.x + p.gx) * w + p.cloud.sx + Math.sin(t * p.f + p.ph) * 1.2;
          y = (p.cloud.y + p.gy) * h + p.cloud.sy + Math.cos(t * p.f * 0.8 + p.ph) * 1.2;
        } else {
          x = ((p.x * w + p.dx * t) % w + w) % w;
          y = ((p.y * h + p.dy * t) % h + h) % h;
        }
        // Push: a force away from the pointer moves an offset that springs back to zero.
        if (near) {
          const ex = x + p.ox - mx, ey = y + p.oy - my;
          const d2 = Math.abs(ex) < reach && Math.abs(ey) < reach ? ex * ex + ey * ey : Infinity;
          if (d2 < reach * reach) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / reach) * PUSH.force * k;
            p.vx += ex / d * f; p.vy += ey / d * f;
          }
        }
        if (k && (p.ox || p.oy || p.vx || p.vy)) {
          p.vx = (p.vx - p.ox * PUSH.stiff * k) * damp;
          p.vy = (p.vy - p.oy * PUSH.stiff * k) * damp;
          p.ox += p.vx * k; p.oy += p.vy * k;
          if (Math.abs(p.ox) + Math.abs(p.oy) + Math.abs(p.vx) + Math.abs(p.vy) < 0.01) p.ox = p.oy = p.vx = p.vy = 0;
        }
        x += p.ox; y += p.oy;
        const vy = y + top;       // speck height in the viewport
        if (y < 0 || vy < 0) continue;
        const a = vy < NAV_FADE ? p.a * vy / NAV_FADE : p.a;
        const st = p.st;
        if (!st.k) {              // point speck: split across 4 pixels so slow drift stays smooth
          const fx = Math.floor(x), fy = Math.floor(y), tx = x - fx, ty = y - fy, v = a * st.s;
          add(fx, fy, v * (1 - tx) * (1 - ty)); add(fx + 1, fy, v * tx * (1 - ty));
          add(fx, fy + 1, v * (1 - tx) * ty); add(fx + 1, fy + 1, v * tx * ty);
        } else {
          const x0 = Math.round(x - st.k / 2), y0 = Math.round(y - st.k / 2);
          for (let j = 0; j < st.k; j++) for (let i = 0; i < st.k; i++) add(x0 + i, y0 + j, a * st.a[j * st.k + i]);
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    resize();
    addEventListener("resize", () => { resize(); if (reduce) draw(0); });
    if (reduce) { draw(0); return; }   // still frame: clouds at home, no push, no loop

    // Run only while the dust is on screen and the tab is visible. Dust time advances by
    // clamped steps, so a resumed loop carries on where it stopped instead of jumping.
    let t = 0, last = 0, raf = 0, onScreen = false;
    const frame = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now; t += dt;
      draw(t, dt * 60);
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      const run = onScreen && !document.hidden;
      if (run && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); }).observe(canvas);
    document.addEventListener("visibilitychange", update);
  });
})();
