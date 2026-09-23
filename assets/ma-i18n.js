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
      'announce.text': 'Gravare personalizată cu numele tău. Livrăm oriunde în țară.',
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
      'config.eng_standard': 'Fără gravare',
      'config.eng_standard_sub': 'Modelul standard',
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
      'pdp.trust': 'Printat în Timiș, livrare în 4-5 zile.',
      // footer
      'footer.tagline': 'Totul la locul lui.',
      'footer.blurb': 'Cutii pentru nadă și suporturi, printate 3D în Timiș.',
      'footer.company': 'Companie',
      'footer.company0': 'Despre noi', 'footer.company1': 'Contact', 'footer.company2': 'Întrebări frecvente',
      'footer.account': 'Contul meu',
      'footer.news_title': 'Rămâi la curent',
      'footer.news_text': 'Produse noi și reveniri în stoc. Fără spam.',
      'footer.join': 'Abonează-te',
      'footer.rights': 'Toate drepturile rezervate.',
      'footer.legal1': 'Confidențialitate', 'footer.legal2': 'Termeni și condiții', 'footer.legal3': 'Retur și rambursare', 'footer.legal4': 'Livrare',
      'footer.anpc_sal': 'ANPC – SAL', 'footer.anpc_sol': 'SOL – Soluționarea online a litigiilor',
      'cart.title': 'Construcția ta', 'cart.empty': 'Coșul tău este gol.', 'cart.start': 'Începe personalizarea',
      'cart.qty': 'Cant.', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Finalizează comanda', 'cart.remove': 'Elimină din coș',
      // faq page (q1 has a Liquid price, so its answer uses data-i18n-en in the template)
      'faq.eyebrow': 'Întrebări frecvente',
      'faq.heading': 'Ce trebuie să știi.',
      'faq.q1': 'Cum funcționează personalizarea (gravarea)?',
      'faq.q2': 'Cât durează până primesc comanda?',
      'faq.a2': 'Fiecare produs e imprimat 3D la comandă. Modelul standard ajunge în <strong>4–5 zile lucrătoare</strong>, iar cel cu gravare personalizată în <strong>8–10 zile lucrătoare</strong>. Detalii pe pagina <a href="/pages/procesul">Procesul</a>.',
      'faq.q3': 'Din ce sunt făcute produsele?',
      'faq.a3': 'Sunt imprimate 3D din PETG — un material rezistent la umezeală, la razele UV și la manevrarea de pe mal — proiectate și fabricate de noi, în România. Detalii pe pagina <a href="/pages/procesul">Procesul</a>.',
      'faq.q4': 'Pot cere o dimensiune sau o configurație specială?',
      'faq.a4': 'Da. Pentru cereri speciale (alt număr de compartimente, alt finisaj), scrie-ne pe pagina de <a href="/pages/contact">Contact</a> și găsim o soluție.',
      'faq.q5': 'Pot returna un produs personalizat?',
      'faq.a5': 'Produsele gravate sunt făcute special pentru tine, așa că nu intră sub dreptul de retragere de 14 zile — dar rămân acoperite de garanția legală dacă ajung defecte. Detalii complete în <a href="/pages/retur-si-rambursare">Politica de Retur și Rambursare</a>.',
      'faq.q6': 'Cum îmi fac cont și cum mă conectez?',
      'faq.a6': 'Nu ai nevoie de parolă. Introduci adresa de email, primești pe email un cod de 6 cifre și intri în <a href="/account">contul tău</a>. Acolo vezi comenzile tale, statusul livrării și adresele salvate. Poți comanda și fără cont.',
      'faq.cta': 'Mai ai o întrebare? Scrie-ne',
      // storefront homepage
      'search.ph': 'Caută produse...',
      'catnav.all': 'Toate produsele', 'catnav.bacuri': 'Bacuri de nadă', 'catnav.wafters': 'Suporturi wafters', 'catnav.gel': 'Suporturi gel & dip', 'catnav.gravare': 'Gravare',
      'promo.tag': 'Printat 3D în Timiș',
      'promo.title': 'Toată nada ta, la locul ei.',
      'promo.sub': 'Cutii și suporturi pentru wafters, gel și pop-up, printate 3D. Le gravăm cu numele tău, dacă vrei.',
      'promo.cta': 'Vezi produsele',
      'promo.offer_tag': 'Ofertă',
      'promo.offer_sub': 'Patru bacuri și două suporturi care se îmbină într-un singur setup.',
      'promo.save': 'Economisești',
      'promo.separately': 'Cumpărate separat:',
      'promo.offer_cta': 'Vreau setul',
      // offer (top bar, cards, product pages, cart)
      'offer.at': 'la',
      'offer.ann_pre': 'Cu',
      'offer.ann_post': 'mai puțin decât piesele cumpărate separat.',
      'offer.see': 'Vezi setul',
      'offer.vs_separate': 'față de piesele separat',
      'offer.in_set': 'Ce e în set',
      'offer.only_in_set': 'doar în set',
      'offer.get_in': 'Ia-l în',
      'offer.cart_have': 'Ai', 'offer.cart_of': 'din cele', 'offer.cart_pieces': 'piese din',
      'offer.cart_yours': 'Piesele tale:', 'offer.cart_full': 'Setul complet, cu toate', 'offer.cart_full2': 'piesele:',
      'cats.bacuri': 'Bacuri de nadă', 'cats.bacuri_p': 'de la 199 RON',
      'cats.wafters': 'Suporturi wafters', 'cats.wafters_p': 'de la 89 RON',
      'cats.gel': 'Suporturi gel & dip', 'cats.gel_p': 'de la 39 RON',
      'cats.gravare': 'Gravare personalizată', 'cats.gravare_p': 'Cu numele tău',
      'shop.heading': 'Toate produsele', 'shop.f_all': 'Toate', 'shop.f_bacuri': 'Bacuri', 'shop.f_suporturi': 'Suporturi', 'shop.empty': 'Primele produse apar în curând.',
      'shop.badge_new': 'Nou', 'shop.badge_best': 'Best seller',
      // catalog page
      'catalog.title': 'Produse', 'catalog.lead': 'Sisteme de pescuit imprimate 3D, gata de personalizat cu numele tău.',
      'val.t1': 'Printat 3D', 'val.d1': 'Făcut la comandă.',
      'val.t2': 'Gravare cu numele tău', 'val.d2': 'Opțional, pe orice piesă.',
      'val.t3': 'Livrăm în toată țara', 'val.d3': 'Ambalat sigur pentru drum.',
      'val.t4': 'Retur în 14 zile', 'val.d4': 'Pentru piesele fără gravare personalizată.',
    },
    en: {
      'nav.shop': 'Shop',
      'nav.process': 'The Process',
      'nav.contact': 'Contact',
      'nav.account': 'Account',
      'aria.search': 'Search',
      'aria.cart': 'Cart',
      'aria.account': 'My account',
      'announce.text': 'Custom engraving with your name. We ship anywhere in the country.',
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
      'config.eng_standard': 'No engraving',
      'config.eng_standard_sub': 'Standard model',
      'config.eng_custom': 'Engrave your name',
      'config.placeholder': 'Your name',
      'config.namehere': 'YOUR NAME HERE',
      'product.back': '← All products',
      'product.preview': 'Engraving preview',
      'product.add': 'Add to cart',
      'product.soldout': 'Sold out',
      'product.photo_soon': 'Photo soon',
      'cart.added': 'Added to cart', 'cart.view': 'View cart',
      'pdp.trust': 'Printed in Timiș, 4-5 day delivery.',
      'footer.tagline': 'Everything in its place.',
      'footer.blurb': 'Bait boxes and holders, 3D-printed in Timiș.',
      'footer.company': 'Company',
      'footer.company0': 'About us', 'footer.company1': 'Contact', 'footer.company2': 'FAQ',
      'footer.account': 'My account',
      'footer.news_title': 'Stay in the loop',
      'footer.news_text': 'New products and restocks. No spam.',
      'footer.join': 'Join',
      'footer.rights': 'All rights reserved.',
      'footer.legal1': 'Privacy', 'footer.legal2': 'Terms & Conditions', 'footer.legal3': 'Returns & Refunds', 'footer.legal4': 'Shipping',
      'footer.anpc_sal': 'ANPC – ADR (consumer disputes)', 'footer.anpc_sol': 'EU online dispute resolution (ODR)',
      'cart.title': 'Your build', 'cart.empty': 'Your cart is empty.', 'cart.start': 'Start customizing',
      'cart.qty': 'Qty', 'cart.subtotal': 'Subtotal', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove from cart',
      // faq page (q1 has a Liquid price, so its answer uses data-i18n-en in the template)
      'faq.eyebrow': 'Frequently asked',
      'faq.heading': 'What you need to know.',
      'faq.q1': 'How does the engraving work?',
      'faq.q2': 'How long until my order arrives?',
      'faq.a2': 'Every item is 3D printed to order. The standard model arrives in <strong>4–5 working days</strong>, the engraved one in <strong>8–10 working days</strong>. More on the <a href="/pages/procesul">Process</a> page.',
      'faq.q3': 'What are the products made of?',
      'faq.a3': 'They are 3D printed in PETG — a material that stands up to damp, to UV and to being handled on the bank — designed and made by us, in Romania. More on the <a href="/pages/procesul">Process</a> page.',
      'faq.q4': 'Can I ask for a special size or layout?',
      'faq.a4': 'Yes. For special requests (a different number of compartments, a different finish), write to us on the <a href="/pages/contact">Contact</a> page and we will find a solution.',
      'faq.q5': 'Can I return a personalised product?',
      'faq.a5': 'Engraved products are made specifically for you, so they fall outside the 14-day right of withdrawal — but they stay covered by the legal warranty if they arrive faulty. Full details in the <a href="/pages/retur-si-rambursare">Return and Refund Policy</a>.',
      'faq.q6': 'How do I create an account and sign in?',
      'faq.a6': 'You do not need a password. Enter your email address, we send you a 6-digit code, and you are in <a href="/account">your account</a>. There you will find your orders, delivery status and saved addresses. You can also order without an account.',
      'faq.cta': 'Still have a question? Write to us',
      // storefront homepage
      'search.ph': 'Search products...',
      'catnav.all': 'All products', 'catnav.bacuri': 'Bait tubs', 'catnav.wafters': 'Wafter holders', 'catnav.gel': 'Gel & dip holders', 'catnav.gravare': 'Engraving',
      'promo.tag': '3D-printed in Timiș',
      'promo.title': 'All your bait, in its place.',
      'promo.sub': 'Boxes and holders for wafters, gel and pop-ups, 3D-printed. Engraved with your name, if you want it.',
      'promo.cta': 'See the products',
      'promo.offer_tag': 'Offer',
      'promo.offer_sub': 'Four bait tubs and two holders that fit together into one setup.',
      'promo.save': 'You save',
      'promo.separately': 'Bought separately:',
      'promo.offer_cta': 'Get the set',
      // offer (top bar, cards, product pages, cart)
      'offer.at': 'for',
      'offer.ann_pre': "That's",
      'offer.ann_post': 'less than buying the pieces separately.',
      'offer.see': 'See the set',
      'offer.vs_separate': 'vs. the pieces separately',
      'offer.in_set': "What's in the set",
      'offer.only_in_set': 'only in the set',
      'offer.get_in': 'Get it in',
      'offer.cart_have': 'You have', 'offer.cart_of': 'of the', 'offer.cart_pieces': 'pieces in',
      'offer.cart_yours': 'Your pieces:', 'offer.cart_full': 'The full set, with all', 'offer.cart_full2': 'pieces:',
      'cats.bacuri': 'Bait tubs', 'cats.bacuri_p': 'from 199 RON',
      'cats.wafters': 'Wafter holders', 'cats.wafters_p': 'from 89 RON',
      'cats.gel': 'Gel & dip holders', 'cats.gel_p': 'from 39 RON',
      'cats.gravare': 'Custom engraving', 'cats.gravare_p': 'With your name',
      'shop.heading': 'All products', 'shop.f_all': 'All', 'shop.f_bacuri': 'Tubs', 'shop.f_suporturi': 'Holders', 'shop.empty': 'The first products are on their way.',
      'shop.badge_new': 'New', 'shop.badge_best': 'Best seller',
      'catalog.title': 'Products', 'catalog.lead': '3D-printed tackle systems, ready to be engraved with your name.',
      'val.t1': '3D printed', 'val.d1': 'Made to order.',
      'val.t2': 'Engraved with your name', 'val.d2': 'Optional, on any piece.',
      'val.t3': 'We ship nationwide', 'val.d3': 'Packed safe for the trip.',
      'val.t4': '14-day returns', 'val.d4': 'For pieces without custom engraving.',
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
    // owner-typed text (theme editor) with an English twin: RO is the rendered text, EN lives in the attribute
    document.querySelectorAll('[data-i18n-en]').forEach(el => {
      if (el.dataset.i18nRo == null) el.dataset.i18nRo = el.textContent;
      el.textContent = window.MA_LANG === 'en' ? el.getAttribute('data-i18n-en') : el.dataset.i18nRo;
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
