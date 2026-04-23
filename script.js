(function () {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const STORAGE_KEY = 'p.theme';

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
  }

  function currentSystem() {
    return mq.matches ? 'dark' : 'light';
  }

  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    applyTheme(stored || currentSystem());
  }

  init();

  mq.addEventListener('change', () => {
    if (!localStorage.getItem(STORAGE_KEY)) applyTheme(currentSystem());
  });

  const ICON_MOON = '<svg class="c-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const ICON_SUN  = '<svg class="c-icon-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';

  document.querySelectorAll('.c-theme-toggle').forEach((btn) => {
    btn.innerHTML = ICON_MOON + ICON_SUN;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  });

  document.addEventListener('click', (e) => {
    const r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
})();
