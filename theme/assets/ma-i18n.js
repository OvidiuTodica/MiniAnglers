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
      'steps.heading': 'Trei pași până pe mal.',
      'steps.t1': 'Alege modulul', 'steps.d1': 'Cutie, suport de borcane sau sistem complet — alege ce ți se potrivește.',
      'steps.t2': 'Personalizează', 'steps.d2': 'Adaugă numele tău, clubul sau codul echipei — gravat gratuit pe ramă.',
      'steps.t3': 'Primești și pescuiești', 'steps.d3': 'Imprimat 3D în casă și livrat la tine, gata de tava laterală.',
      // features
      'features.eyebrow': 'De ce MiniAnglers',
      'features.heading': 'Construit pentru pescari, de pescari.',
      'features.t1': 'Imprimat 3D în casă', 'features.d1': 'Control total al calității, fără intermediari.',
      'features.t2': 'Gravare gratuită', 'features.d2': 'Numele tău pe fiecare cutie, fără cost suplimentar.',
      'features.t3': 'Sistem modular', 'features.d3': 'Piese care se fixează exact pe tava ta laterală.',
      'features.t4': 'Rezistent pe mal', 'features.d4': 'Materiale alese să țină pe teren, sezon după sezon.',
      // hero
      'hero.eyebrow': 'Sistem Modular de Pescuit',
      'hero.line1': 'Organizat.',
      'hero.line2': 'Precis.',
      'hero.line3': 'Personalizat.',
      'hero.sub': 'Pune capăt haosului de pe tava laterală. Cutii pentru momeală și suporturi pentru wafters proiectate cu precizie, construite exact după setarea și stilul tău.',
      'hero.cta1': 'Începe Personalizarea',
      'hero.cta2': 'Explorează sistemul',
      'hero.stat1n': 'Imprimat 3D', 'hero.stat1l': 'În casă',
      'hero.stat2n': 'Gravat', 'hero.stat2l': 'Numele tău',
      'hero.stat3n': '∞', 'hero.stat3l': 'Configurații',
      'hero.phototag': 'Construcție pe Teren · Pe Mal',
      'hero.spec': 'IMPRIMAT 3D · GRAVAT<br>COMPARTIMENTE MODULARE',
      // products
      'products.eyebrow': 'Sistemul',
      'products.heading': 'Module inginerești.',
      'products.viewall': 'Vezi tot',
      'products.tag1': 'Cutie Momeală · 6 Compartimente',
      'products.desc1': 'Șase compartimente deschise, separatoare unghiulare, ramă gravată.',
      'products.tag2': 'Suport Borcan Momeală',
      'products.desc2': 'Ține trei borcane transparente, se fixează pe tava laterală.',
      'products.tag3': 'Sistem Complet',
      'products.desc3': 'Cutie de momeală, suport de borcane și o șină de aliniere snap-fit.',
      'products.soon': 'În curând',
      'products.view': 'Vezi',
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
      'footer.shop1': 'Cutii de Momeală', 'footer.shop2': 'Suporturi Wafter', 'footer.shop3': 'Sisteme Complete', 'footer.shop4': 'Piese',
      'footer.company': 'Companie',
      'footer.company1': 'Povestea Noastră', 'footer.company2': 'Procesul', 'footer.company3': 'Materiale', 'footer.company4': 'Contact',
      'footer.news_title': 'Rămâi la curent',
      'footer.news_text': 'Module noi și reaprovizionări, fără zgomot.',
      'footer.join': 'Abonează-te',
      'footer.rights': 'Toate drepturile rezervate.',
      'footer.legal': 'Confidențialitate · Termeni · Retururi',
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
      'steps.heading': 'Three steps to the bank.',
      'steps.t1': 'Pick your module', 'steps.d1': 'Box, pot holder or full system — choose what fits you.',
      'steps.t2': 'Personalize', 'steps.d2': 'Add your name, club or rig code — engraved free on the rim.',
      'steps.t3': 'Get it & fish', 'steps.d3': '3D-printed in-house and shipped to you, ready for the side tray.',
      'features.eyebrow': 'Why MiniAnglers',
      'features.heading': 'Built for anglers, by anglers.',
      'features.t1': '3D-printed in-house', 'features.d1': 'Full quality control, no middlemen.',
      'features.t2': 'Free engraving', 'features.d2': 'Your name on every box, at no extra cost.',
      'features.t3': 'Modular system', 'features.d3': 'Parts that lock onto your exact side tray.',
      'features.t4': 'Bankside-tough', 'features.d4': 'Materials chosen to last on the bank, season after season.',
      'hero.eyebrow': 'Modular Tackle System',
      'hero.line1': 'Organized.',
      'hero.line2': 'Precise.',
      'hero.line3': 'Personalized.',
      'hero.sub': 'Put an end to side tray chaos. Precision-engineered bait boxes and wafter supports, custom-built to your exact setup and style.',
      'hero.cta1': 'Start Customizing',
      'hero.cta2': 'Explore the system',
      'hero.stat1n': '3D-Printed', 'hero.stat1l': 'In-house',
      'hero.stat2n': 'Engraved', 'hero.stat2l': 'Your name',
      'hero.stat3n': '∞', 'hero.stat3l': 'Configurations',
      'hero.phototag': 'Field Build · On The Bank',
      'hero.spec': '3D-PRINTED · ENGRAVED<br>MODULAR COMPARTMENTS',
      'products.eyebrow': 'The System',
      'products.heading': 'Engineered modules.',
      'products.viewall': 'View all',
      'products.tag1': 'Bait Box · 6-Bay',
      'products.desc1': 'Six open compartments, angled dividers, engraved rim.',
      'products.tag2': 'Bait-Pot Holder',
      'products.desc2': 'Holds three clear bait pots, locks onto your side tray.',
      'products.tag3': 'Full System',
      'products.desc3': 'Bait box, pot holder and a snap-fit alignment rail.',
      'products.soon': 'Coming soon',
      'products.view': 'View',
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
      'footer.shop1': 'Bait Boxes', 'footer.shop2': 'Wafter Supports', 'footer.shop3': 'Full Systems', 'footer.shop4': 'Spares',
      'footer.company': 'Company',
      'footer.company1': 'Our Story', 'footer.company2': 'The Process', 'footer.company3': 'Materials', 'footer.company4': 'Contact',
      'footer.news_title': 'Stay in the loop',
      'footer.news_text': 'New modules and restocks, no noise.',
      'footer.join': 'Join',
      'footer.rights': 'All rights reserved.',
      'footer.legal': 'Privacy · Terms · Returns',
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
