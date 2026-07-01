/* MiniAnglers configurator — progressive enhancement over the Liquid markup.
   Renders the box picker + live preview and adds the chosen box to the cart
   with the engraving captured as a line item property. Language-aware:
   dynamic strings come from window.maT (ma-i18n.js) and re-render on 'ma:lang'. */
(function () {
  const t = (k) => (typeof window.maT === 'function' ? window.maT(k) : k);

  function money(cents) {
    if (cents == null) return '';
    return '£' + (cents / 100).toFixed(2);
  }

  function initConfigurator(root) {
    let boxes;
    try { boxes = JSON.parse(root.dataset.boxes || '[]'); } catch (e) { boxes = []; }
    if (!boxes.length) return;

    const showPrice = root.dataset.showPrice === 'true';
    let sel = Math.min(Math.max(parseInt(root.dataset.default || '0', 10) || 0, 0), boxes.length - 1);
    let name = '';

    const form   = root.querySelector('[data-cfg-form]');
    const list   = root.querySelector('[data-cfg-list]');
    const boxEl  = root.querySelector('[data-cfg-box]');
    const etchEl = root.querySelector('[data-cfg-etch]');
    const pickEl = root.querySelector('[data-cfg-pick]');
    const input  = root.querySelector('[data-cfg-input]');
    const countEl= root.querySelector('[data-cfg-count]');
    const idEl   = root.querySelector('[data-cfg-id]');
    const addBtn = root.querySelector('[data-cfg-add]');
    const maxLen = parseInt(root.dataset.max, 10) || (input ? parseInt(input.getAttribute('maxlength'), 10) : 16) || 16;

    function renderList() {
      list.innerHTML = boxes.map((b, i) => `
        <button class="prod-opt ${i === sel ? 'on' : ''}" data-i="${i}" type="button">
          <span class="po-dot"></span>
          <span class="po-text">
            <span class="po-title">${b.title}</span>
            <span class="po-meta">${b.bays} ${t('config.compartments')} · ${b.finish}</span>
          </span>
          ${showPrice && b.price ? `<span class="po-price">${money(b.price)}</span>` : ''}
        </button>`).join('');
      list.querySelectorAll('.prod-opt').forEach(el =>
        el.addEventListener('click', () => { sel = +el.dataset.i; render(); }));
    }

    function renderPreview() {
      const b = boxes[sel];
      const finishClass = b.finish === 'Carbon' ? 'carbon' : b.finish === 'Steel' ? 'steel' : '';
      boxEl.className = 'cfg-box ' + finishClass;
      boxEl.style.gridTemplateColumns = `repeat(${b.cols}, var(--bay-size, 48px))`;
      boxEl.innerHTML = Array.from({ length: +b.bays || 0 }).map(() => '<div class="bay"></div>').join('');
      etchEl.textContent = name.trim() ? name.toUpperCase() : t('config.namehere');
      etchEl.style.color = b.finish === 'Steel' ? 'var(--bg-1)' : 'var(--steel-300)';
      pickEl.textContent = b.title + (name.trim() ? ' · ' + name.toUpperCase() : '');
      if (idEl) idEl.value = b.variantId || '';
    }

    function updateCount() {
      if (countEl) countEl.textContent = `${name.length}/${maxLen} ${t('config.chars')}`;
    }

    function render() { renderList(); renderPreview(); updateCount(); }

    if (input) {
      input.addEventListener('input', e => {
        name = e.target.value;
        updateCount();
        renderPreview();
      });
    }

    // Re-render dynamic strings when the language toggles.
    document.addEventListener('ma:lang', render);

    if (form) {
      form.addEventListener('submit', async (e) => {
        const b = boxes[sel];
        if (!b.variantId) {
          e.preventDefault();
          const c = document.getElementById('cartCount');
          if (c) c.textContent = (parseInt(c.textContent, 10) || 0) + 1;
          console.log('[MiniAnglers] preview add:', b.title, '| engraving:', name.toUpperCase() || '(none)');
          return;
        }
        e.preventDefault();
        addBtn.disabled = true;
        try {
          const body = { items: [{ id: b.variantId, quantity: 1, properties: name.trim() ? { Engraving: name.toUpperCase() } : {} }] };
          const res = await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('add failed');
          const cart = await fetch('/cart.js').then(r => r.json());
          const c = document.getElementById('cartCount');
          if (c) c.textContent = cart.item_count;
          window.location.href = '/cart';
        } catch (err) {
          addBtn.disabled = false;
          form.submit();
        }
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-configurator]').forEach(initConfigurator);
  });
})();
