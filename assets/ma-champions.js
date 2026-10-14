/* MiniAnglers — the Method Champions card in the homepage banner (sections/ma-hero.liquid).
   1. The name typed in the card appears engraved on every piece of the picture. The picture
      is a render of the real 3D models; data-zones holds, for each engraving zone (4 tub
      faces, the 2 wafter holders, the gel holder), its 4 corners on the picture as fractions
      of its width/height. Each zone gets a canvas with the text drawn the way the
      configurator draws it (same fonts, same fitting), mapped onto those corners with a CSS
      perspective transform (matrix3d).
   2. On phones the two cards sit in a swipe row; the two buttons above it jump between them
      and show which one is in view. */
(function () {
  const card = document.querySelector('[data-champ]');
  if (!card) return;

  /* ---------- 1. name on the pieces ---------- */
  const etch = card.querySelector('[data-champ-etch]');
  const input = card.querySelector('[data-champ-input]');
  let zones = [];
  try { zones = JSON.parse(etch.dataset.zones); } catch (e) { return; }

  const MAX = 20;
  const INK = '#F3F4F1'; // white engraving as it renders on the black tubs
  const FONT = { family: 'Archivo Black', weight: 400, style: 'normal' }; // the configurator's "Clasic"
  // engraving zone size in mm (same as the configurator)
  const SIZE = { bac: [110, 98], suport_waftere: [40, 11], suport_gel: [130, 14] };
  const placeholder = () => (window.MA_LANG === 'en' ? 'Your name' : 'Numele tău');
  const clean = (s) => s.replace(/[^\p{L}\p{N} .\-&'’!#]/gu, '').replace(/\s{2,}/g, ' ').slice(0, MAX);

  const mctx = document.createElement('canvas').getContext('2d');
  const fontCss = (px) => `${FONT.style} ${FONT.weight} ${px}px "${FONT.family}"`;
  const widthEm = (text) => { mctx.font = fontCss(100); return mctx.measureText(text).width / 100; };
  const capEm = () => { mctx.font = fontCss(100); return mctx.measureText('H').actualBoundingBoxAscent / 100 || 0.72; };

  // same fitting as the configurator: one line, or two when one line would get too small
  function fitText(text, maxW, maxEm1, maxEm2, minEm1) {
    const one = { lines: [text], em: Math.min(maxEm1, maxW / widthEm(text)) };
    const words = text.split(/\s+/);
    if (one.em >= minEm1 || words.length < 2) return one;
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      const em = Math.min(maxEm2, maxW / Math.max(widthEm(a), widthEm(b)));
      if (!best || em > best.em) best = { lines: [a, b], em };
    }
    return best.em > one.em * 1.08 ? best : one;
  }

  const items = zones.map((z) => {
    const [w, h] = SIZE[z.k];
    const cv = document.createElement('canvas');
    etch.appendChild(cv);
    return { z, w, h, ppm: 0, cv, ctx: cv.getContext('2d') };
  });

  function draw() {
    const text = clean(input.value).trim() || placeholder();
    items.forEach((it) => {
      const { ctx, cv, w, h, ppm, z } = it;
      ctx.clearRect(0, 0, cv.width, cv.height);
      // tubs: one face, centred 58 mm up; holders: the whole band
      const fit = z.k === 'bac' ? fitText(text, 98, 26, 17, 15) : fitText(text, w - 4, h * 0.8, h / 1.95, h * 0.8 * 0.72);
      const cy = z.k === 'bac' ? 58 : h / 2;
      const cap = capEm() * fit.em, gap = fit.em * 1.1, n = fit.lines.length;
      ctx.font = fontCss(fit.em * ppm);
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const top = cy - cap / 2 + (n - 1) * gap / 2;
      fit.lines.forEach((line, i) => ctx.fillText(line, (w / 2) * ppm, (h - (top - i * gap)) * ppm));
    });
  }

  // homography taking the canvas rectangle to the zone's 4 corners -> CSS matrix3d
  function solve(A, b) {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      let p = i;
      for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
      for (let r = i + 1; r < n; r++) {
        const f = A[r][i] / A[i][i];
        for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
        b[r] -= f * b[i];
      }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let s = b[i];
      for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
      x[i] = s / A[i][i];
    }
    return x;
  }
  function matrix3d(w, h, dst) {
    const src = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [u, v] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    const m = solve(A, b);
    return `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,1)`;
  }
  // canvas resolution follows the size the zone has on screen (~1.6 canvas px per device px),
  // so the text stays crisp without the shimmer of a heavily scaled-down canvas
  function place() {
    const W = etch.clientWidth, H = etch.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    let resized = false;
    items.forEach((it) => {
      const q = it.z.q.map(([x, y]) => [x * W, y * H]);
      const shown = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]);
      const ppm = Math.max(2, Math.min(16, Math.round(shown * dpr * 1.6 / it.w)));
      if (ppm !== it.ppm) {
        it.ppm = ppm;
        it.cv.width = Math.round(it.w * ppm); it.cv.height = Math.round(it.h * ppm);
        resized = true;
      }
      it.cv.style.width = it.cv.width + 'px';
      it.cv.style.height = it.cv.height + 'px';
      it.cv.style.transform = matrix3d(it.cv.width, it.cv.height, q);
    });
    if (resized && ready) draw();
  }

  // the engraving font loads only once the card is on screen (it isn't used anywhere else on the page)
  let ready = false;
  function boot() {
    if (ready) return;
    ready = true;
    const faces = [
      new FontFace(FONT.family, `url(${card.dataset.font}) format('woff2')`, { unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212' }),
      new FontFace(FONT.family, `url(${card.dataset.fontExt}) format('woff2')`, { unicodeRange: 'U+0100-02AF, U+1E00-1EFF, U+20A0-20AB, U+20AD-20C0, U+2C60-2C7F, U+A720-A7FF' }),
    ];
    faces.forEach((f) => document.fonts.add(f));
    place();
    Promise.all(faces.map((f) => f.load().catch(() => null))).then(() => { draw(); card.classList.add('is-etched'); });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: '200px' });
    io.observe(card);
  } else boot();
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(etch);

  input.addEventListener('input', () => {
    const v = clean(input.value);
    if (v !== input.value) input.value = v;
    if (ready) draw();
  });
  document.addEventListener('ma:lang', () => { if (ready) draw(); });

  /* ---------- 2. phones: switch between the two cards ---------- */
  const row = document.querySelector('[data-hero-split]');
  const pick = document.querySelector('[data-hero-pick]');
  if (!row || !pick) return;
  const btns = [...pick.querySelectorAll('[data-pick]')];
  const mark = (i) => btns.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  btns.forEach((b, i) => b.addEventListener('click', () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left: i ? row.scrollWidth : 0, behavior: reduce ? 'auto' : 'smooth' }); // two cards: start or end
    mark(i);
  }));
  let tick = 0;
  row.addEventListener('scroll', () => {
    cancelAnimationFrame(tick);
    tick = requestAnimationFrame(() => mark(row.scrollLeft > (row.scrollWidth - row.clientWidth) / 2 ? 1 : 0));
  }, { passive: true });
})();
