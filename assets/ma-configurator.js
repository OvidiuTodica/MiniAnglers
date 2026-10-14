/* MiniAnglers — 3D configurator for the Method Champions set (page template
   page.method-champions, section ma-configurator).
   Layout (owner's pick 2026-10-14, "Showroom, pas cu pas"): the set fills a wide
   stage on the studio grey; a floating guide asks one thing at a time (name ->
   colours -> font -> done/cart). On phones the guide is a sheet at the bottom of
   the stage. Every choice redraws the 3D set at once.
   The real printed bodies come from one GLB (ma-cfg-set.glb, converted from the
   owner's Bambu Studio 3MF/STL files). Name and logo are drawn onto canvas
   textures laid on the flat faces: on the print they are flush colour inlays
   (colour modifiers), so a flat decal is a faithful preview.
   Three.js is ma-three.js: three r169 + GLTFLoader, OrbitControls and
   RoomEnvironment in one pre-built minified module (vendored file, not built by
   the theme). To regenerate it, outside the repo: npm i three@0.169.0 esbuild, an
   entry.js that re-exports the THREE.* names used below from 'three' plus the
   three addons from three/examples/jsm/..., then
   npx esbuild entry.js --bundle --format=esm --minify --target=es2020 --outfile=ma-three.js
   Prices and the Add to cart come from the product picked in Theme settings >
   Method Champions: its cheapest variant is the set without a name, its dearest
   the set with the name engraved. No product yet = no price and no cart button.
   Scene units are millimetres. RO is the default language; the page follows
   the site's RO/EN toggle (window.MA_LANG + the 'ma:lang' event). */
const root = document.querySelector('[data-ma-configurator]');
if (root) {
  import(root.dataset.three).then((lib) => start(root, lib)).catch(() => {
    const box = root.querySelector('[data-boot]');
    if (box) box.textContent = root.dataset.loadErr || '';
  });
}

function start(root, THREE) {
  const { GLTFLoader, OrbitControls, RoomEnvironment } = THREE;
  const CFG = JSON.parse(root.querySelector('script[data-cfg]').textContent);
  root.querySelectorAll('[data-boot]').forEach((n) => n.remove()); // server-rendered placeholder
  const FIL = Object.fromEntries(CFG.filaments.map((f) => [f.id, f]));
  const FONTS = Object.fromEntries(CFG.fonts.map((f) => [f.id, f]));
  const BRAND_FONT = { family: 'Archivo Black', weight: 400, style: 'normal' };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const STORE_KEY = 'ma_cfg_' + CFG.code;

  /* ---------------- copy (RO default / EN) ---------------- */
  const I18N = {
    ro: {
      title: 'Method Champions', sub: 'Setul de concurs, cu numele tău pe fiecare piesă.',
      loading: 'Se încarcă setul…',
      noGL: 'Browserul tău nu poate afișa modelul 3D. Poți configura setul mai jos.',
      loadErr: 'Modelul 3D nu s-a putut încărca. Reîncarcă pagina; alegerile de mai jos funcționează oricum.',
      hintMouse: 'Trage ca să rotești setul', hintTouch: 'Trage cu degetul ca să rotești',
      views: 'Vederi', vName: 'Numele', vLogo: 'Logo-ul', vHolders: 'Suporturile', overview: 'Vezi tot setul',
      steps: 'Pașii configurării', sName: 'Nume', sColors: 'Culori', sFont: 'Font', sDone: 'Gata', stepOf: 'Pasul {n} din {t}',
      qName: 'Ce nume scriem pe set?', hName: 'Apare pe fiecare bac și pe suporturi. Poți lăsa gol.', namePh: 'Numele tău', nameLabel: 'Numele de pe set',
      qColors: 'Ce culori vrei?', hColors: 'Cercul e culoarea piesei, punctul e culoarea gravurii.', engr: 'gravură {e}',
      qFont: 'Cum să arate numele?', hFont: 'Așa apare gravat pe bacuri și pe suporturi.',
      qDone: 'Setul tău e gata', hDone: 'Îl printăm exact cum îl vezi.',
      sumName: 'Numele', sumColors: 'Culorile', sumFont: 'Fontul', noName: 'Fără nume', edit: 'Modifică', pairTpl: '{b} cu {e}',
      next: 'Continuă', back: 'Înapoi', add: 'Adaugă în coș', adding: 'Se adaugă…',
      pSet: 'Setul', pNamed: 'Setul cu nume', pTotal: 'Total', pSoon: 'Comenzi în curând',
      soon: 'Comenzile se deschid în curând', ask: 'Scrie-ne',
      soonNote: 'Setul nu se poate comanda încă online. Configurația ta rămâne salvată pe acest dispozitiv.',
      bac: 'Bac', waf: 'Suport waftere', gel: 'Suport geluri',
      cartErr: 'Nu am putut adăuga setul în coș. Încearcă din nou.',
    },
    en: {
      title: 'Method Champions', sub: 'The competition set, with your name on every piece.',
      loading: 'Loading the set…',
      noGL: 'Your browser can’t show the 3D model. You can still configure the set below.',
      loadErr: 'The 3D model didn’t load. Reload the page; the choices below still work.',
      hintMouse: 'Drag to rotate the set', hintTouch: 'Drag with a finger to rotate',
      views: 'Views', vName: 'Name', vLogo: 'Logo', vHolders: 'Holders', overview: 'See the whole set',
      steps: 'Configuration steps', sName: 'Name', sColors: 'Colours', sFont: 'Font', sDone: 'Done', stepOf: 'Step {n} of {t}',
      qName: 'What name goes on the set?', hName: 'It goes on every tub and on the holders. You can leave it empty.', namePh: 'Your name', nameLabel: 'Name on the set',
      qColors: 'Which colours?', hColors: 'The circle is the piece colour, the dot is the engraving colour.', engr: '{e} engraving',
      qFont: 'How should the name look?', hFont: 'This is how it’s engraved on the tubs and holders.',
      qDone: 'Your set is ready', hDone: 'We print it exactly as you see it.',
      sumName: 'Name', sumColors: 'Colours', sumFont: 'Font', noName: 'No name', edit: 'Change', pairTpl: '{b} with {e}',
      next: 'Continue', back: 'Back', add: 'Add to cart', adding: 'Adding…',
      pSet: 'The set', pNamed: 'Set with name', pTotal: 'Total', pSoon: 'Orders open soon',
      soon: 'Orders open soon', ask: 'Write to us',
      soonNote: 'The set can’t be ordered online yet. Your configuration stays saved on this device.',
      bac: 'Tub', waf: 'Wafter holder', gel: 'Gel holder',
      cartErr: 'We couldn’t add the set to your cart. Please try again.',
    },
  };
  const lang = () => (window.MA_LANG === 'en' ? 'en' : 'ro');
  const t = (k) => (I18N[lang()][k] ?? I18N.ro[k] ?? k);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => n.toLocaleString('ro-RO', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + CFG.currency;
  const P = CFG.prices; // null until the set product exists in Shopify
  const filName = (id) => FIL[id][lang()];
  const engrName = (id) => (lang() === 'ro' ? FIL[id].roF : FIL[id].en.toLowerCase());
  const engrText = (e) => t('engr').replace('{e}', engrName(e));
  const pairText = (b, e) => t('pairTpl').replace('{b}', filName(b)).replace('{e}', lang() === 'ro' ? FIL[e].ro.toLowerCase() : FIL[e].en.toLowerCase());
  const COMBOS = CFG.combos.map(([b, e]) => ({ b, e, v: b + '|' + e }));
  const isCombo = (b, e) => COMBOS.some((c) => c.b === b && c.e === e);
  const fontName = (id) => FONTS[id][lang()];
  const fontStyle = (f) => `font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style}`;

  /* ---------------- the set ---------------- */
  // Laid out like a side tray at the peg: tubs in a row at the back, holders in front.
  const PIECES = [
    { id: 'bac1', kind: 'bac', n: 1, pos: [-258, 0, -70] },
    { id: 'bac2', kind: 'bac', n: 2, pos: [-86, 0, -70] },
    { id: 'bac3', kind: 'bac', n: 3, pos: [86, 0, -70] },
    { id: 'bac4', kind: 'bac', n: 4, pos: [258, 0, -70] },
    { id: 'waf1', kind: 'suport_waftere', n: 1, pos: [-186, 0, 104] },
    { id: 'gel', kind: 'suport_gel', n: 0, pos: [0, 0, 104] },
    { id: 'waf2', kind: 'suport_waftere', n: 2, pos: [186, 0, 104] },
  ];
  const byId = Object.fromEntries(PIECES.map((p) => [p.id, p]));

  // Engraving zones measured on the real meshes (mm, piece frame: Y up, engraving face toward +Z).
  // Tub walls are flat for 110 mm (corner radius 25) and 98 mm tall (2 mm rounded lip).
  const ZONES = {
    // As in the owner's BacuriNadaCompetitionOvi.3mf: name on one face, MiniAnglers logo centred on the opposite one.
    bac: {
      front: { c: [0, 49, 80], n: [0, 0, 1], u: [0, 1, 0], w: 110, h: 98, ppm: 8 },
      back: { c: [0, 49, -80], n: [0, 0, -1], u: [0, 1, 0], w: 110, h: 98, ppm: 8 },
    },
    // Holders: two flat zones on the sloped top. "top" = high side behind the pockets, "bottom" = low side toward the viewer.
    suport_waftere: {
      top: { c: [0, 37.15, -40.5], n: [0, 0.95783, 0.28735], u: [0, 0.28735, -0.95783], w: 136, h: 10, ppm: 12 },
      // wedge between the two pockets, widening toward the front edge
      bottom: { c: [0, 12.55, 41.5], n: [0, 0.95783, 0.28735], u: [0, 0.28735, -0.95783], w: 40, h: 11, ppm: 14 },
    },
    suport_gel: {
      top: { c: [0, 30.369, -35.5], n: [0, 0.97278, 0.23175], u: [0, 0.23175, -0.97278], w: 130, h: 14, ppm: 12 },
      bottom: { c: [0, 13.335, 36], n: [0, 0.97278, 0.23175], u: [0, 0.23175, -0.97278], w: 136, h: 14, ppm: 12 },
    },
  };
  const FOOT = { bac: [160, 160, 25], suport_waftere: [165, 100, 12], suport_gel: [158, 100, 12] }; // footprint w, d, corner r
  const LOGO = { w: 37, cy: 54.6 }; // logo face: 37 x 20.5 mm, centred, centre 54.6 mm above the base (from the 3MF)
  // owner's layout: wafter holder = MiniAnglers on top, name below; gel holder = name on top, MiniAnglers below
  const HOLDER_ORDER = { suport_waftere: 'brandTop', suport_gel: 'nameTop' };

  /* ---------------- state ---------------- */
  const fresh = () => ({ base: COMBOS[0].b, engr: COMBOS[0].e, name: '', font: CFG.fonts[0].id });
  let state = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && FONTS[saved.font]) {
      const ok = (o) => o && isCombo(o.base, o.engr);
      state = Object.assign(fresh(), { name: saved.name || '', font: saved.font });
      if (ok(saved)) Object.assign(state, { base: saved.base, engr: saved.engr });
    }
  } catch (e) { /* storage blocked: start fresh */ }
  let saveTimer = 0;
  const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { } }, 300); };
  // every piece has the set's colours (owner, 2026-10-14: no piece in another colour)
  const colorsOf = () => ({ base: state.base, engr: state.engr });
  const cleanText = (s, max) => s.replace(/[^\p{L}\p{N} .\-&'’!#]/gu, '').replace(/\s{2,}/g, ' ').slice(0, max);
  // a name typed on the homepage card arrives as ?nume=
  const fromUrl = new URLSearchParams(location.search).get('nume');
  if (fromUrl) { state.name = cleanText(fromUrl, CFG.maxChars).trim(); save(); }
  const realName = () => state.name.trim();

  // the guide: 0 name, 1 colours, 2 font, 3 done
  const STEP_KEYS = ['sName', 'sColors', 'sFont', 'sDone'];
  let step = 0;
  let focused = null;     // piece the camera is looking at (tap on the model)
  let view = 'name';      // camera view: name / logo / holders
  const fontOff = () => !realName(); // no name, nothing to set in a font
  // while the name step is open and the field is empty, the tubs show a faint "Numele tău"
  const ghost = () => step === 0 && !realName();
  const shownName = () => realName() || (ghost() ? t('namePh') : '');

  function quote() {
    if (!P) return null;
    const named = !!realName() && !!P.name;
    return { named, total: P.base + (named ? P.name : 0), lines: [{ key: 'base', amount: P.base }].concat(named ? [{ key: 'name', amount: P.name }] : []) };
  }

  /* ---------------- DOM skeleton ---------------- */
  root.insertAdjacentHTML('beforeend', `
    <div class="cfg-stage" data-stage>
      <canvas class="cfg-canvas" aria-label="Method Champions 3D" role="img"></canvas>
      <div class="cfg-top" data-top>
        <div class="cfg-titles"><h1 class="cfg-title" data-t="title"></h1><p class="cfg-sub" data-t="sub"></p></div>
        <p class="cfg-price-m" data-price-m></p>
        <div class="cfg-tools">
          <div class="cfg-views" role="group" data-views></div>
          <p class="cfg-hint" data-hint></p>
        </div>
      </div>
      <button type="button" class="cfg-overview" data-act="overview" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/></svg><span data-t="overview"></span>
      </button>
      <div class="cfg-loading" data-loading><span class="cfg-spin" aria-hidden="true"></span><span data-t="loading"></span></div>
      <div class="cfg-dock" data-dock></div>
    </div>`);
  const $ = (s) => root.querySelector(s);
  const stage = $('[data-stage]');
  const canvas = $('.cfg-canvas');
  const topBar = $('[data-top]');
  const dock = $('[data-dock]');

  // the stage fills the screen under the site's sticky header (+ the category strip, sticky on desktop only)
  const nav = document.querySelector('[data-nav]');
  const catnav = document.querySelector('.catnav');
  const syncTop = () => {
    let h = nav ? nav.getBoundingClientRect().height : 0;
    if (catnav && getComputedStyle(catnav).position === 'sticky') h += catnav.getBoundingClientRect().height;
    root.style.setProperty('--cfg-top', Math.round(h) + 'px');
    root.style.setProperty('--cfg-offset', Math.round(root.getBoundingClientRect().top + window.scrollY) + 'px');
  };
  syncTop();
  if ('ResizeObserver' in window) [nav, catnav].forEach((el) => el && new ResizeObserver(syncTop).observe(el));

  /* ---------------- canvas text helpers ---------------- */
  const mctx = document.createElement('canvas').getContext('2d');
  const fontCss = (f, px) => `${f.style} ${f.weight} ${px}px "${f.family}"`;
  const widthEm = (text, f) => { mctx.font = fontCss(f, 100); return mctx.measureText(text).width / 100; };
  const capEm = (f) => { mctx.font = fontCss(f, 100); return mctx.measureText('H').actualBoundingBoxAscent / 100 || 0.72; };

  // Fit text into maxW mm; multi-word text moves to two lines when one line would get too small.
  function fitText(text, f, maxW, maxEm1, maxEm2, minEm1) {
    const one = { lines: [text], em: Math.min(maxEm1, maxW / widthEm(text, f)) };
    const words = text.split(/\s+/);
    if (one.em >= minEm1 || words.length < 2) return one;
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      const em = Math.min(maxEm2, maxW / Math.max(widthEm(a, f), widthEm(b, f)));
      if (!best || em > best.em) best = { lines: [a, b], em };
    }
    return best.em > one.em * 1.08 ? best : one;
  }

  // draw lines centred on (cx, cyFromBottom) mm; returns the block for the order JSON
  function drawLines(d, fit, f, cx, cy, color, alpha = 1) {
    const { ctx, ppm, w, h } = d;
    const cap = capEm(f) * fit.em, gap = fit.em * 1.1, n = fit.lines.length;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = fontCss(f, fit.em * ppm);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const top = cy - cap / 2 + (n - 1) * gap / 2; // first baseline, so the block is centred on cy
    fit.lines.forEach((line, i) => ctx.fillText(line, (cx + w / 2) * ppm, (h - (top - i * gap)) * ppm));
    ctx.restore();
    return { lines: fit.lines, font: f.family, fontSizeMm: +fit.em.toFixed(1), capHeightMm: +cap.toFixed(1), centerXmm: cx, centerFromBottomMm: cy };
  }

  // MiniAnglers logo: drawn from the same SVG paths as the 3MF colour modifier (Path2D = crisp, untainted)
  let logo = null;
  fetch(CFG.logo).then((r) => r.text()).then((svg) => {
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1].split(/\s+/).map(Number);
    const tr = svg.match(/translate\(([-\d.]+),\s*([-\d.]+)\)\s*scale\(([-\d.]+),\s*([-\d.]+)\)/);
    logo = {
      vw: vb[2], vh: vb[3], tx: +tr[1], ty: +tr[2], sx: +tr[3], sy: +tr[4],
      paths: [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => new Path2D(m[1])),
    };
    redrawAll();
  }).catch(() => { });
  function drawLogo(d, color) {
    if (!logo) return null;
    const { ctx, ppm, w, h } = d;
    const lw = LOGO.w, lh = lw * logo.vh / logo.vw;
    const x0 = -lw / 2, yTop = LOGO.cy + lh / 2;
    ctx.save();
    ctx.translate((x0 + w / 2) * ppm, (h - yTop) * ppm);
    ctx.scale(lw * ppm / logo.vw, lw * ppm / logo.vw);
    ctx.translate(logo.tx, logo.ty); ctx.scale(logo.sx, logo.sy);
    ctx.fillStyle = color;
    logo.paths.forEach((p) => ctx.fill(p));
    ctx.restore();
    return { face: 'opusă numelui', widthMm: lw, heightMm: +lh.toFixed(1), centerXmm: 0, centerFromBottomMm: LOGO.cy };
  }

  /* ---------------- 3D scene ---------------- */
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 10, 8000);
  const pieces = {}; // id -> { def, group, mesh, mat, decals, ring, layout }
  let controls = null;
  let needsRender = true;
  let anim = null;
  let userMoved = false;
  let hovered = null;
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x177A48, transparent: true, opacity: 0.95, depthWrite: false });
  const hoverMat = new THREE.MeshBasicMaterial({ color: 0x177A48, transparent: true, opacity: 0.35, depthWrite: false });

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // the stage's studio grey shows through
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping; // keeps filament colours honest
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9ded9, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(-320, 820, 520);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -520, right: 520, top: 340, bottom: -340, near: 200, far: 2200 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.8;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9); // keeps the logo faces (away from the sun) readable
    fill.position.set(380, 420, -700);
    scene.add(fill);

    // studio floor: invisible, it only catches the soft shadows (same look as the homepage picture)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({ opacity: 0.24 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // a mouse wheel over the big stage scrolls the page; pinch-zoom stays on touch screens
    controls.enableZoom = !finePointer;
    controls.minDistance = 180;
    controls.maxDistance = 6000; // a phone held upright needs the camera far back to fit the whole set
    controls.minPolarAngle = THREE.MathUtils.degToRad(8);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(84);
    controls.screenSpacePanning = true;
    controls.rotateSpeed = 0.7;
    controls.addEventListener('start', () => { anim = null; userMoved = true; hideHint(); });
    controls.addEventListener('change', () => {
      const tg = controls.target; // keep panning on the set
      tg.x = THREE.MathUtils.clamp(tg.x, -380, 380); tg.z = THREE.MathUtils.clamp(tg.z, -200, 220); tg.y = THREE.MathUtils.clamp(tg.y, 0, 120);
      needsRender = true;
    });
  }

  function makeDecal(z) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(z.w * z.ppm); cv.height = Math.round(z.h * z.ppm);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mat = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, depthWrite: false, roughness: 0.42, metalness: 0,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(z.w, z.h), mat);
    const n = new THREE.Vector3(...z.n).normalize(), up = new THREE.Vector3(...z.u).normalize();
    const x = new THREE.Vector3().crossVectors(up, n).normalize();
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, n));
    mesh.position.set(...z.c).addScaledVector(n, 0.15);
    mesh.receiveShadow = true;
    return { mesh, canvas: cv, ctx: cv.getContext('2d'), tex, w: z.w, h: z.h, ppm: z.ppm };
  }
  const clearDecal = (d) => { d.ctx.setTransform(1, 0, 0, 1, 0, 0); d.ctx.clearRect(0, 0, d.canvas.width, d.canvas.height); };

  function roundedRect(w, d, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function ringGeo([w, d, r]) {
    const pad = 7, th = 3.2;
    const outer = roundedRect(w + pad * 2, d + pad * 2, r + pad);
    outer.holes.push(roundedRect(w + (pad - th) * 2, d + (pad - th) * 2, r + pad - th));
    const g = new THREE.ShapeGeometry(outer, 10);
    g.rotateX(-Math.PI / 2);
    return g;
  }

  function buildPieces(gltf) {
    const geos = {};
    gltf.scene.traverse((o) => { if (o.isMesh) { const g = o.geometry.clone(); g.scale(1000, 1000, 1000); g.computeBoundingBox(); geos[o.name] = g; } });
    const rings = {};
    PIECES.forEach((def) => {
      const group = new THREE.Group();
      group.position.set(...def.pos);
      const mat = new THREE.MeshStandardMaterial({ roughness: def.kind === 'bac' ? 0.4 : 0.5, metalness: 0 });
      const mesh = new THREE.Mesh(geos[def.kind], mat);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.userData.pieceId = def.id;
      group.add(mesh);
      const decals = {};
      Object.entries(ZONES[def.kind]).forEach(([k, z]) => {
        decals[k] = makeDecal(z);
        decals[k].mesh.userData.pieceId = def.id;
        group.add(decals[k].mesh);
      });
      rings[def.kind] = rings[def.kind] || ringGeo(FOOT[def.kind]);
      const ring = new THREE.Mesh(rings[def.kind], ringMat);
      ring.position.set(def.pos[0], 0.4, def.pos[2]); ring.visible = false; ring.renderOrder = 2;
      scene.add(ring);
      scene.add(group);
      pieces[def.id] = { def, group, mesh, mat, decals, ring, layout: {} };
    });
    redrawAll();
  }

  /* ---------------- drawing the engraving ---------------- */
  const renderHex = (id) => FIL[id].render || FIL[id].hex;

  function drawBac(p) {
    const { base, engr } = colorsOf(p.def.id);
    p.mat.color.set(renderHex(base));
    const col = renderHex(engr);
    const f = FONTS[state.font];
    const name = shownName();
    const fr = p.decals.front, bk = p.decals.back;
    clearDecal(fr); clearDecal(bk);
    const L = {};
    if (name) {
      const block = drawLines(fr, fitText(name, f, 98, 26, 17, 15), f, 0, 58, col, ghost() ? 0.42 : 1);
      if (realName()) L.name = block;
    }
    L.logo = drawLogo(bk, col);
    fr.tex.needsUpdate = bk.tex.needsUpdate = true;
    p.layout = L;
  }

  function drawHolder(p) {
    const { base, engr } = colorsOf(p.def.id);
    p.mat.color.set(renderHex(base));
    const col = renderHex(engr);
    const { top, bottom } = p.decals;
    clearDecal(top); clearDecal(bottom);
    const name = shownName();
    const brandTop = HOLDER_ORDER[p.def.kind] === 'brandTop';
    // each text fills its zone; a long name may take two lines when the zone is tall enough
    const block = (d, text, f, k, a) => drawLines(d, fitText(text, f, d.w - 4, d.h * k, d.h / 1.95, d.h * k * 0.72), f, 0, d.h / 2, col, a);
    const L = { brand: Object.assign(block(brandTop ? top : bottom, 'MiniAnglers', BRAND_FONT, 0.68, 1), { zone: brandTop ? 'sus' : 'jos' }) };
    if (name) {
      const b = Object.assign(block(brandTop ? bottom : top, name, FONTS[state.font], 0.8, ghost() ? 0.42 : 1), { zone: brandTop ? 'jos' : 'sus' });
      if (realName()) L.name = b;
    }
    p.layout = L;
    top.tex.needsUpdate = bottom.tex.needsUpdate = true;
  }

  let redrawQueued = false;
  function redrawAll() {
    if (redrawQueued) return;
    redrawQueued = true;
    requestAnimationFrame(() => {
      redrawQueued = false;
      Object.values(pieces).forEach((p) => (p.def.kind === 'bac' ? drawBac(p) : drawHolder(p)));
      needsRender = true;
    });
  }
  // engraving fonts must be loaded (with the subsets for the typed letters) before canvas can use them
  function ensureFonts(sample) {
    if (!document.fonts || !document.fonts.load) return;
    const text = (sample || '') + t('namePh') + 'MiniAnglers×ĂÂÎȘȚăâîșț0123456789';
    Promise.all([BRAND_FONT, ...CFG.fonts].map((f) => document.fonts.load(fontCss(f, 40), text))).then(redrawAll, redrawAll);
  }

  /* ---------------- camera ---------------- */
  const V3 = THREE.Vector3;
  const UP = new V3(0, 1, 0);
  const PAD = { top: 0, bottom: 0 }; // px of the stage covered by the title bar (top) and the guide (bottom)
  function pieceBox(id) {
    const p = byId[id], [w, d] = FOOT[p.kind], h = p.kind === 'bac' ? 100 : 40;
    return new THREE.Box3(new V3(p.pos[0] - w / 2, 0, p.pos[2] - d / 2), new V3(p.pos[0] + w / 2, h, p.pos[2] + d / 2));
  }
  const boxOf = (ids) => ids.reduce((b, id) => b.union(pieceBox(id)), new THREE.Box3());
  const ALL = PIECES.map((p) => p.id);
  const TUBS = PIECES.filter((p) => p.kind === 'bac').map((p) => p.id);
  const HOLDERS = PIECES.filter((p) => p.kind !== 'bac').map((p) => p.id);
  const VIEWS = {
    name: () => ({ box: boxOf(ALL), dir: new V3(0.1, camera.aspect < 0.85 ? 0.95 : camera.aspect < 1.35 ? 0.85 : 0.72, 1).normalize(), margin: 1.04 }),
    logo: () => ({ box: boxOf(TUBS), dir: new V3(-0.16, 0.5, -1).normalize(), margin: 1.12 }),
    holders: () => ({ box: boxOf(HOLDERS), dir: new V3(0.04, 1.55, 1).normalize(), margin: 1.08 }),
  };
  const viewFor = (id) => ({ box: pieceBox(id), dir: (byId[id].kind === 'bac' ? new V3(0.12, 0.62, 1) : new V3(0.06, 1.3, 1)).normalize(), margin: 1.14 });
  const currentView = () => (focused ? viewFor(focused) : VIEWS[view]());
  // distance at which the whole box fits the free part of the stage, looking along -dir at the box centre
  function fitDist(v, target) {
    const h = stage.clientHeight || 1;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tv = tanV * Math.max(0.25, (h - PAD.top - PAD.bottom) / h), th = tanV * camera.aspect;
    const f = v.dir.clone().negate(), r = new V3().crossVectors(f, UP).normalize(), u = new V3().crossVectors(r, f);
    const { min, max } = v.box;
    let D = 0;
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const q = new V3(x, y, z).sub(target);
      const depth = q.dot(f);
      D = Math.max(D, Math.abs(q.dot(r)) / th - depth, Math.abs(q.dot(u)) / tv - depth);
    }
    return D * v.margin;
  }
  function applyViewOffset() {
    // shift the picture so the box centre sits in the middle of the free area between title bar and guide
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.setViewOffset(w, h, 0, (PAD.bottom - PAD.top) / 2, w, h);
  }
  function goTo(v, opts = {}) {
    if (!controls) return;
    v.target = v.box.getCenter(new V3());
    const toPos = v.target.clone().addScaledVector(v.dir, fitDist(v, v.target));
    const dur = opts.instant || reduceMotion ? 0 : (opts.dur || 850);
    if (opts.from) camera.position.copy(opts.from);
    anim = { fromPos: camera.position.clone(), fromTgt: controls.target.clone(), toPos, toTgt: v.target.clone(), t0: performance.now(), dur };
    needsRender = true;
  }
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  function measurePad() {
    const sr = stage.getBoundingClientRect();
    if (!sr.height) return false;
    const db = dock.getBoundingClientRect();
    // the title row, plus the camera views when they sit under it (phones)
    const tb = Math.max(topBar.getBoundingClientRect().bottom, $('.cfg-tools').getBoundingClientRect().bottom);
    const top = Math.max(0, Math.round(tb - sr.top) + 6);
    const bottom = Math.max(0, Math.round(sr.bottom - db.top) + 10);
    const changed = top !== PAD.top || bottom !== PAD.bottom;
    PAD.top = top; PAD.bottom = bottom;
    return changed;
  }

  /* ---------------- picking ---------------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pickAt(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(Object.values(pieces).map((p) => p.mesh), false)[0];
    return hit ? hit.object.userData.pieceId : null;
  }
  if (renderer) {
    let down = null;
    canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
        const id = pickAt(e.clientX, e.clientY);
        if (id) focusPiece(id);
      }
      down = null;
    });
    let moveQueued = false, lastMove = null;
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || e.buttons) return;
      lastMove = e;
      if (moveQueued) return;
      moveQueued = true;
      requestAnimationFrame(() => {
        moveQueued = false;
        const id = pickAt(lastMove.clientX, lastMove.clientY);
        canvas.style.cursor = id ? 'pointer' : '';
        if (id !== hovered) { hovered = id; updateRings(); }
      });
    });
    canvas.addEventListener('pointerleave', () => { if (hovered) { hovered = null; updateRings(); } });
  }
  function updateRings() {
    Object.values(pieces).forEach((p) => {
      const on = p.def.id === focused, hov = p.def.id === hovered;
      p.ring.visible = on || hov;
      p.ring.material = on ? ringMat : hoverMat;
    });
    needsRender = true;
  }

  /* ---------------- render loop ---------------- */
  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) needsRender = true; }).observe(stage);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || !renderer) return;
    let changed = false;
    if (anim) {
      const k = anim.dur ? Math.min(1, (now - anim.t0) / anim.dur) : 1;
      const e = ease(k);
      camera.position.lerpVectors(anim.fromPos, anim.toPos, e);
      controls.target.lerpVectors(anim.fromTgt, anim.toTgt, e);
      if (k >= 1) anim = null;
      changed = true;
    }
    if (controls && controls.update()) changed = true;
    if (changed || needsRender) { renderer.render(scene, camera); needsRender = false; }
  }
  let ready = false;
  function resize() {
    if (!renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    measurePad();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    applyViewOffset();
    camera.updateProjectionMatrix();
    if (ready && !userMoved && !anim) goTo(currentView(), { instant: true });
    needsRender = true;
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  // the guide changes height from step to step: re-frame the set to the space left above it
  function refit() {
    if (!renderer || !measurePad()) return;
    applyViewOffset();
    camera.updateProjectionMatrix();
    if (ready && !userMoved) goTo(currentView(), { dur: 600 });
    needsRender = true;
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(refit)).observe(dock);

  /* ---------------- camera actions ---------------- */
  function setView(v) {
    view = v; focused = null; userMoved = false;
    updateRings(); renderViews(); renderOverview();
    goTo(currentView());
  }
  function focusPiece(id) {
    focused = id; userMoved = false;
    updateRings(); renderOverview();
    goTo(currentView());
  }
  function overview() {
    focused = null; userMoved = false;
    updateRings(); renderOverview();
    goTo(currentView());
  }

  /* ---------------- UI ---------------- */
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';

  function hideHint() { const h = $('[data-hint]'); if (h) h.classList.add('is-gone'); }
  function renderStatic() {
    root.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('[data-hint]').textContent = t(finePointer ? 'hintMouse' : 'hintTouch');
    renderViews();
  }
  function renderViews() {
    const box = $('[data-views]');
    box.setAttribute('aria-label', t('views'));
    box.innerHTML = [['name', 'vName'], ['logo', 'vLogo'], ['holders', 'vHolders']].map(([v, k]) =>
      `<button type="button" data-act="view" data-view="${v}" aria-pressed="${!focused && view === v}">${esc(t(k))}</button>`).join('');
  }
  function renderOverview() { $('.cfg-overview').hidden = !focused; renderViews(); }

  function priceLine() {
    const q = quote();
    if (!q) return { label: '', value: t('pSoon') };
    return { label: step === 3 ? t('pTotal') : t(q.named ? 'pNamed' : 'pSet'), value: money(q.total) };
  }
  function renderPrice() {
    const p = priceLine();
    const tot = dock.querySelector('[data-total]');
    if (tot) tot.innerHTML = p.label ? `<span>${esc(p.label)}</span><b>${esc(p.value)}</b>` : `<span class="is-soon">${esc(p.value)}</span>`;
    const m = $('[data-price-m]');
    m.innerHTML = p.label ? `<b>${esc(p.value)}</b><span>${esc(p.label)}</span>` : `<span class="is-soon">${esc(p.value)}</span>`;
  }

  // the colour pairs as one radio group of cards
  function colorCards(group, cur) {
    const cards = COMBOS.map((c) => `<label class="cfg-card">
        <input type="radio" name="${group}" value="${c.v}" data-act="${group}" ${cur && c.b === cur.base && c.e === cur.engr ? 'checked' : ''}>
        <span class="cfg-sw" style="--a:${FIL[c.b].hex};--b:${FIL[c.e].hex}" aria-hidden="true"></span>
        <span class="cfg-card-t">${esc(filName(c.b))}<small>${esc(engrText(c.e))}</small></span></label>`);
    return `<div class="cfg-cards cfg-colors" role="radiogroup" aria-label="${esc(t('qColors'))}">${cards.join('')}</div>`;
  }

  function stepsBar() {
    const items = STEP_KEYS.map((k, i) => {
      const off = i === 2 && fontOff();
      const cls = i === step ? 'is-cur' : off ? 'is-off' : i < step ? 'is-done' : '';
      return `<li><button type="button" class="${cls}" data-act="go" data-step="${i}" ${i === step ? 'aria-current="step"' : ''} ${off ? 'disabled' : ''}>
        <em>${i < step && !off ? CHECK : i + 1}</em><span>${esc(t(k))}</span></button></li>`;
    }).join('');
    const bars = STEP_KEYS.map((_, i) => `<i class="${i <= step ? 'is-on' : ''}"></i>`).join('');
    return `<div class="cfg-dock-head">
        <ol class="cfg-steps" aria-label="${esc(t('steps'))}">${items}</ol>
        <div class="cfg-bars" aria-hidden="true">${bars}</div>
        <p class="cfg-stepof">${esc(t('stepOf').replace('{n}', step + 1).replace('{t}', STEP_KEYS.length))}</p>
        <p class="cfg-total" data-total></p>
      </div>`;
  }

  function bodyFor() {
    const q = quote();
    const backBtn = `<button type="button" class="cfg-back" data-act="back" aria-label="${esc(t('back'))}">${BACK}</button>`;
    const nextBtn = `<button type="button" class="btn cfg-next" data-act="next">${esc(t('next'))}${ARROW}</button>`;
    if (step === 0) return {
      q: t('qName'), h: t('hName'),
      opts: `<label class="cfg-sr" for="cfg-name">${esc(t('nameLabel'))}</label>
        <div class="cfg-name"><input class="cfg-name-in" id="cfg-name" data-act="name" maxlength="${CFG.maxChars}" value="${esc(state.name)}" placeholder="${esc(t('namePh'))}" autocomplete="off" spellcheck="false" enterkeyhint="next"><span class="cfg-count" data-count>${state.name.length}/${CFG.maxChars}</span></div>`,
      act: nextBtn,
    };
    if (step === 1) return { q: t('qColors'), h: t('hColors'), opts: colorCards('combo', state), act: backBtn + nextBtn };
    if (step === 2) return {
      q: t('qFont'), h: t('hFont'),
      opts: `<div class="cfg-cards cfg-fonts" role="radiogroup" aria-label="${esc(t('qFont'))}">${CFG.fonts.map((f) => `<label class="cfg-card cfg-font">
          <input type="radio" name="font" value="${f.id}" data-act="font" ${f.id === state.font ? 'checked' : ''}>
          <b style="${fontStyle(f)}">${esc(realName() || t('namePh'))}</b><small>${esc(fontName(f.id))}</small></label>`).join('')}</div>`,
      act: backBtn + nextBtn,
    };
    // step 3: done
    const f = FONTS[state.font];
    const cell = (label, value, go, style) => `<div class="cfg-sum-c"><span>${esc(label)}</span><b${style ? ` style="${style}"` : ''}>${esc(value)}</b>${go != null ? `<button type="button" class="cfg-link" data-act="go" data-step="${go}">${esc(t('edit'))}</button>` : ''}</div>`;
    const buy = q
      ? `<button type="button" class="btn cfg-next cfg-add" data-act="add">${esc(t('add'))}</button>`
      : `<a class="btn btn-ghost cfg-next" href="${esc(CFG.contact)}">${esc(t('ask'))}</a>`;
    return {
      q: q ? t('qDone') : t('soon'),
      h: q ? t('hDone') : t('soonNote'),
      opts: `<div class="cfg-sum">
          ${cell(t('sumName'), realName() || t('noName'), 0)}
          ${cell(t('sumColors'), pairText(state.base, state.engr), 1)}
          ${realName() ? cell(t('sumFont'), realName(), 2, fontStyle(f)) : ''}
        </div>
        <p class="cfg-err" data-cart-err role="alert" hidden></p>`,
      act: backBtn + buy,
    };
  }

  let lastKey = '';
  function renderDock(moveFocus) {
    const b = bodyFor();
    const key = String(step);
    dock.innerHTML = `${stepsBar()}
      <div class="cfg-dock-body${key !== lastKey ? ' is-new' : ''}">
        <div class="cfg-q"><h2 tabindex="-1" data-q>${esc(b.q)}</h2><p>${esc(b.h)}</p></div>
        <div class="cfg-opts">${b.opts}</div>
        <div class="cfg-act">${b.act}</div>
      </div>`;
    lastKey = key;
    renderPrice();
    if (moveFocus) {
      const first = step === 0 ? dock.querySelector('#cfg-name') : dock.querySelector('[data-q]');
      if (first) first.focus({ preventScroll: true });
    }
  }

  function go(n) {
    step = Math.max(0, Math.min(3, n));
    if (focused) { focused = null; renderOverview(); updateRings(); }
    redrawAll(); renderDock(true);
  }
  const next = () => go(step === 1 && fontOff() ? 3 : step + 1);
  const back = () => go(step === 3 && fontOff() ? 1 : step - 1);

  /* ---------------- events ---------------- */
  root.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.act !== 'name') return;
    const v = cleanText(el.value, CFG.maxChars);
    if (v !== el.value) el.value = v;
    state.name = v;
    ensureFonts(v);
    save(); redrawAll();
    const c = dock.querySelector('[data-count]');
    if (c) c.textContent = `${v.length}/${CFG.maxChars}`;
    // the font step turns on/off with the name; the price switches between set / set with name
    dock.querySelector('.cfg-dock-head').outerHTML = stepsBar();
    renderPrice();
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.act === 'name') { e.preventDefault(); next(); }
  });

  root.addEventListener('change', (e) => {
    const el = e.target, act = el.dataset.act;
    if (act === 'combo') {
      [state.base, state.engr] = el.value.split('|');
    } else if (act === 'font') {
      state.font = el.value;
    } else return;
    save(); redrawAll();
    const sel = `input[name="${el.name}"][value="${el.value}"]`;
    renderDock();
    const f = dock.querySelector(sel); if (f) f.focus({ preventScroll: true });
  });

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'INPUT') return;
    const act = b.dataset.act;
    if (act === 'next') next();
    else if (act === 'back') back();
    else if (act === 'go') go(+b.dataset.step);
    else if (act === 'view') setView(b.dataset.view);
    else if (act === 'overview') overview();
    else if (act === 'add') addToCart(b);
  });

  /* ---------------- order payload + cart ---------------- */
  function payload() {
    const q = quote();
    const fil = (id) => ({ id, name: FIL[id].ro, hex: FIL[id].hex });
    const f = FONTS[state.font];
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    return {
      v: 1,
      ref: `${CFG.code}-${stamp}`,
      product: CFG.code,
      created: new Date().toISOString(),
      set: {
        base: fil(state.base), engraving: fil(state.engr), name: realName(),
        font: { id: f.id, family: f.family, weight: f.weight, style: f.style },
        holdersLayout: {
          suport_waftere: HOLDER_ORDER.suport_waftere === 'brandTop' ? 'MiniAnglers sus, nume jos' : 'nume sus, MiniAnglers jos',
          suport_gel: HOLDER_ORDER.suport_gel === 'brandTop' ? 'MiniAnglers sus, nume jos' : 'nume sus, MiniAnglers jos',
        },
      },
      pieces: PIECES.map((p) => {
        const c = colorsOf(p.id);
        return {
          id: p.id, type: p.kind, name: `${I18N.ro[p.kind === 'bac' ? 'bac' : p.kind === 'suport_gel' ? 'gel' : 'waf']}${p.kind === 'suport_gel' ? '' : ' ' + p.n}`,
          base: fil(c.base), engraving: fil(c.engr),
          layout: pieces[p.id] ? pieces[p.id].layout : null,
        };
      }),
      notes: { flatZoneMm: 110, faceHeightMm: 98, bacName: 'numele pe o față, centrat (ca în BacuriNadaCompetitionOvi.3mf)', bacLogo: 'logo 37 mm pe fața opusă, centrat', holders: 'sus = banda din spatele locașurilor (partea înaltă), jos = zona din fața lor (partea joasă)' },
      price: q ? { currency: CFG.currency, total: q.total, lines: q.lines.map((l) => ({ item: l.key, amount: l.amount })) } : null,
    };
  }

  function readable(pl) {
    const props = {
      'Culori set': `${pl.set.base.name} + gravură ${pl.set.engraving.name}`,
      'Nume gravat': pl.set.name || '—',
      'Font': FONTS[state.font].ro,
    };
    props['Cod configurare'] = pl.ref;
    props['_config'] = JSON.stringify(pl);
    return props;
  }

  // cart line: the set variant (with or without the name) + the readable options as line item properties
  async function addToCart(btn) {
    const pl = payload();
    const cart = CFG.cart;
    if (!cart || !cart.plain) return;
    const named = !!pl.set.name;
    const items = [{ id: named && cart.named ? cart.named : cart.plain, quantity: 1, properties: readable(pl) }];
    // product with a single variant: the name is charged by the shop's engraving add-on instead
    if (named && !cart.named && cart.addon) items.push({ id: cart.addon, quantity: 1, properties: { Pentru: `${CFG.title} „${pl.set.name}”` } });
    const err = dock.querySelector('[data-cart-err]');
    if (err) err.hidden = true;
    btn.disabled = true; btn.textContent = t('adding');
    try {
      const r = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items }) });
      if (!r.ok) throw new Error(r.status);
      window.location.href = CFG.cartUrl;
    } catch (e) {
      btn.disabled = false; btn.textContent = t('add');
      if (err) { err.textContent = t('cartErr'); err.hidden = false; }
    }
  }

  /* ---------------- boot ---------------- */
  renderStatic();
  renderDock();
  ensureFonts(state.name);
  document.addEventListener('ma:lang', () => { renderStatic(); renderOverview(); renderDock(); redrawAll(); });

  if (!renderer) {
    stage.classList.add('is-nogl');
    $('[data-loading]').innerHTML = `<span>${esc(t('noGL'))}</span>`;
    return;
  }
  resize();
  requestAnimationFrame(frame);
  new GLTFLoader().load(CFG.model, (gltf) => {
    buildPieces(gltf);
    $('[data-loading]').hidden = true;
    stage.classList.add('is-ready');
    ready = true;
    measurePad();
    applyViewOffset();
    camera.updateProjectionMatrix();
    // one orchestrated entrance: the camera settles onto the set
    const v = VIEWS.name(), c = v.box.getCenter(new V3());
    const end = c.clone().addScaledVector(v.dir, fitDist(v, c));
    goTo(v, { from: end.clone().add(new V3(140, 260, 380)), dur: 1300 });
    setTimeout(hideHint, 9000);
  }, undefined, () => {
    $('[data-loading]').innerHTML = `<span>${esc(t('loadErr'))}</span>`;
  });
}
