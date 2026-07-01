/* MiniAnglers — bilingual (RO default / EN toggle).
   Romanian is rendered server-side as the default. This swaps static
   [data-i18n] text to the chosen language, persists the choice, and
   notifies other scripts (e.g. the product page) via a 'ma:lang' event.
   Brand/product names are intentionally left untranslated. */
(function () {
  const DICT = {
    ro: {
      // nav
      'nav.shop': 'Magazin',
      'nav.process': 'Procesul',
      'nav.contact': 'Contact',
      'aria.search': 'Caută',
      'aria.cart': 'Coș',
      // announcement
      'announce.text': 'Gravare personalizată disponibilă · Imprimat 3D în casă · Livrare în toată țara',
      // steps
      'steps.heading': 'De la fișier la mal',
      'steps.ref': 'PROCES · 04 PAȘI',
      'steps.t1': 'Alegi cutia', 'steps.d1': 'Bacuri, suport de wafters sau gel — alege ce ți se potrivește.',
      'steps.t2': 'Scrii gravura', 'steps.d2': 'Numele, clubul sau codul echipei — până la 16 caractere.',
      'steps.t3': 'Imprimăm 3D', 'steps.d3': 'Strat cu strat, în casă, cu toleranțe de inginerie.',
      'steps.t4': 'Ajunge la tine', 'steps.d4': 'Gata de pescuit, exact după setarea ta.',
      // features
      'features.eyebrow': 'De ce MiniAnglers',
      'features.heading': 'Construit pentru pescari, de pescari.',
      'features.t1': 'Imprimat 3D în casă', 'features.d1': 'Control total al calității, fără intermediari.',
      'features.t2': 'Gravare personalizată', 'features.d2': 'Scrii tu ce se gravează pe ramă — nume, club sau cod de echipă.',
      'features.t3': 'Sistem modular', 'features.d3': 'Piese care se fixează exact pe tava ta laterală.',
      'features.t4': 'Rezistent pe mal', 'features.d4': 'Materiale alese să țină pe teren, sezon după sezon.',
      // hero
      'hero.eyebrow': 'Sistem Modular de Pescuit · MA-SYS',
      'hero.line1': 'Organizat.',
      'hero.line2': 'Precis.',
      'hero.line3': 'Personalizat.',
      'hero.sub': 'Bacuri de nadă și suporturi pentru wafters și gel, imprimate 3D. Gravare personalizată disponibilă cu numele tău.',
      'hero.cta1': 'Configurează cutia',
      // products
      'products.heading': 'Produsele. Date reale, imprimate 3D.',
      'products.example': 'PREȚ EXEMPLU',
      'products.soon': 'În curând',
      'products.view': 'Vezi produsul',
      // engraving (product page)
      'config.engraving': 'Gravare',
      'config.chars': 'caractere',
      'config.eng_standard': 'Standard — logo MiniAnglers',
      'config.eng_standard_sub': 'Inclus, fără cost',
      'config.eng_custom': 'Gravează numele tău',
      'config.placeholder': 'Numele tău',
      'config.namehere': 'NUMELE TĂU AICI',
      // product page
      'product.back': '← Toate produsele',
      'product.preview': 'Previzualizare gravură',
      'product.add': 'Adaugă în coș',
      'product.soldout': 'Stoc epuizat',
      // footer
      'footer.tagline': 'Sigilat. Montat. Gravat.',
      'footer.blurb': 'Sisteme de pescuit de precizie, proiectate și imprimate 3D în România.',
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
      'cart.qty': 'Cant.', 'cart.update': 'Actualizează', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Finalizează comanda', 'cart.remove': 'Elimină din coș',
    },
    en: {
      'nav.shop': 'Shop',
      'nav.process': 'The Process',
      'nav.contact': 'Contact',
      'aria.search': 'Search',
      'aria.cart': 'Cart',
      'announce.text': 'Custom engraving available · 3D-printed in-house · Nationwide delivery',
      'steps.heading': 'From file to bank',
      'steps.ref': 'PROCESS · 04 STEPS',
      'steps.t1': 'Pick your box', 'steps.d1': 'Tubs, wafter or gel holder — choose what fits you.',
      'steps.t2': 'Write the engraving', 'steps.d2': 'Your name, club or rig code — up to 16 characters.',
      'steps.t3': 'We 3D-print', 'steps.d3': 'Layer by layer, in-house, to engineering tolerances.',
      'steps.t4': 'It reaches you', 'steps.d4': 'Ready to fish, built to your exact setup.',
      'features.eyebrow': 'Why MiniAnglers',
      'features.heading': 'Built for anglers, by anglers.',
      'features.t1': '3D-printed in-house', 'features.d1': 'Full quality control, no middlemen.',
      'features.t2': 'Custom engraving', 'features.d2': 'You choose what gets engraved on the rim — name, club or rig code.',
      'features.t3': 'Modular system', 'features.d3': 'Parts that lock onto your exact side tray.',
      'features.t4': 'Bankside-tough', 'features.d4': 'Materials chosen to last on the bank, season after season.',
      'hero.eyebrow': 'Modular Tackle System · MA-SYS',
      'hero.line1': 'Organized.',
      'hero.line2': 'Precise.',
      'hero.line3': 'Personalized.',
      'hero.sub': 'Groundbait tubs and wafter/gel holders, 3D-printed in-house. Custom engraving available with your name.',
      'hero.cta1': 'Configure your box',
      'products.heading': 'The products. Real data, 3D-printed.',
      'products.example': 'EXAMPLE PRICE',
      'products.soon': 'Coming soon',
      'products.view': 'View product',
      'config.engraving': 'Engraving',
      'config.chars': 'characters',
      'config.eng_standard': 'Standard — MiniAnglers logo',
      'config.eng_standard_sub': 'Included, free',
      'config.eng_custom': 'Engrave your name',
      'config.placeholder': 'Your name',
      'config.namehere': 'YOUR NAME HERE',
      'product.back': '← All products',
      'product.preview': 'Engraving preview',
      'product.add': 'Add to cart',
      'product.soldout': 'Sold out',
      'footer.tagline': 'Sealed. Mounted. Etched.',
      'footer.blurb': 'Precision fishing systems, designed and 3D-printed in Romania.',
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
      'cart.qty': 'Qty', 'cart.update': 'Update', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove from cart',
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
