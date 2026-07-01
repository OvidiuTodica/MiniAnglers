/* MiniAnglers product page — live engraving preview + paid add-on.
   Mirrors the typed name (uppercase) onto an etched plate + char counter.
   Engraving is a paid extra: when the section has a linked engraving
   product (data-eng-variant), submitting the form with engraving text
   adds a SECOND cart line for that product via the Ajax Cart API, so its
   price is charged alongside the main item. Without a linked product,
   the form submits normally (single item, no charge) — the price shown
   is a placeholder until a merchant links a real product in the theme
   editor (Theme settings → Engraving). */
(function () {
  const t = (k) => (typeof window.maT === 'function' ? window.maT(k) : k);

  function init(root) {
    const form  = root.closest('form');
    const input = root.querySelector('[data-eng-input]');
    const etch  = root.querySelector('[data-eng-etch]');
    const count = root.querySelector('[data-eng-count]');
    const maxLen = parseInt(root.dataset.max, 10) || (input ? parseInt(input.getAttribute('maxlength'), 10) : 16) || 16;
    const engVariantId = root.dataset.engVariant ? parseInt(root.dataset.engVariant, 10) : null;
    const cartUrl = root.dataset.cartUrl || '/cart';

    function render() {
      const name = (input && input.value || '').trim();
      if (etch) etch.textContent = name ? name.toUpperCase() : t('config.namehere');
      if (count) count.textContent = `${(input ? input.value.length : 0)}/${maxLen} ${t('config.chars')}`;
    }

    if (input) input.addEventListener('input', render);
    document.addEventListener('ma:lang', render);
    render();

    if (!form || !engVariantId) return; // no linked engraving product: normal single-item submit

    form.addEventListener('submit', function (e) {
      const name = (input && input.value || '').trim();
      if (!name) return; // no engraving requested: normal single-item submit

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
    const mediaImg = document.querySelector('.product-media img');
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
        mediaImg.alt = variant.featured_image && variant.featured_image.alt ? variant.featured_image.alt : mediaImg.alt;
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
