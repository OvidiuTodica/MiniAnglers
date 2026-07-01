/* MiniAnglers product page — engraving with two options.
   Standard (free) keeps the shop-name logo on the rim; Custom (paid) lets
   the customer type a name. When "custom" is chosen AND a linked engraving
   product exists (data-eng-variant), submitting adds a SECOND cart line for
   that product via the Ajax Cart API so it is charged; otherwise the form
   submits normally (single item), carrying a line-item property that records
   the standard logo or the typed name. */
(function () {
  const t = (k) => (typeof window.maT === 'function' ? window.maT(k) : k);

  function init(root) {
    const form   = root.closest('form');
    const input  = root.querySelector('[data-eng-input]');
    const etch   = root.querySelector('[data-eng-etch]');
    const count  = root.querySelector('[data-eng-count]');
    const stdProp = root.querySelector('[data-eng-standard-prop]');
    const opts   = root.querySelectorAll('.eng-opt');
    const radios = root.querySelectorAll('input[name="eng_choice"]');
    const maxLen = parseInt(root.dataset.max, 10) || (input ? parseInt(input.getAttribute('maxlength'), 10) : 16) || 16;
    const engVariantId = root.dataset.engVariant ? parseInt(root.dataset.engVariant, 10) : null;
    const cartUrl = root.dataset.cartUrl || '/cart';
    const logo = root.dataset.logo || 'MiniAnglers';

    function choice() {
      const c = root.querySelector('input[name="eng_choice"]:checked');
      return c ? c.value : 'standard';
    }

    function render() {
      const custom = choice() === 'custom';
      const name = (input && input.value || '').trim();
      // preview plate: typed name (custom) or the shop logo (standard)
      if (etch) etch.textContent = custom ? (name ? name.toUpperCase() : t('config.namehere')) : logo;
      if (count) count.textContent = `${(input ? input.value.length : 0)}/${maxLen} ${t('config.chars')}`;
    }

    function applyChoice() {
      const custom = choice() === 'custom';
      // toggle which "Gravare" property submits + show/hide the text field
      if (input)   { input.disabled = !custom; input.hidden = !custom; }
      if (count)   { count.hidden = !custom; }
      if (stdProp) { stdProp.disabled = custom; }
      opts.forEach((o) => o.classList.toggle('is-active', o.dataset.engOpt === (custom ? 'custom' : 'standard')));
      if (custom && input) input.focus();
      render();
    }

    radios.forEach((r) => r.addEventListener('change', applyChoice));
    if (input) input.addEventListener('input', render);
    document.addEventListener('ma:lang', render);
    applyChoice();

    if (!form || !engVariantId) return; // no linked engraving product: standard/normal submit only

    form.addEventListener('submit', function (e) {
      if (choice() !== 'custom') return; // standard logo -> normal single-item submit
      const name = (input && input.value || '').trim();
      if (!name) return; // custom but empty -> submit as-is

      e.preventDefault();
      const idField = form.querySelector('input[name="id"]');
      const mainId = idField ? parseInt(idField.value, 10) : null;
      if (!mainId) { form.submit(); return; }

      const submitBtn = form.querySelector('.product-add');
      if (submitBtn) submitBtn.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: mainId, quantity: 1, properties: { Gravare: name } },
            { id: engVariantId, quantity: 1, properties: { 'Pentru': name } }
          ]
        })
      })
        .then((res) => { if (!res.ok) throw new Error('cart add failed'); return res.json(); })
        .then(() => { window.location.href = cartUrl; })
        .catch(() => {
          if (submitBtn) submitBtn.disabled = false;
          form.submit(); // fall back to native single-item submit
        });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-product-engrave]').forEach(init);
  });
})();

/* Product gallery — clicking a thumbnail swaps the main image. */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('[data-product-gallery]');
    if (!gallery) return;
    const mainImg = gallery.querySelector('[data-main-image]');
    const thumbs = gallery.querySelectorAll('[data-thumb]');
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const full = btn.dataset.full;
        if (!full) return;
        mainImg.src = full;
        thumbs.forEach((b) => b.classList.toggle('is-active', b === btn));
      });
    });

    window.maSetActiveThumb = function (src) {
      if (!src) return;
      thumbs.forEach((b) => b.classList.toggle('is-active', b.dataset.full === src));
    };
  });
})();

/* Variant picker — swaps hidden id, price, and featured image when a
   color swatch is clicked or a non-color option dropdown changes. */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const dataEl = document.querySelector('[data-product-json]');
    const form = document.querySelector('.product-info form');
    if (!dataEl || !form) return;

    let data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!data.variants || !data.options) return;

    const hiddenId = form.querySelector('input[name="id"]');
    const priceEl = document.querySelector('.product-price');
    const mediaImg = document.querySelector('[data-main-image]');
    const addBtn = form.querySelector('.product-add');
    if (!hiddenId) return;

    const selected = {};
    data.options.forEach((name) => {
      const sel = form.querySelector(`select[name="options[${name}]"]`);
      const active = form.querySelector(`.swatch.is-active[data-option-name="${name}"]`);
      if (active) selected[name] = active.dataset.value;
      else if (sel) selected[name] = sel.value;
    });

    function formatMoney(cents) {
      const fmt = data.money_format || '{{amount}}';
      const intPart = Math.floor(cents / 100);
      const decPart = String(cents % 100).padStart(2, '0');
      return fmt
        .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, intPart.toLocaleString('ro-RO'))
        .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, `${intPart.toLocaleString('ro-RO')},${decPart}`)
        .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, String(intPart))
        .replace(/\{\{\s*amount\s*\}\}/g, `${intPart}.${decPart}`);
    }

    function findVariant() {
      return data.variants.find((v) =>
        data.options.every((name, idx) => v.options[idx] === selected[name])
      );
    }

    function update() {
      const variant = findVariant();
      if (!variant) return;
      hiddenId.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price);
      if (mediaImg && variant.featured_image) {
        mediaImg.src = variant.featured_image;
        if (typeof window.maSetActiveThumb === 'function') window.maSetActiveThumb(variant.featured_image);
      }
      if (addBtn) {
        addBtn.disabled = !variant.available;
      }
    }

    form.querySelectorAll('.swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        const optName = btn.dataset.optionName;
        const val = btn.dataset.value;
        if (!optName) return;
        selected[optName] = val;
        form.querySelectorAll(`.swatch[data-option-name="${optName}"]`).forEach((b) => {
          const isMe = b === btn;
          b.classList.toggle('is-active', isMe);
          b.setAttribute('aria-checked', isMe ? 'true' : 'false');
        });
        update();
      });
    });

    form.querySelectorAll('select[name^="options["]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const m = sel.name.match(/^options\[(.+)\]$/);
        if (!m) return;
        selected[m[1]] = sel.value;
        update();
      });
    });
  });
})();
