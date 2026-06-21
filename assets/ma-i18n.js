/* MiniAnglers — bilingual (RO default / EN toggle).
   Romanian is rendered server-side as the default. This swaps static
   [data-i18n] text to the chosen language, persists the choice, and
   notifies other scripts (configurator) via a 'ma:lang' event.
   Brand/product names are intentionally left untranslated. */
(function () {
  const DICT = {
    ro: {
      // nav
      'nav.shop': 'Magazin',
      'nav.personalize': 'Personalizează',
      'nav.process': 'Procesul',
      'nav.contact': 'Contact',
      'nav.customize': 'Personalizează',
      'aria.search': 'Caută',
      'aria.cart': 'Coș',
      // announcement
      'announce.text': 'Gravare gratuită la orice cutie · Imprimat 3D în casă · Livrare în toată țara',
      // steps
      'steps.eyebrow': 'Cum funcționează',
      'steps.heading': 'De la fișier la mal',
      'steps.ref': 'PROCES · 04 PAȘI',
      'steps.t1': 'Alegi cutia', 'steps.d1': 'Bacuri, suport de wafters sau gel — alege ce ți se potrivește.',
      'steps.t2': 'Scrii gravura', 'steps.d2': 'Numele, clubul sau codul echipei. Gratuit, până la 16 caractere.',
      'steps.t3': 'Imprimăm 3D', 'steps.d3': 'Strat cu strat, în casă, cu toleranțe de inginerie.',
      'steps.t4': 'Ajunge la tine', 'steps.d4': 'Gata de pescuit, exact după setarea ta.',
      // features
      'features.eyebrow': 'De ce MiniAnglers',
      'features.heading': 'Construit pentru pescari, de pescari.',
      'features.t1': 'Imprimat 3D în casă', 'features.d1': 'Control total al calității, fără intermediari.',
      'features.t2': 'Gravare gratuită', 'features.d2': 'Numele tău pe fiecare cutie, fără cost suplimentar.',
      'features.t3': 'Sistem modular', 'features.d3': 'Piese care se fixează exact pe tava ta laterală.',
      'features.t4': 'Rezistent pe mal', 'features.d4': 'Materiale alese să țină pe teren, sezon după sezon.',
      // hero
      'hero.eyebrow': 'Sistem Modular de Pescuit · MA-SYS',
      'hero.line1': 'Organizat.',
      'hero.line2': 'Precis.',
      'hero.line3': 'Personalizat.',
      'hero.sub': 'Modele reale, imprimate 3D în casă. Bacuri de nadă, suporturi pentru wafters și gel — proiectate pe milimetru și gravate exact după setarea ta.',
      'hero.cta1': 'Configurează cutia',
      'hero.cta2': 'Vezi procesul',
      'hero.stat1n': '3D', 'hero.stat1l': 'Imprimat în casă',
      'hero.stat2n': '±0.1mm', 'hero.stat2l': 'Toleranță',
      'hero.stat3n': '∞', 'hero.stat3l': 'Configurații',
      'hero.fig': 'FIG.01 — SET 4 BACURI / ASAMBLARE',
      'hero.etch': '— NUMELE TĂU —',
      // products
      'products.eyebrow': 'Sistemul',
      'products.heading': 'Produsele. Date reale, imprimate 3D.',
      'products.viewall': 'Vezi tot',
      'products.example': 'PREȚ EXEMPLU',
      'products.soon': 'În curând',
      'products.view': 'Vezi produsul',
      'engrave.heading': 'Gravarea e gratuită. Întotdeauna.',
      'engrave.text': 'Numele tău, clubul sau codul echipei, gravat direct pe ramă. Fără costuri ascunse — doar identitatea ta pe teren.',
      // configurator
      'config.eyebrow': 'Fă-o a Ta',
      'config.heading': 'Alege o cutie. Adaugă numele tău.',
      'config.sub': 'Construcții standard, gata de pescuit. Singura alegere pe care o faci este ce gravăm pe ramă — numele tău, clubul sau codul echipei.',
      'config.preview': 'Previzualizare Live',
      'config.choose': 'Alege cutia ta',
      'config.engraving': 'Gravare',
      'config.free': 'Gratuit',
      'config.placeholder': 'Numele tău',
      'config.build': 'Construcția ta',
      'config.add': 'Adaugă în Construcție',
      'config.namehere': 'NUMELE TĂU AICI',
      'config.compartments': 'compartimente',
      // product page
      'product.back': '← Toate produsele',
      'product.preview': 'Previzualizare gravură',
      'product.add': 'Adaugă în coș',
      'product.soldout': 'Stoc epuizat',
      // footer
      'footer.tagline': 'Sigilat. Montat. Gravat.',
      'footer.blurb': 'Sisteme de pescuit de precizie pentru pescarul modern la method-feeder. Fabricat în UK.',
      'footer.shop': 'Magazin',
      'footer.shop1': 'Cutii de Momeală', 'footer.shop2': 'Suporturi Wafter', 'footer.shop3': 'Sisteme Complete', 'footer.shop4': 'Întrebări frecvente',
      'footer.company': 'Companie',
      'footer.company1': 'Povestea Noastră', 'footer.company2': 'Procesul', 'footer.company3': 'Materiale', 'footer.company4': 'Contact',
      'footer.news_title': 'Rămâi la curent',
      'footer.news_text': 'Module noi și reaprovizionări, fără zgomot.',
      'footer.join': 'Abonează-te',
      'footer.rights': 'Toate drepturile rezervate.',
      'footer.legal': 'Confidențialitate · Termeni · Retururi',
      'cart.title': 'Construcția ta', 'cart.empty': 'Coșul tău este gol.', 'cart.start': 'Începe personalizarea',
      'cart.qty': 'Cant.', 'cart.update': 'Actualizează', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Finalizează comanda',
    },
    en: {
      'nav.shop': 'Shop',
      'nav.personalize': 'Personalize',
      'nav.process': 'The Process',
      'nav.contact': 'Contact',
      'nav.customize': 'Customize',
      'aria.search': 'Search',
      'aria.cart': 'Cart',
      'announce.text': 'Free engraving on every box · 3D-printed in-house · Nationwide delivery',
      'steps.eyebrow': 'How it works',
      'steps.heading': 'From file to bank',
      'steps.ref': 'PROCESS · 04 STEPS',
      'steps.t1': 'Pick your box', 'steps.d1': 'Tubs, wafter or gel holder — choose what fits you.',
      'steps.t2': 'Write the engraving', 'steps.d2': 'Your name, club or rig code. Free, up to 16 characters.',
      'steps.t3': 'We 3D-print', 'steps.d3': 'Layer by layer, in-house, to engineering tolerances.',
      'steps.t4': 'It reaches you', 'steps.d4': 'Ready to fish, built to your exact setup.',
      'features.eyebrow': 'Why MiniAnglers',
      'features.heading': 'Built for anglers, by anglers.',
      'features.t1': '3D-printed in-house', 'features.d1': 'Full quality control, no middlemen.',
      'features.t2': 'Free engraving', 'features.d2': 'Your name on every box, at no extra cost.',
      'features.t3': 'Modular system', 'features.d3': 'Parts that lock onto your exact side tray.',
      'features.t4': 'Bankside-tough', 'features.d4': 'Materials chosen to last on the bank, season after season.',
      'hero.eyebrow': 'Modular Tackle System · MA-SYS',
      'hero.line1': 'Organized.',
      'hero.line2': 'Precise.',
      'hero.line3': 'Personalized.',
      'hero.sub': 'Real models, 3D-printed in-house. Groundbait tubs, wafter and gel holders — engineered to the millimetre and engraved to your exact setup.',
      'hero.cta1': 'Configure your box',
      'hero.cta2': 'See the process',
      'hero.stat1n': '3D', 'hero.stat1l': 'In-house printed',
      'hero.stat2n': '±0.1mm', 'hero.stat2l': 'Tolerance',
      'hero.stat3n': '∞', 'hero.stat3l': 'Configurations',
      'hero.fig': 'FIG.01 — 4-TUB SET / ASSEMBLY',
      'hero.etch': '— YOUR NAME —',
      'products.eyebrow': 'The System',
      'products.heading': 'The products. Real data, 3D-printed.',
      'products.viewall': 'View all',
      'products.example': 'EXAMPLE PRICE',
      'products.soon': 'Coming soon',
      'products.view': 'View product',
      'engrave.heading': 'Engraving is free. Always.',
      'engrave.text': 'Your name, club or rig code, engraved straight onto the rim. No hidden costs — just your identity on the bank.',
      'config.eyebrow': 'Make It Yours',
      'config.heading': 'Pick a box. Add your name.',
      'config.sub': 'Standard builds, ready to fish. The only choice you make is what we engrave on the rim — your name, club or rig code.',
      'config.preview': 'Live Preview',
      'config.choose': 'Choose your box',
      'config.engraving': 'Engraving',
      'config.free': 'Free',
      'config.placeholder': 'Your name',
      'config.build': 'Your build',
      'config.add': 'Add to Build',
      'config.namehere': 'YOUR NAME HERE',
      'config.compartments': 'compartments',
      'product.back': '← All products',
      'product.preview': 'Engraving preview',
      'product.add': 'Add to cart',
      'product.soldout': 'Sold out',
      'footer.tagline': 'Sealed. Mounted. Etched.',
      'footer.blurb': 'Precision tackle systems for the modern method-feeder angler. Machined in the UK.',
      'footer.shop': 'Shop',
      'footer.shop1': 'Bait Boxes', 'footer.shop2': 'Wafter Supports', 'footer.shop3': 'Full Systems', 'footer.shop4': 'FAQ',
      'footer.company': 'Company',
      'footer.company1': 'Our Story', 'footer.company2': 'The Process', 'footer.company3': 'Materials', 'footer.company4': 'Contact',
      'footer.news_title': 'Stay in the loop',
      'footer.news_text': 'New modules and restocks, no noise.',
      'footer.join': 'Join',
      'footer.rights': 'All rights reserved.',
      'footer.legal': 'Privacy · Terms · Returns',
      'cart.title': 'Your build', 'cart.empty': 'Your cart is empty.', 'cart.start': 'Start customizing',
      'cart.qty': 'Qty', 'cart.update': 'Update', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Checkout',
    },
  };

  const KEY = 'ma_lang';
  window.MA_LANG = localStorage.getItem(KEY) || 'ro';

  window.maT = function (k) {
    const d = DICT[window.MA_LANG] || DICT.ro;
    if (d[k] != null) return d[k];
    return DICT.ro[k] != null ? DICT.ro[k] : k;
  };

  function applyStatic() {
    const d = DICT[window.MA_LANG] || DICT.ro;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (d[k] != null) el.innerHTML = d[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const k = el.getAttribute('data-i18n-ph');
      if (d[k] != null) el.setAttribute('placeholder', d[k]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.getAttribute('data-i18n-aria');
      if (d[k] != null) el.setAttribute('aria-label', d[k]);
    });
    document.documentElement.lang = window.MA_LANG;
    document.querySelectorAll('[data-lang-toggle]').forEach(b => {
      b.textContent = window.MA_LANG === 'ro' ? 'EN' : 'RO';
      b.setAttribute('aria-label', window.MA_LANG === 'ro' ? 'Switch to English' : 'Comută în română');
    });
  }

  window.maSetLang = function (l) {
    window.MA_LANG = l;
    localStorage.setItem(KEY, l);
    applyStatic();
    document.dispatchEvent(new CustomEvent('ma:lang', { detail: l }));
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyStatic();
    document.querySelectorAll('[data-lang-toggle]').forEach(b =>
      b.addEventListener('click', () => window.maSetLang(window.MA_LANG === 'ro' ? 'en' : 'ro')));
  });
})();
