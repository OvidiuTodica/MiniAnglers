/* MiniAnglers cart — remove a line, or change its quantity, instantly via
   the Ajax Cart API (/cart/change.js), no full page reload and no
   "Actualizează" button to click. Falls back to a normal navigation to
   /cart if a request fails, so the cart state is never left stale.
   Lines are addressed by their stable key (data-key on the row, the Ajax
   Cart API's line item id: variant + properties hash) rather than by
   position — a position shifts as soon as an earlier line is removed. */
(function () {
  function formatMoney(cents, moneyFormat) {
    const fmt = moneyFormat || '{{amount}}';
    const intPart = Math.floor(cents / 100);
    const decPart = String(cents % 100).padStart(2, '0');
    return fmt
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, intPart.toLocaleString('ro-RO'))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, `${intPart.toLocaleString('ro-RO')},${decPart}`)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, String(intPart))
      .replace(/\{\{\s*amount\s*\}\}/g, `${intPart}.${decPart}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const cartRoot = document.querySelector('[data-cart-root]');
    if (!cartRoot) return;
    const moneyFormat = cartRoot.dataset.moneyFormat;
    const qtyTimers = new WeakMap(); // input -> debounce timeout
    const qtyTokens = new WeakMap(); // row -> latest request token, so a slow response can't clobber a newer one

    function applyCartTotals(cart) {
      const subtotalEl = cartRoot.querySelector('[data-cart-subtotal]');
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price, moneyFormat);
      const countEl = document.getElementById('cartCount');
      if (countEl) countEl.textContent = cart.item_count;
      if (cart.item_count === 0) window.location.reload();
    }

    function dropStaleNudge() {
      // the "you have N of the set's pieces" nudge is counted server-side from the
      // cart it was rendered with — simplest to drop it than show it out of date
      const nudge = cartRoot.querySelector('[data-offer-nudge]');
      if (nudge) nudge.remove();
    }

    function changeLine(key, quantity) {
      return fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: key, quantity })
      }).then((res) => { if (!res.ok) throw new Error('cart change failed'); return res.json(); });
    }

    cartRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-remove]');
      if (!btn) return;
      const row = btn.closest('[data-cart-row]');
      if (!row) return;
      btn.disabled = true;

      changeLine(row.dataset.key, 0)
        .then((cart) => {
          row.remove();
          dropStaleNudge();
          applyCartTotals(cart);
        })
        .catch(() => { window.location.href = '/cart'; });
    });

    function runQtyUpdate(input) {
      const row = input.closest('[data-cart-row]');
      if (!row) return;

      let quantity = parseInt(input.value, 10);
      if (isNaN(quantity) || quantity < 0) quantity = 0;
      input.value = quantity;

      const token = {};
      qtyTokens.set(row, token);
      row.classList.add('is-updating');

      changeLine(row.dataset.key, quantity)
        .then((cart) => {
          if (qtyTokens.get(row) !== token) return; // a newer edit on this row already landed
          dropStaleNudge();

          if (quantity === 0) {
            row.remove();
          } else {
            row.classList.remove('is-updating');
            const item = cart.items.find((it) => it.key === row.dataset.key);
            const lineTotal = item ? item.final_line_price : 0;
            const priceEl = row.querySelector('[data-cart-line-price]');
            if (priceEl) priceEl.textContent = formatMoney(lineTotal, moneyFormat);
            const wasEl = row.querySelector('[data-cart-was]');
            if (wasEl) {
              const compareUnit = parseInt(row.dataset.compareUnit || '0', 10);
              const compareTotal = compareUnit * quantity;
              const onSale = compareUnit > 0 && compareTotal > lineTotal;
              wasEl.hidden = !onSale;
              wasEl.textContent = onSale ? formatMoney(compareTotal, moneyFormat) : '';
            }
            if (item) input.value = item.quantity; // reflects a server-side clamp (e.g. limited stock)
          }

          applyCartTotals(cart);
        })
        .catch(() => { window.location.href = '/cart'; });
    }

    function scheduleQtyUpdate(input) {
      clearTimeout(qtyTimers.get(input));
      qtyTimers.set(input, setTimeout(() => runQtyUpdate(input), 450));
    }

    cartRoot.addEventListener('input', (e) => {
      const input = e.target.closest('[data-cart-qty]');
      if (input) scheduleQtyUpdate(input);
    });

    cartRoot.addEventListener('change', (e) => {
      // fires on blur, and immediately on a spinner-arrow click — apply right away
      const input = e.target.closest('[data-cart-qty]');
      if (!input) return;
      clearTimeout(qtyTimers.get(input));
      runQtyUpdate(input);
    });

    cartRoot.addEventListener('keydown', (e) => {
      // this is now the form's only submit-capable control left for Enter to reach —
      // without this it would submit straight to checkout instead of just saving the qty
      const input = e.target.closest('[data-cart-qty]');
      if (!input || e.key !== 'Enter') return;
      e.preventDefault();
      clearTimeout(qtyTimers.get(input));
      runQtyUpdate(input);
      input.blur();
    });
  });
})();
