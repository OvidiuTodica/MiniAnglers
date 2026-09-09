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
      'nav.account': 'Cont',
      'aria.search': 'Caută',
      'aria.cart': 'Coș',
      'aria.account': 'Contul meu',
      // announcement
      'announce.text': 'Logo gravat gratuit pe fiecare piesă. Livrăm oriunde în țară.',
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
      'hero.cta1': 'Vezi produsele',
      // products
      'products.heading': 'Produsele. Date reale, imprimate 3D.',
      'products.example': 'PREȚ EXEMPLU',
      'products.soon': 'În curând',
      'products.view': 'Vezi produsul',
      // engraving (product page)
      'config.engraving': 'Gravare',
      'config.chars': 'caractere',
      'config.eng_standard': 'Logo MiniAnglers',
      'config.eng_standard_sub': 'Inclus, fără cost',
      'config.eng_custom': 'Gravează numele tău',
      'config.placeholder': 'Numele tău',
      'config.namehere': 'NUMELE TĂU AICI',
      // product page
      'product.back': '← Toate produsele',
      'product.preview': 'Previzualizare gravură',
      'product.add': 'Adaugă în coș',
      'product.soldout': 'Stoc epuizat',
      'product.photo_soon': 'Foto în curând',
      'cart.added': 'Adăugat în coș', 'cart.view': 'Vezi coșul',
      'pdp.trust': 'Logo gravat gratuit, printat în Timiș, livrare în 4-5 zile.',
      // footer
      'footer.tagline': 'Totul la locul lui.',
      'footer.blurb': 'Cutii pentru nadă și suporturi, printate 3D în Timiș.',
      'footer.company': 'Companie',
      'footer.company0': 'Despre noi', 'footer.company1': 'Contact', 'footer.company2': 'Întrebări frecvente',
      'footer.news_title': 'Rămâi la curent',
      'footer.news_text': 'Produse noi și reveniri în stoc. Fără spam.',
      'footer.join': 'Abonează-te',
      'footer.rights': 'Toate drepturile rezervate.',
      'footer.legal1': 'Confidențialitate', 'footer.legal2': 'Termeni și condiții', 'footer.legal3': 'Retur și rambursare', 'footer.legal4': 'Livrare',
      'cart.title': 'Construcția ta', 'cart.empty': 'Coșul tău este gol.', 'cart.start': 'Începe personalizarea',
      'cart.qty': 'Cant.', 'cart.update': 'Actualizează', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Finalizează comanda', 'cart.remove': 'Elimină din coș',
      // storefront homepage
      'search.ph': 'Caută produse...',
      'catnav.all': 'Toate produsele', 'catnav.bacuri': 'Bacuri de nadă', 'catnav.wafters': 'Suporturi wafters', 'catnav.gel': 'Suporturi gel & dip', 'catnav.gravare': 'Gravare',
      'promo.tag': 'Printat 3D în Timiș',
      'promo.title': 'Toată nada ta, la locul ei.',
      'promo.sub': 'Cutii și suporturi pentru wafters, gel și pop-up, printate 3D. Gravăm gratuit logo-ul MiniAnglers pe fiecare piesă.',
      'promo.cta': 'Vezi produsele',
      'cats.bacuri': 'Bacuri de nadă', 'cats.bacuri_p': 'de la 199 lei',
      'cats.wafters': 'Suporturi wafters', 'cats.wafters_p': 'de la 89 lei',
      'cats.gel': 'Suporturi gel & dip', 'cats.gel_p': 'de la 39 lei',
      'cats.gravare': 'Gravare personalizată', 'cats.gravare_p': 'Logo inclus gratuit',
      'shop.heading': 'Toate produsele', 'shop.f_all': 'Toate', 'shop.f_bacuri': 'Bacuri', 'shop.f_suporturi': 'Suporturi', 'shop.sort': 'Sortează: Populare',
      'shop.badge_new': 'Nou', 'shop.badge_best': 'Best seller',
      'val.t1': 'Printat 3D la noi', 'val.d1': 'Făcut la comandă, în Timiș.',
      'val.t2': 'Logo gravat gratuit', 'val.d2': 'Pe fiecare piesă.',
      'val.t3': 'Livrăm în toată țara', 'val.d3': 'Ambalat sigur pentru drum.',
      'val.t4': 'Retur în 14 zile', 'val.d4': 'Fără bătăi de cap.',
    },
    en: {
      'nav.shop': 'Shop',
      'nav.process': 'The Process',
      'nav.contact': 'Contact',
      'nav.account': 'Account',
      'aria.search': 'Search',
      'aria.cart': 'Cart',
      'aria.account': 'My account',
      'announce.text': 'Free logo engraving on every piece. We ship anywhere in the country.',
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
      'hero.cta1': 'View the products',
      'products.heading': 'The products. Real data, 3D-printed.',
      'products.example': 'EXAMPLE PRICE',
      'products.soon': 'Coming soon',
      'products.view': 'View product',
      'config.engraving': 'Engraving',
      'config.chars': 'characters',
      'config.eng_standard': 'MiniAnglers logo',
      'config.eng_standard_sub': 'Included, free',
      'config.eng_custom': 'Engrave your name',
      'config.placeholder': 'Your name',
      'config.namehere': 'YOUR NAME HERE',
      'product.back': '← All products',
      'product.preview': 'Engraving preview',
      'product.add': 'Add to cart',
      'product.soldout': 'Sold out',
      'product.photo_soon': 'Photo soon',
      'cart.added': 'Added to cart', 'cart.view': 'View cart',
      'pdp.trust': 'Free logo engraving, printed in Timiș, 4-5 day delivery.',
      'footer.tagline': 'Everything in its place.',
      'footer.blurb': 'Bait boxes and holders, 3D-printed in Timiș.',
      'footer.company': 'Company',
      'footer.company0': 'About us', 'footer.company1': 'Contact', 'footer.company2': 'FAQ',
      'footer.news_title': 'Stay in the loop',
      'footer.news_text': 'New products and restocks. No spam.',
      'footer.join': 'Join',
      'footer.rights': 'All rights reserved.',
      'footer.legal1': 'Privacy', 'footer.legal2': 'Terms & Conditions', 'footer.legal3': 'Returns & Refunds', 'footer.legal4': 'Shipping',
      'cart.title': 'Your build', 'cart.empty': 'Your cart is empty.', 'cart.start': 'Start customizing',
      'cart.qty': 'Qty', 'cart.update': 'Update', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove from cart',
      // storefront homepage
      'search.ph': 'Search products...',
      'catnav.all': 'All products', 'catnav.bacuri': 'Bait tubs', 'catnav.wafters': 'Wafter holders', 'catnav.gel': 'Gel & dip holders', 'catnav.gravare': 'Engraving',
      'promo.tag': '3D-printed in Timiș',
      'promo.title': 'All your bait, in its place.',
      'promo.sub': 'Boxes and holders for wafters, gel and pop-ups, 3D-printed. We engrave the MiniAnglers logo free on every piece.',
      'promo.cta': 'See the products',
      'cats.bacuri': 'Bait tubs', 'cats.bacuri_p': 'from 199 lei',
      'cats.wafters': 'Wafter holders', 'cats.wafters_p': 'from 89 lei',
      'cats.gel': 'Gel & dip holders', 'cats.gel_p': 'from 39 lei',
      'cats.gravare': 'Custom engraving', 'cats.gravare_p': 'Logo included free',
      'shop.heading': 'All products', 'shop.f_all': 'All', 'shop.f_bacuri': 'Tubs', 'shop.f_suporturi': 'Holders', 'shop.sort': 'Sort: Popular',
      'shop.badge_new': 'New', 'shop.badge_best': 'Best seller',
      'val.t1': '3D-printed in-house', 'val.d1': 'Made to order in Timiș.',
      'val.t2': 'Free logo engraving', 'val.d2': 'On every piece.',
      'val.t3': 'We ship nationwide', 'val.d3': 'Packed safe for the trip.',
      'val.t4': '14-day returns', 'val.d4': 'No hassle.',
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
