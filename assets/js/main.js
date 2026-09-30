(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-nav]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav a').forEach(a => { if (a.getAttribute('href') === current) a.classList.add('active'); });

  if (header) {
    const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 52);
    syncHeader();
    window.addEventListener('scroll', syncHeader, {passive:true});
  }

  let scrollY = 0;
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) {
      scrollY = window.scrollY;
      body.classList.add('nav-open');
      body.style.top = `-${scrollY}px`;
      setTimeout(() => menu.querySelector('a')?.focus(), 40);
    } else {
      body.classList.remove('nav-open');
      body.style.top = '';
      window.scrollTo(0, scrollY);
      menuBtn.focus();
    }
  };
  menuBtn?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  closeBtn?.addEventListener('click', () => setMenu(false));
  menu?.addEventListener('click', e => { if (e.target.matches('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false); });

  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -5%'});
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  const seasonWrap = document.querySelector('[data-season-tabs]');
  if (seasonWrap && window.GYEOLDAM_DATA) {
    const image = document.querySelector('[data-season-image]');
    const title = document.querySelector('[data-season-title]');
    const items = document.querySelector('[data-season-items]');
    const note = document.querySelector('[data-season-note]');
    const buttons = [...seasonWrap.querySelectorAll('[role="tab"]')];
    const select = key => {
      const s = GYEOLDAM_DATA.seasons[key];
      if (!s) return;
      buttons.forEach(b => {
        const active = b.dataset.season === key;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
        b.tabIndex = active ? 0 : -1;
      });
      if (image) { image.classList.add('is-changing'); setTimeout(() => { image.src=s.image; image.alt=`${s.label} 계절 재료 이미지`; image.classList.remove('is-changing'); }, 180); }
      if (title) title.textContent = `${s.label} · ${s.year}`;
      if (items) items.textContent = s.items.join(' · ');
      if (note) note.textContent = s.note;
    };
    buttons.forEach((b,i) => {
      b.addEventListener('click', () => select(b.dataset.season));
      b.addEventListener('keydown', e => {
        if (!['ArrowRight','ArrowLeft'].includes(e.key)) return;
        e.preventDefault();
        const next = (i + (e.key==='ArrowRight'?1:-1) + buttons.length) % buttons.length;
        buttons[next].focus(); select(buttons[next].dataset.season);
      });
    });
  }

  const menuRows = [...document.querySelectorAll('[data-menu-row]')];
  const menuImg = document.querySelector('[data-menu-feature-image]');
  if (menuRows.length && menuImg) {
    const change = row => {
      menuRows.forEach(r => r.classList.toggle('is-active', r===row));
      const next = row.dataset.image;
      if (next && menuImg.src !== next) {
        menuImg.classList.add('is-changing');
        const pre = new Image(); pre.src = next;
        pre.onload = () => setTimeout(() => { menuImg.src=next; menuImg.alt=`${row.dataset.name} 메뉴 이미지`; menuImg.classList.remove('is-changing'); },120);
      }
    };
    menuRows.forEach(row => {
      row.addEventListener('mouseenter', () => change(row));
      row.addEventListener('focusin', () => change(row));
    });
    if ('IntersectionObserver' in window && innerWidth >= 1200) {
      const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) change(e.target); }), {threshold:.55});
      menuRows.forEach(r => obs.observe(r));
    }
  }

  document.querySelectorAll('[data-accordion-button]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  document.querySelectorAll('[data-fake-map]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector('[data-location-note]');
      if (target) { target.hidden=false; target.focus(); }
    });
  });

  const sticky = document.querySelector('[data-mobile-reservation]');
  const footer = document.querySelector('footer');
  if (sticky && footer && 'IntersectionObserver' in window) {
    const o = new IntersectionObserver(([e]) => sticky.classList.toggle('is-hidden', e.isIntersecting), {threshold:.05});
    o.observe(footer);
  }
})();
