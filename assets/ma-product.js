/* MiniAnglers product page — live engraving preview.
   Mirrors the typed name (uppercase) onto an etched plate + char counter.
   Language-aware via window.maT; re-renders on 'ma:lang'. */
(function () {
  const t = (k) => (typeof window.maT === 'function' ? window.maT(k) : k);

  function init(root) {
    const input = root.querySelector('[data-eng-input]');
    const etch  = root.querySelector('[data-eng-etch]');
    const count = root.querySelector('[data-eng-count]');
    const maxLen = parseInt(root.dataset.max, 10) || (input ? parseInt(input.getAttribute('maxlength'), 10) : 16) || 16;

    function render() {
      const name = (input && input.value || '').trim();
      if (etch) etch.textContent = name ? name.toUpperCase() : t('config.namehere');
      if (count) count.textContent = `${t('config.free')} · ${(input ? input.value.length : 0)}/${maxLen}`;
    }

    if (input) input.addEventListener('input', render);
    document.addEventListener('ma:lang', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-product-engrave]').forEach(init);
  });
})();
