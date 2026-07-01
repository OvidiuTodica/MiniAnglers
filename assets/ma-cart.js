/* MiniAnglers cart — remove a line item instantly via the Ajax Cart API,
   no full page reload. Falls back to a normal navigation to /cart if the
   request fails, so the cart state is never left stale. */
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

    cartRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-remove]');
      if (!btn) return;

      const line = parseInt(btn.dataset.cartRemove, 10);
      const row = btn.closest('[data-cart-row]');
      btn.disabled = true;

      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ line, quantity: 0 })
      })
        .then((res) => { if (!res.ok) throw new Error('cart change failed'); return res.json(); })
        .then((cart) => {
          if (row) row.remove();

          const subtotalEl = cartRoot.querySelector('[data-cart-subtotal]');
          if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price, moneyFormat);

          const countEl = document.getElementById('cartCount');
          if (countEl) countEl.textContent = cart.item_count;

          if (cart.item_count === 0) window.location.reload();
        })
        .catch(() => { window.location.href = '/cart'; });
    });
  });
})();
