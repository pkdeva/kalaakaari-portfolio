/* ── Nav: scroll state ─────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Side Drawer (burger) ────────────────────────────────── */
(function () {
  const burger   = document.getElementById('burger');
  const drawer   = document.getElementById('sideDrawer');
  const closeBtn = document.getElementById('sideDrawerClose');
  const backdrop = document.getElementById('sideDrawerBackdrop');
  if (!burger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Animate burger → X
    const spans = burger.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    const spans = burger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '1';
    spans[2].style.transform = '';
  }

  burger.addEventListener('click', openDrawer);
  if (closeBtn)  closeBtn.addEventListener('click', closeDrawer);
  if (backdrop)  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // Close drawer when a link inside it is clicked
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
})();

/* ── Nav Dropdowns ───────────────────────────────────────── */
(function () {
  document.querySelectorAll('.nav__item--drop').forEach(item => {
    const btn = item.querySelector('.nav__drop-btn');
    if (!btn) return;

    // Desktop: hover
    item.addEventListener('mouseenter', () => item.classList.add('open'));
    item.addEventListener('mouseleave', () => item.classList.remove('open'));

    // Mobile / keyboard: click toggle
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.nav__item--drop.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav__item--drop')) {
      document.querySelectorAll('.nav__item--drop.open').forEach(i => i.classList.remove('open'));
    }
  });
})();

/* ── Scroll reveal ─────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('visible'), idx * 90);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── MagnetLines (hero decoration) ────────────────────── */
const _mlEl = document.getElementById('magnetLinesHero');
if (_mlEl) new MagnetLines(_mlEl, {
  rows          : 7,
  columns       : 7,
  lineColor     : '#C8912E',
  lineWidth     : '1.5px',
  lineHeight    : '22px',
  baseAngle     : 0,
  containerSize : '260px',
});

/* ── Custom Cursor ──────────────────────────────────────── */
(function () {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let rx = cx, ry = cy;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.classList.add('visible');
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));

  // Smooth lerp follow
  (function lerp() {
    rx += (cx - rx) * 0.14;
    ry += (cy - ry) * 0.14;
    cursor.style.left = rx + 'px';
    cursor.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  // Hover state on interactive elements
  const hoverSel = 'a, button, [role="button"], input, textarea, select, label, .bento-card, .service-row, .cl-name';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) cursor.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) cursor.classList.remove('hovering');
  });
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
})();

/* ── Stats Counter ──────────────────────────────────────── */
(function () {
  const nums = document.querySelectorAll('.stat-num');
  if (!nums.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const start = performance.now();
      const dur = 1400;
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target);
        if (p < 1) requestAnimationFrame(step);
      })(start);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(el => obs.observe(el));
})();

/* ── Hero Typewriter ────────────────────────────────────── */
(function () {
  const el = document.getElementById('heroTypewriter');
  if (!el) return;
  const phrases = [
    "We don't make ads. We make culture.",
    "Kala is the soul. Kaari is the fire.",
    "Bigger than the brief. Bolder than the budget.",
    "Delhi's most audacious creative collective.",
    "Art that bleeds. Work that lasts.",
    "Not an agency. A movement."
  ];
  let pi = 0, ci = 0, del = false;
  function tick() {
    const phrase = phrases[pi];
    if (!del) {
      ci++;
      el.textContent = phrase.slice(0, ci);
      if (ci === phrase.length) { del = true; setTimeout(tick, 2400); return; }
      setTimeout(tick, 44);
    } else {
      ci--;
      el.textContent = phrase.slice(0, ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 350); return; }
      setTimeout(tick, 20);
    }
  }
  setTimeout(tick, 900);
})();

/* ── Theme Toggle ───────────────────────────────────────── */
(function () {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('kk-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('kk-theme', next);
    });
  }
})();

/* ── Language Toggle ─────────────────────────────────────── */
(function () {
  const langToggle = document.getElementById('langToggle');
  let currentLang = 'en';

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-en][data-hi]').forEach(el => {
      if (el.children.length > 0) return; // skip elements with child nodes
      el.textContent = lang === 'hi' ? el.dataset.hi : el.dataset.en;
    });
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'hi' : 'en');
    });
  }

  const drawerLangToggle = document.getElementById('drawerLangToggle');
  if (drawerLangToggle) {
    drawerLangToggle.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'hi' : 'en');
    });
  }
})();

/* ── Brand Etymology Panel ───────────────────────────────── */
(function () {
  const logoBtn    = document.getElementById('brandLogoBtn');
  const panel      = document.getElementById('brandPanel');
  const closeBtn   = document.getElementById('brandPanelClose');
  const backdrop   = document.getElementById('brandPanelBackdrop');

  function open() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (logoBtn)  logoBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── Contact form ──────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Message Sent ✓';
    this.reset();
    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
    }, 3000);
  }, 1200);
});

const _indItems = ['Food & Beverage', 'Fashion', 'FMCG', 'Restaurants', 'Jewellery', 'Beauty & Lifestyle', 'Finance'];

/* ── FAQ Accordion ──────────────────────────────────────── */
(function () {
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__a');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.closest('.faq__item').querySelector('.faq__a').hidden = true;
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      answer.hidden = isOpen;
    });
  });
})();

/* ── FlowingMenu — Services ─────────────────────────────── */
(function () {
  const container = document.getElementById('flowingMenuServices');
  if (!container || typeof gsap === 'undefined') return;

  const services = [
    { num: '01', text: 'Ad Production',          sub: 'Ads that arrest. Frames that convert.',              imgBg: 'linear-gradient(135deg,#6b0f0f 0%,#c04848 100%)' },
    { num: '02', text: 'Social Media',            sub: 'Build tribes. Not just followers.',                  imgBg: 'linear-gradient(135deg,#1a0a4a 0%,#6d28d9 100%)' },
    { num: '03', text: 'Scripting',               sub: 'Words built on truth, tension, and perfect pauses.', imgBg: 'linear-gradient(135deg,#5c3100 0%,#c8912e 100%)' },
    { num: '04', text: 'Content Production',      sub: 'Raw, cinematic, relentlessly real.',                 imgBg: 'linear-gradient(135deg,#033a25 0%,#059669 100%)' },
    { num: '05', text: 'Graphic Designing',       sub: 'Purposeful. Every pixel earns its place.',          imgBg: 'linear-gradient(135deg,#5c0a2f 0%,#db2777 100%)' },
    { num: '06', text: 'Branding & Animation',    sub: 'Logos that move. Systems that scale.',              imgBg: 'linear-gradient(135deg,#0c2340 0%,#2563eb 100%)' },
    { num: '07', text: 'Performance Marketing',   sub: 'Data meets craft. Every rupee working harder.',     imgBg: 'linear-gradient(135deg,#4a2700 0%,#f59e0b 100%)' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'fm-nav';
  container.appendChild(nav);

  services.forEach(({ num, text, sub, imgBg }) => {
    const item = document.createElement('div');
    item.className = 'fm-item';

    const link = document.createElement('a');
    link.className = 'fm-item__link';
    link.href = '#contact';
    link.innerHTML =
      `<span class="fm-item__num">${num}</span>` +
      `<span class="fm-item__text">${text}</span>` +
      `<span class="fm-item__sub">${sub}</span>` +
      `<span class="fm-item__arrow">→</span>`;

    const marquee = document.createElement('div');
    marquee.className = 'fm-marquee';

    const inner = document.createElement('div');
    inner.className = 'fm-marquee__inner';
    inner.setAttribute('aria-hidden', 'true');
    marquee.appendChild(inner);

    item.appendChild(link);
    item.appendChild(marquee);
    nav.appendChild(item);

    // Build repeating marquee parts after layout paint
    setTimeout(() => {
      const makePart = () => {
        const p = document.createElement('div');
        p.className = 'fm-part';
        p.innerHTML =
          `<span>${text}</span>` +
          `<div class="fm-part__img" style="background:${imgBg}"></div>`;
        return p;
      };

      const seed = makePart();
      inner.appendChild(seed);

      const cw = seed.offsetWidth || 300;
      const needed = Math.max(4, Math.ceil(window.innerWidth / cw) + 2);
      for (let i = 1; i < needed; i++) inner.appendChild(makePart());

      // Continuous GSAP loop
      gsap.to(inner, { x: -cw, duration: 14, ease: 'none', repeat: -1 });

      // Edge detection helper
      function edge(ev) {
        const r = item.getBoundingClientRect();
        const mx = ev.clientX - r.left;
        const my = ev.clientY - r.top;
        const dT = (mx - r.width / 2) ** 2 + my ** 2;
        const dB = (mx - r.width / 2) ** 2 + (my - r.height) ** 2;
        return dT < dB ? 'top' : 'bottom';
      }

      const def = { duration: 0.55, ease: 'power3.out' };

      item.addEventListener('mouseenter', ev => {
        const e = edge(ev);
        gsap.timeline({ defaults: def })
          .set(marquee, { y: e === 'top' ? '-101%' : '101%' }, 0)
          .set(inner,   { y: e === 'top' ?  '101%' : '-101%' }, 0)
          .to([marquee, inner], { y: '0%' }, 0);
      });

      item.addEventListener('mouseleave', ev => {
        const e = edge(ev);
        gsap.timeline({ defaults: def })
          .to(marquee, { y: e === 'top' ? '-101%' : '101%' }, 0)
          .to(inner,   { y: e === 'top' ?  '101%' : '-101%' }, 0);
      });
    }, 80);
  });
})();

/* ── Init Components (Static English) ──────────────────── */

/* TextPressure */
const hp = document.getElementById('heroPressure');
if (hp) {
  new TextPressure(hp, {
    text        : "We Are",
    flex        : true,
    width       : true,
    weight      : true,
    italic      : true,
    alpha       : false,
    stroke      : false,
    textColor   : '#F5F2EB', 
    strokeColor : '#C04848',
    minFontSize : 28,
  });
}

/* AnimatedList */
const indList = document.getElementById('industriesList');
if (indList) {
  new AnimatedList(indList, {
    items                : _indItems,
    showGradients        : true,
    enableArrowNavigation: true,
    displayScrollbar     : false,
    onItemSelect         : (item) => console.log('Selected:', item),
  });
}

/* TrueFocus */
const tfWrap = document.getElementById('trueFocusWrap');
if (tfWrap) {
  new TrueFocus(tfWrap, {
    sentence              : "Brands We've Worked With",
    separator             : ' ',
    blurAmount            : 6,
    borderColor           : '#C8912E',
    glowColor             : 'rgba(200,145,46,0.55)',
    animationDuration     : 0.5,
    pauseBetweenAnimations: 2,
  });
}

/* ── Smooth Scroll (Lenis) ──────────────────────────────── */
(function() {
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
})();

/* ── Magnetic Floating Buttons ──────────────────────────── */
(function() {
  const magnets = document.querySelectorAll('.float-btn');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.1)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();
