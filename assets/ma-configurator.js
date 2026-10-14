/* MiniAnglers — 3D configurator for the Method Champions set (page template
   page.method-champions, section ma-configurator).
   The real printed bodies come from one GLB (ma-cfg-set.glb, converted from the
   owner's Bambu Studio 3MF/STL files). Name and logo are drawn onto canvas
   textures laid on the flat faces: on the print they are flush colour inlays
   (colour modifiers), so a flat decal is a faithful preview.
   Three.js is ma-three.js: three r169 + GLTFLoader, OrbitControls,
   RoomEnvironment and RoundedBoxGeometry in one pre-built minified module
   (vendored file, not built by the theme). To regenerate it, outside the repo:
   npm i three@0.169.0 esbuild, an entry.js that re-exports the THREE.* names
   used below from 'three' plus the four addons from three/examples/jsm/..., then
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
  const { GLTFLoader, OrbitControls, RoomEnvironment, RoundedBoxGeometry } = THREE;
  const CFG = JSON.parse(root.querySelector('script[data-cfg]').textContent);
  root.querySelectorAll('[data-boot]').forEach((n) => n.remove()); // server-rendered placeholder
  const FIL = Object.fromEntries(CFG.filaments.map((f) => [f.id, f]));
  const FONTS = Object.fromEntries(CFG.fonts.map((f) => [f.id, f]));
  const BRAND_FONT = { family: 'Archivo Black', weight: 400, style: 'normal' };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STORE_KEY = 'ma_cfg_' + CFG.code;

  /* ---------------- copy (RO default / EN) ---------------- */
  const I18N = {
    ro: {
      title: 'Method Champions',
      lead: 'Setul de concurs: 4 bacuri de nadă, 2 suporturi de waftere și un suport de geluri. Alegi culorile și numele, iar modelul se schimbă pe loc.',
      loading: 'Se încarcă setul…',
      noGL: 'Browserul tău nu poate afișa modelul 3D. Poți configura setul mai jos, iar rezumatul arată tot ce ai ales.',
      loadErr: 'Modelul 3D nu s-a putut încărca. Reîncarcă pagina; opțiunile de mai jos funcționează oricum.',
      hintTouch: 'Trage ca să rotești. Atinge o piesă ca s-o editezi.',
      hintMouse: 'Trage ca să rotești, rotița face zoom. Click pe o piesă ca s-o editezi.',
      all: 'Tot setul', overview: 'Vezi tot setul', pieces: 'Piesele setului',
      bac: 'Bac', waf: 'Suport waftere', gel: 'Suport geluri', wafShort: 'Waftere', gelShort: 'Geluri',
      dimBac: '160 × 160 × 100 mm, deschis sus', dimWaf: '165 × 100 mm, 2 locașuri', dimGel: '158 × 100 mm, 3 locașuri',
      colors: 'Culori', comboTpl: '{b} cu gravură {e}',
      name: 'Numele gravat', namePh: 'ex. Andrei sau numele echipei',
      nameNote: 'Apare pe fiecare bac și pe suporturi. Pe spatele bacului e logo-ul MiniAnglers.',
      viewBack: 'Vezi fața cu logo-ul', viewFront: 'Vezi fața cu numele',
      font: 'Font', optional: 'opțional',
      top: 'sus', bottom: 'jos',
      pieceColor: 'O piesă în altă culoare',
      pcNote: 'Alege piesa, apoi pornește „Culori doar pentru piesa asta”.',
      remove: 'Elimină',
      ownColor: 'Culori doar pentru piesa asta',
      summary: 'Rezumat', base: 'Setul, 7 piese', engraving: 'Gravura numelui', total: 'Total',
      add: 'Adaugă în coș', adding: 'Se adaugă…',
      noName: 'fără nume', logoOnly: 'doar MiniAnglers',
      slipNote: 'Primim configurația exact cum o vezi și printăm setul după ea.',
      soon: 'Comenzile se deschid în curând', ask: 'Scrie-ne',
      soonNote: 'Setul nu se poate comanda încă online. Configurația ta rămâne salvată pe acest dispozitiv, iar pentru o comandă acum ne poți scrie.',
      cartErr: 'Nu am putut adăuga setul în coș. Încearcă din nou.',
    },
    en: {
      title: 'Method Champions',
      lead: 'The competition set: 4 bait tubs, 2 wafter holders and a gel holder. Pick the colours and the name, and the model updates as you go.',
      loading: 'Loading the set…',
      noGL: 'Your browser can’t show the 3D model. You can still configure the set below; the summary lists everything you picked.',
      loadErr: 'The 3D model didn’t load. Reload the page; the options below still work.',
      hintTouch: 'Drag to rotate. Tap a piece to edit it.',
      hintMouse: 'Drag to rotate, scroll to zoom. Click a piece to edit it.',
      all: 'Whole set', overview: 'See the whole set', pieces: 'Set pieces',
      bac: 'Tub', waf: 'Wafter holder', gel: 'Gel holder', wafShort: 'Wafters', gelShort: 'Gels',
      dimBac: '160 × 160 × 100 mm, open top', dimWaf: '165 × 100 mm, 2 slots', dimGel: '158 × 100 mm, 3 slots',
      colors: 'Colours', comboTpl: '{b} with {e} engraving',
      name: 'Engraved name', namePh: 'e.g. Andrei or your team name',
      nameNote: 'Goes on every tub and on the holders. The MiniAnglers logo sits on the back of each tub.',
      viewBack: 'Show the logo side', viewFront: 'Show the name side',
      font: 'Font', optional: 'optional',
      top: 'top', bottom: 'bottom',
      pieceColor: 'One piece in another colour',
      pcNote: 'Pick the piece, then turn on “Colours for this piece only”.',
      remove: 'Remove',
      ownColor: 'Colours for this piece only',
      summary: 'Summary', base: 'The set, 7 pieces', engraving: 'Name engraving', total: 'Total',
      add: 'Add to cart', adding: 'Adding…',
      noName: 'no name', logoOnly: 'MiniAnglers only',
      slipNote: 'We get your configuration exactly as you see it and print the set from it.',
      soon: 'Orders open soon', ask: 'Write to us',
      soonNote: 'The set can’t be ordered online yet. Your configuration stays saved on this device, and to order now you can write to us.',
      cartErr: 'We couldn’t add the set to your cart. Please try again.',
    },
  };
  const lang = () => (window.MA_LANG === 'en' ? 'en' : 'ro');
  const t = (k) => (I18N[lang()][k] ?? I18N.ro[k] ?? k);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => n.toLocaleString('ro-RO', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + CFG.currency;
  const P = CFG.prices; // null until the set product exists in Shopify
  const filName = (id) => FIL[id][lang()];
  // "Negru cu gravură albă" / "Black with white engraving"
  const comboText = (b, e) => t('comboTpl').replace('{b}', filName(b)).replace('{e}', lang() === 'ro' ? FIL[e].roF : FIL[e].en.toLowerCase());
  const COMBOS = CFG.combos.map(([b, e]) => ({ b, e, v: b + '|' + e }));
  const isCombo = (b, e) => COMBOS.some((c) => c.b === b && c.e === e);
  const fontName = (id) => FONTS[id][lang()];

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
  const BACS = PIECES.filter((p) => p.kind === 'bac').map((p) => p.id);
  const pieceName = (p) => p.kind === 'bac' ? `${t('bac')} ${p.n}` : p.kind === 'suport_gel' ? t('gel') : `${t('waf')} ${p.n}`;
  const chipName = (p) => p.kind === 'bac' ? `${t('bac')} ${p.n}` : p.kind === 'suport_gel' ? t('gelShort') : `${t('wafShort')} ${p.n}`;
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
  const fresh = () => ({
    base: COMBOS[0].b, engr: COMBOS[0].e, name: '', font: CFG.fonts[0].id,
    overrides: {},
  });
  let state = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && FONTS[saved.font]) {
      const ok = (o) => o && isCombo(o.base, o.engr);
      state = Object.assign(fresh(), { name: saved.name || '', font: saved.font });
      if (ok(saved)) Object.assign(state, { base: saved.base, engr: saved.engr });
      Object.entries(saved.overrides || {}).forEach(([id, o]) => { if (byId[id] && ok(o)) state.overrides[id] = { base: o.base, engr: o.engr }; });
    }
  } catch (e) { /* storage blocked: start fresh */ }
  let selected = null;
  let bacFace = 'front'; // which face of the selected tub the camera shows
  let saveTimer = 0;
  const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { } }, 300); };

  const colorsOf = (id) => state.overrides[id] || { base: state.base, engr: state.engr };
  const differs = (id) => { const o = state.overrides[id]; return !!o && (o.base !== state.base || o.engr !== state.engr); };
  const cleanText = (s, max) => s.replace(/[^\p{L}\p{N} .\-&'’!#]/gu, '').replace(/\s{2,}/g, ' ').slice(0, max);
  // a name typed on the homepage card arrives as ?nume=
  const fromUrl = new URLSearchParams(location.search).get('nume');
  if (fromUrl) { state.name = cleanText(fromUrl, CFG.maxChars).trim(); save(); }

  function quote() {
    if (!P) return null;
    const lines = [{ key: 'base', label: t('base'), amount: P.base }];
    if (state.name.trim() && P.name) lines.push({ key: 'name', label: t('engraving'), amount: P.name });
    return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
  }

  /* ---------------- DOM skeleton ---------------- */
  root.insertAdjacentHTML('beforeend', `
    <div class="cfg-stage" data-stage>
      <canvas class="cfg-canvas" aria-label="Set MiniAnglers 3D" role="img"></canvas>
      <button type="button" class="cfg-overview" data-act="overview" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/></svg><span data-t="overview"></span>
      </button>
      <button type="button" class="cfg-overview cfg-flip" data-act="flip" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7"/></svg><span data-flip-label></span>
      </button>
      <p class="cfg-hint" data-hint></p>
      <div class="cfg-loading" data-loading><span class="cfg-spin" aria-hidden="true"></span><span data-t="loading"></span></div>
      <div class="cfg-chips" data-chips role="toolbar"></div>
    </div>
    <div class="cfg-panel" data-panel></div>`);
  const $ = (s) => root.querySelector(s);
  const stage = $('[data-stage]');
  const canvas = $('.cfg-canvas');
  const panel = $('[data-panel]');

  // keep the sticky stage under the site's sticky header (+ the category strip, sticky on desktop only)
  const nav = document.querySelector('[data-nav]');
  const catnav = document.querySelector('.catnav');
  const syncTop = () => {
    let h = nav ? nav.getBoundingClientRect().height : 0;
    if (catnav && getComputedStyle(catnav).position === 'sticky') h += catnav.getBoundingClientRect().height;
    root.style.setProperty('--cfg-top', Math.round(h) + 'px');
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
  function drawLines(d, fit, f, cx, cy, color) {
    const { ctx, ppm, w, h } = d;
    const cap = capEm(f) * fit.em, gap = fit.em * 1.1, n = fit.lines.length;
    ctx.font = fontCss(f, fit.em * ppm);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const top = cy - cap / 2 + (n - 1) * gap / 2; // first baseline, so the block is centred on cy
    fit.lines.forEach((line, i) => ctx.fillText(line, (cx + w / 2) * ppm, (h - (top - i * gap)) * ppm));
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
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 8000);
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
    Object.assign(sun.shadow.camera, { left: -480, right: 480, top: 300, bottom: -300, near: 200, far: 2200 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.8;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9); // keeps the logo faces (away from the sun) readable
    fill.position.set(380, 420, -700);
    scene.add(fill);

    // the side tray the set sits on: anodised-aluminium plate with a low lip
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x9EA5A0, roughness: 0.5, metalness: 0.3 });
    const tray = new THREE.Mesh(new RoundedBoxGeometry(800, 14, 420, 4, 6), trayMat);
    tray.position.set(0, -7, 10);
    tray.receiveShadow = true;
    scene.add(tray);
    const lipShape = roundedRect(800, 420, 14);
    lipShape.holes.push(roundedRect(788, 408, 9));
    const lip = new THREE.Mesh(new THREE.ExtrudeGeometry(lipShape, { depth: 9, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 1, bevelSegments: 2, curveSegments: 10 }), trayMat);
    lip.rotation.x = -Math.PI / 2; lip.position.set(0, -1.2, 10);
    lip.castShadow = lip.receiveShadow = true;
    scene.add(lip);
    // soft contact shadow under the tray
    const sc = document.createElement('canvas'); sc.width = sc.height = 128;
    const sg = sc.getContext('2d'); const grad = sg.createRadialGradient(64, 64, 8, 64, 64, 64);
    grad.addColorStop(0, 'rgba(20,40,28,0.28)'); grad.addColorStop(1, 'rgba(20,40,28,0)');
    sg.fillStyle = grad; sg.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1150, 640), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -16.5, 18);
    scene.add(shadow);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 180;
    controls.maxDistance = 2600;
    controls.minPolarAngle = THREE.MathUtils.degToRad(8);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(84);
    controls.screenSpacePanning = true;
    controls.rotateSpeed = 0.7;
    controls.addEventListener('start', () => { anim = null; userMoved = true; hideHint(); });
    controls.addEventListener('change', () => {
      const tg = controls.target; // keep panning on the tray
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
    const pad = 7, t = 3.2;
    const outer = roundedRect(w + pad * 2, d + pad * 2, r + pad);
    outer.holes.push(roundedRect(w + (pad - t) * 2, d + (pad - t) * 2, r + pad - t));
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
    const name = state.name.trim();
    const fr = p.decals.front, bk = p.decals.back;
    clearDecal(fr); clearDecal(bk);
    const L = {};
    if (name) L.name = drawLines(fr, fitText(name, f, 98, 26, 17, 15), f, 0, 58, col);
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
    const name = state.name.trim();
    const brandTop = HOLDER_ORDER[p.def.kind] === 'brandTop';
    // each text fills its zone; a long name may take two lines when the zone is tall enough
    const block = (d, text, f, k) => drawLines(d, fitText(text, f, d.w - 4, d.h * k, d.h / 1.95, d.h * k * 0.72), f, 0, d.h / 2, col);
    const L = { brand: Object.assign(block(brandTop ? top : bottom, 'MiniAnglers', BRAND_FONT, 0.68), { zone: brandTop ? 'sus' : 'jos' }) };
    if (name) L.name = Object.assign(block(brandTop ? bottom : top, name, FONTS[state.font], 0.8), { zone: brandTop ? 'jos' : 'sus' });
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
    const text = (sample || '') + 'MiniAnglers×ĂÂÎȘȚăâîșț0123456789';
    Promise.all([BRAND_FONT, ...CFG.fonts].map((f) => document.fonts.load(fontCss(f, 40), text))).then(redrawAll, redrawAll);
  }

  /* ---------------- camera ---------------- */
  const V3 = THREE.Vector3;
  const UP = new V3(0, 1, 0);
  const PAD = { top: 14, bottom: 78 }; // px of the stage covered by overlays (piece chips at the bottom)
  function pieceBox(id) {
    const p = byId[id], [w, d] = FOOT[p.kind], h = p.kind === 'bac' ? 100 : 40;
    return new THREE.Box3(new V3(p.pos[0] - w / 2, 0, p.pos[2] - d / 2), new V3(p.pos[0] + w / 2, h, p.pos[2] + d / 2));
  }
  function OVERVIEW() {
    const box = new THREE.Box3();
    PIECES.forEach((p) => box.union(pieceBox(p.id)));
    const portrait = camera.aspect < 0.85;
    return { box, dir: new V3(0, portrait ? 0.95 : camera.aspect < 1.35 ? 0.8 : 0.62, 1).normalize(), margin: 1.02 };
  }
  function viewFor(id) {
    const p = byId[id];
    if (p.kind === 'bac') {
      const back = bacFace === 'back';
      return { box: pieceBox(id), dir: new V3(back ? -0.12 : 0.12, back ? 0.5 : 0.62, back ? -1 : 1).normalize(), margin: 1.12 };
    }
    return { box: pieceBox(id), dir: new V3(0.06, 1.3, 1).normalize(), margin: 1.14 };
  }
  // distance at which the whole box fits the free part of the stage, looking along -dir at the box centre
  function fitDist(v, target) {
    const h = stage.clientHeight || 1;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tv = tanV * Math.max(0.3, (h - PAD.top - PAD.bottom) / h), th = tanV * camera.aspect;
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
    // shift the picture up so the box centre sits in the middle of the area above the chips
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

  /* ---------------- picking ---------------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pickAt(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const objs = Object.values(pieces).map((p) => p.mesh);
    const hit = ray.intersectObjects(objs, false)[0];
    return hit ? hit.object.userData.pieceId : null;
  }
  if (renderer) {
    let down = null;
    canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
        const id = pickAt(e.clientX, e.clientY);
        if (id) select(id);
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
      const on = p.def.id === selected, hov = p.def.id === hovered;
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
  function resize() {
    if (!renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    applyViewOffset();
    camera.updateProjectionMatrix();
    if (!userMoved && !anim) goTo(selected ? viewFor(selected) : OVERVIEW(), { instant: true });
    needsRender = true;
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);

  /* ---------------- selection ---------------- */
  function select(id) {
    selected = id;
    bacFace = 'front';
    userMoved = false;
    hideHint();
    updateRings();
    goTo(id ? viewFor(id) : OVERVIEW());
    renderChips();
    renderPanel();
    $('.cfg-overview').hidden = !id;
    renderFlip();
    if (id) {
      const card = panel.querySelector('[data-piece-card]');
      if (card) card.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  /* ---------------- UI ---------------- */
  function renderFlip() {
    const b = $('[data-act="flip"]');
    b.hidden = !(selected && byId[selected].kind === 'bac');
    b.querySelector('[data-flip-label]').textContent = t(bacFace === 'back' ? 'viewFront' : 'viewBack');
  }
  function hideHint() { const h = $('[data-hint]'); if (h) h.classList.add('is-gone'); }
  function renderStatic() {
    root.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    const fine = matchMedia('(pointer: fine)').matches;
    $('[data-hint]').textContent = t(fine ? 'hintMouse' : 'hintTouch');
  }

  function renderChips() {
    const chips = [{ id: '', label: t('all') }, ...PIECES.map((p) => ({ id: p.id, label: chipName(p) }))];
    const box = $('[data-chips]');
    box.setAttribute('aria-label', t('pieces'));
    box.innerHTML = chips.map((c) => `<button type="button" class="cfg-chip" data-act="pick" data-id="${c.id}" aria-pressed="${(selected || '') === c.id}">${esc(c.label)}</button>`).join('');
    const on = box.querySelector('[aria-pressed="true"]');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
  }

  // the curated colour pairs (piece + engraving) as one radio group
  function combos(group, cur) {
    return `<div class="cfg-field">
      <div class="cfg-field-top"><span class="cfg-label" id="lbl-${group}">${esc(t('colors'))}</span><span class="cfg-value">${esc(comboText(cur.base, cur.engr))}</span></div>
      <div class="cfg-combos" role="radiogroup" aria-labelledby="lbl-${group}">
        ${COMBOS.map((c) => `<label class="cfg-combo">
          <input type="radio" name="${group}" value="${c.v}" data-act="${group}" ${c.b === cur.base && c.e === cur.engr ? 'checked' : ''}>
          <span class="cfg-dot" style="--a:${FIL[c.b].hex};--b:${FIL[c.e].hex}" aria-hidden="true"></span>
          <span class="cfg-combo-name"><span class="cfg-sr">${esc(comboText(c.b, c.e))}</span><span aria-hidden="true">${esc(filName(c.b))} + ${esc(filName(c.e))}</span></span></label>`).join('')}
      </div></div>`;
  }
  const fee = (amount) => (amount ? `<span class="cfg-fee">+${money(amount)}</span>` : '');
  // folded optional section; stays open across re-renders once the customer opens it
  const openMore = { colors: Object.keys(state.overrides).length > 0 };
  const more = (key, title, price, body) => `<details class="cfg-more" data-more="${key}"${openMore[key] ? ' open' : ''}>
      <summary><span class="cfg-more-t">${esc(t(title))} <i>(${esc(t('optional'))})</i></span>${price}</summary>
      <div class="cfg-more-body">${body}</div></details>`;

  // "sus MiniAnglers, jos „Ovi”" for one holder type
  function holderText(kind) {
    const name = state.name.trim();
    if (!name) return t('logoOnly');
    return HOLDER_ORDER[kind] === 'brandTop'
      ? `${t('top')} MiniAnglers, ${t('bottom')} „${name}”` : `${t('top')} „${name}”, ${t('bottom')} MiniAnglers`;
  }

  function pieceCard() {
    const p = byId[selected];
    const own = !!state.overrides[p.id];
    const ov = colorsOf(p.id);
    const dim = p.kind === 'bac' ? t('dimBac') : p.kind === 'suport_gel' ? t('dimGel') : t('dimWaf');
    return `<section class="cfg-sec cfg-piece" data-piece-card aria-label="${esc(pieceName(p))}">
      <div class="cfg-piece-top">
        <div><h2 class="cfg-h">${esc(pieceName(p))}</h2><p class="cfg-note">${esc(dim)}</p></div>
        <button type="button" class="btn btn-ghost btn-sm" data-act="overview">${esc(t('overview'))}</button>
      </div>
      <label class="cfg-switch"><input type="checkbox" data-act="own" data-id="${p.id}" ${own ? 'checked' : ''}><span class="cfg-switch-ui" aria-hidden="true"></span><span>${esc(t('ownColor'))}</span></label>
      ${own ? `<div class="cfg-own">${combos('ocombo', ov)}</div>` : ''}
    </section>`;
  }

  function renderPanel() {
    const ovr = PIECES.filter((p) => state.overrides[p.id]);
    panel.innerHTML = `
      <header class="cfg-head">
        <h1 class="cfg-title">${esc(t('title'))}</h1>
        <p class="cfg-lead">${esc(t('lead'))}</p>
      </header>
      ${selected ? pieceCard() : ''}
      <section class="cfg-sec cfg-main">
        <div class="cfg-field">
          <div class="cfg-field-top"><label class="cfg-label" for="cfg-name">${esc(t('name'))}</label>${P ? fee(P.name) : ''}</div>
          <div class="cfg-input-wrap">
            <input class="cfg-input cfg-input-name" id="cfg-name" data-act="name" maxlength="${CFG.maxChars}" value="${esc(state.name)}" placeholder="${esc(t('namePh'))}" autocomplete="off" spellcheck="false" enterkeyhint="done">
            <span class="cfg-count" data-count>${state.name.length}/${CFG.maxChars}</span>
          </div>
          <p class="cfg-note">${esc(t('nameNote'))}</p>
        </div>
        ${combos('combo', state)}
        <div class="cfg-field">
          <span class="cfg-label" id="lbl-font">${esc(t('font'))}</span>
          <div class="cfg-pills" role="radiogroup" aria-labelledby="lbl-font">
            ${CFG.fonts.map((f) => `<label class="cfg-pill">
              <input type="radio" name="font" value="${f.id}" data-act="font" ${f.id === state.font ? 'checked' : ''}>
              <span style="font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style}">${esc(fontName(f.id))}</span></label>`).join('')}
          </div>
        </div>
      </section>
      <section class="cfg-sec cfg-extras">
        ${more('colors', 'pieceColor', '', `
          <p class="cfg-note">${esc(t('pcNote'))}</p>
          <div class="cfg-pick-list">${PIECES.map((p) => `<button type="button" class="cfg-preset${state.overrides[p.id] ? ' has-own' : ''}" data-act="pick" data-id="${p.id}" aria-pressed="${selected === p.id}">
            ${state.overrides[p.id] ? `<span class="cfg-mini" style="--a:${FIL[colorsOf(p.id).base].hex};--b:${FIL[colorsOf(p.id).engr].hex}"></span>` : ''}${esc(chipName(p))}</button>`).join('')}</div>
          ${ovr.length ? `<ul class="cfg-ovr">${ovr.map((p) => { const c = colorsOf(p.id); return `<li>
            <span><b>${esc(pieceName(p))}</b> ${esc(comboText(c.base, c.engr))}</span>
            <button type="button" class="cfg-link" data-act="unown" data-id="${p.id}">${esc(t('remove'))}</button></li>`; }).join('')}</ul>` : ''}`)}
      </section>
      <section class="cfg-sec cfg-summary" data-summary></section>
      ${P ? `<div class="cfg-buy">
        <div class="cfg-buy-total"><span>${esc(t('total'))}</span><strong data-total></strong></div>
        <button type="button" class="btn btn-lg cfg-add" data-act="add">${esc(t('add'))}</button>
        <p class="cfg-buy-err" data-cart-err role="alert" hidden></p>
      </div>` : `<div class="cfg-buy is-soon">
        <div class="cfg-buy-total"><strong class="cfg-soon">${esc(t('soon'))}</strong></div>
        <a class="btn btn-ghost btn-lg cfg-add" href="${esc(CFG.contact)}">${esc(t('ask'))}</a>
      </div>`}`;
    renderSummary();
  }

  function renderSummary() {
    const q = quote();
    const name = state.name.trim();
    const rows = PIECES.map((p) => {
      const c = colorsOf(p.id);
      let text;
      if (p.kind === 'bac') {
        text = name ? `„${name}”` : t('noName');
      } else {
        text = holderText(p.kind);
      }
      return `<tr${differs(p.id) ? ' class="is-own"' : ''}><th scope="row">${esc(pieceName(p))}</th>
        <td><span class="cfg-mini" style="--a:${FIL[c.base].hex};--b:${FIL[c.engr].hex}"></span>${esc(filName(c.base))} + ${esc(filName(c.engr))}</td><td>${esc(text)}</td></tr>`;
    }).join('');
    const box = panel.querySelector('[data-summary]');
    if (box) box.innerHTML = `
      <h2 class="cfg-h">${esc(t('summary'))}</h2>
      <p class="cfg-note">${esc(t('font'))}: ${esc(fontName(state.font))}</p>
      <div class="cfg-slip-wrap"><table class="cfg-slip"><tbody>${rows}</tbody></table></div>
      ${q ? `<dl class="cfg-lines">${q.lines.map((l) => `<div><dt>${esc(l.label)}</dt><dd>${money(l.amount)}</dd></div>`).join('')}</dl>
      <div class="cfg-total"><span>${esc(t('total'))}</span><strong>${money(q.total)}</strong></div>` : ''}
      <p class="cfg-note">${esc(t(q ? 'slipNote' : 'soonNote'))}</p>`;
    const tot = panel.querySelector('[data-total]');
    if (tot && q) tot.textContent = money(q.total);
  }

  function refreshLight() {
    // updates that don't rebuild the panel (keeps focus while typing)
    const c = panel.querySelector('[data-count]');
    if (c) c.textContent = `${state.name.length}/${CFG.maxChars}`;
    renderSummary();
  }

  /* ---------------- events ---------------- */
  root.addEventListener('input', (e) => {
    const el = e.target, act = el.dataset.act;
    if (act === 'name') {
      const v = cleanText(el.value, CFG.maxChars);
      if (v !== el.value) el.value = v;
      state.name = v;
      ensureFonts(v);
    } else return;
    save(); redrawAll(); refreshLight();
  });

  root.addEventListener('change', (e) => {
    const el = e.target, act = el.dataset.act;
    if (act === 'combo') {
      [state.base, state.engr] = el.value.split('|');
    } else if (act === 'font') {
      state.font = el.value;
    } else if (act === 'own') {
      if (el.checked) state.overrides[el.dataset.id] = { base: state.base, engr: state.engr };
      else delete state.overrides[el.dataset.id];
    } else if (act === 'ocombo') {
      const o = state.overrides[selected];
      if (!o) return;
      [o.base, o.engr] = el.value.split('|');
    } else return;
    // keep piece overrides that now equal the set colours (still shown as "own", not charged)
    save(); redrawAll();
    const focusSel = el.name ? `input[name="${el.name}"][value="${el.value}"]` : null;
    renderPanel();
    if (focusSel) { const f = panel.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }
  });

  // <details> toggle doesn't bubble: listen in the capture phase
  root.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset && d.dataset.more) openMore[d.dataset.more] = d.open; }, true);

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'INPUT') return;
    const act = b.dataset.act;
    if (act === 'overview') select(null);
    else if (act === 'flip') { bacFace = bacFace === 'back' ? 'front' : 'back'; userMoved = false; goTo(viewFor(selected)); renderFlip(); }
    else if (act === 'pick') select(b.dataset.id || null);
    else if (act === 'unown') {
      delete state.overrides[b.dataset.id];
      save(); redrawAll(); renderPanel();
    } else if (act === 'add') addToCart(b);
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
        base: fil(state.base), engraving: fil(state.engr), name: state.name.trim(),
        font: { id: f.id, family: f.family, weight: f.weight, style: f.style },
        holdersLayout: {
          suport_waftere: HOLDER_ORDER.suport_waftere === 'brandTop' ? 'MiniAnglers sus, nume jos' : 'nume sus, MiniAnglers jos',
          suport_gel: HOLDER_ORDER.suport_gel === 'brandTop' ? 'MiniAnglers sus, nume jos' : 'nume sus, MiniAnglers jos',
        },
      },
      pieces: PIECES.map((p) => {
        const c = colorsOf(p.id);
        return Object.assign({
          id: p.id, type: p.kind, name: pieceName(p),
          base: fil(c.base), engraving: fil(c.engr), customColors: differs(p.id),
        }, { layout: pieces[p.id] ? pieces[p.id].layout : null });
      }),
      notes: { flatZoneMm: 110, faceHeightMm: 98, bacName: 'numele pe o față, centrat (ca în BacuriNadaCompetitionOvi.3mf)', bacLogo: 'logo 37 mm pe fața opusă, centrat', holders: 'sus = banda din spatele locașurilor (partea înaltă), jos = zona din fața lor (partea joasă)' },
      price: q ? { currency: CFG.currency, total: q.total, lines: q.lines.map((l) => ({ item: l.key, label: l.label, amount: l.amount })) } : null,
    };
  }

  function readable(pl) {
    const props = {
      'Culori set': `${pl.set.base.name} + gravură ${pl.set.engraving.name}`,
      'Nume gravat': pl.set.name || '—',
      'Font': FONTS[state.font].ro,
    };
    const own = pl.pieces.filter((p) => p.customColors).map((p) => `${p.name}: ${p.base.name} + ${p.engraving.name}`);
    if (own.length) props['Culori pe piese'] = own.join(', ');
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
    const err = panel.querySelector('[data-cart-err]');
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
  renderChips();
  renderPanel();
  ensureFonts(state.name);
  document.addEventListener('ma:lang', () => { renderStatic(); renderChips(); renderPanel(); renderFlip(); redrawAll(); });

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
    // one orchestrated entrance: the camera settles onto the tray
    const v = OVERVIEW(), c = v.box.getCenter(new V3());
    const end = c.clone().addScaledVector(v.dir, fitDist(v, c));
    goTo(v, { from: end.clone().add(new V3(140, 260, 380)), dur: 1300 });
    setTimeout(hideHint, 9000);
  }, undefined, () => {
    $('[data-loading]').innerHTML = `<span>${esc(t('loadErr'))}</span>`;
  });
}
