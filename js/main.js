/* ── Nav: scroll state ─────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile burger ─────────────────────────────────────── */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  const open = navLinks.classList.contains('open');
  spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
  spans[1].style.opacity   = open ? '0' : '1';
  spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

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

/* ── CurvedLoop ────────────────────────────────────────── */
new CurvedLoop(document.getElementById('curvedLoopWrap'), {
  text        : 'BRANDING ✦ CONTENT ✦ ANIMATION ✦ SOCIAL MEDIA ✦ MARKETING ✦ AD PRODUCTION ✦',
  speed       : 1.2,
  curveAmount : 280,
  direction   : 'left',
});

/* ── MagnetLines (hero decoration) ────────────────────── */
new MagnetLines(document.getElementById('magnetLinesHero'), {
  rows          : 7,
  columns       : 7,
  lineColor     : '#d4a853',
  lineWidth     : '1.5px',
  lineHeight    : '22px',
  baseAngle     : 0,
  containerSize : '260px',
});

/* ── Contact form ──────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = _lang === 'hi' ? 'भेज रहे हैं…' : 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = _lang === 'hi' ? 'संदेश भेजा ✓' : 'Message Sent ✓';
    this.reset();
    setTimeout(() => {
      btn.textContent = i18n[_lang].ctaSubmit;
      btn.disabled = false;
    }, 3000);
  }, 1200);
});

/* ── Language Toggle ───────────────────────────────────── */
const i18n = {
  en: {
    navServices: 'Services', navIndustries: 'Industries', navWork: 'Work',
    navDelhi: 'Relive Delhi', navCta: "Let's Talk",
    heroEyebrow: 'Delhi-based Creative Agency',
    heroTagline: '<span class="hero__tagline-hindi">कलाकार बनो, मिस्त्री नहीं</span> <em>— Be an Artist, Not a Laborer</em>',
    heroCta1: 'See Our Work', heroCta2: 'Get In Touch',
    svcLabel: 'What We Do',    svcTitle: 'Our Services',
    svc1: 'Ad Production',          svc1d: 'High-impact ad creatives that stop the scroll and drive action.',
    svc2: 'Social Media Management',svc2d: 'Strategy, scheduling, and community building across all platforms.',
    svc3: 'Scripting',              svc3d: 'Compelling scripts for reels, ads, and video content that convert.',
    svc4: 'Content Production',     svc4d: 'End-to-end content creation — photography, video, and more.',
    svc5: 'Graphic Designing',      svc5d: 'Visual identities and assets that make your brand unforgettable.',
    svc6: 'Branding & Animation',   svc6d: 'Motion graphics and brand systems that bring your story to life.',
    svc7: 'Performance Marketing',  svc7d: 'Data-driven campaigns optimised for measurable ROI.',
    indLabel: 'Where We Excel', indTitle: 'Industries We Serve',
    portLabel: 'Our Work',
    ctaLabel: 'Say Hello',
    ctaTitle: "Let's build something<br /><span>amazing together.</span>",
    ctaSubmit: 'Send Message →',
    placeName: 'Your Name', placeEmail: 'Email Address',
    placeService: 'Service Interested In', placeMsg: 'Tell us about your project',
  },
  hi: {
    navServices: 'सेवाएं', navIndustries: 'उद्योग', navWork: 'काम',
    navDelhi: 'दिल्ली जियो', navCta: 'बात करें',
    heroEyebrow: 'दिल्ली की क्रिएटिव एजेंसी',
    heroTagline: '<span class="hero__tagline-hindi">कलाकार बनो, मिस्त्री नहीं</span> <em>— एक कलाकार बनो, मजदूर नहीं</em>',
    heroCta1: 'काम देखें', heroCta2: 'संपर्क करें',
    svcLabel: 'हम क्या करते हैं', svcTitle: 'हमारी सेवाएं',
    svc1: 'ऐड प्रोडक्शन',           svc1d: 'हाई-इम्पैक्ट क्रिएटिव जो स्क्रॉल रोकें।',
    svc2: 'सोशल मीडिया मैनेजमेंट',  svc2d: 'सभी प्लेटफॉर्म पर स्ट्रैटेजी और कम्युनिटी।',
    svc3: 'स्क्रिप्टिंग',            svc3d: 'रील और ऐड्स के लिए जबरदस्त स्क्रिप्ट।',
    svc4: 'कंटेंट प्रोडक्शन',        svc4d: 'फोटोग्राफी और वीडियो — एंड-टू-एंड।',
    svc5: 'ग्राफिक डिज़ाइनिंग',      svc5d: 'विज़ुअल आइडेंटिटी जो ब्रांड को यादगार बनाए।',
    svc6: 'ब्रांडिंग और एनिमेशन',    svc6d: 'मोशन ग्राफिक्स जो कहानी जीवंत करें।',
    svc7: 'परफॉर्मेंस मार्केटिंग',   svc7d: 'मापने योग्य ROI के लिए डेटा-ड्रिवन कैंपेन।',
    indLabel: 'हम कहाँ माहिर हैं', indTitle: 'हमारी इंडस्ट्री',
    portLabel: 'हमारा काम',
    ctaLabel: 'हेलो बोलो',
    ctaTitle: 'साथ मिलकर कुछ<br /><span>जबरदस्त बनाते हैं।</span>',
    ctaSubmit: 'संदेश भेजें →',
    placeName: 'आपका नाम', placeEmail: 'ईमेल पता',
    placeService: 'सेवा चुनें', placeMsg: 'अपना प्रोजेक्ट बताएं',
  }
};

const _indItems = {
  en: ['Food & Beverage', 'Fashion', 'FMCG', 'Restaurants', 'Jewellery', 'Beauty & Lifestyle', 'Finance'],
  hi: ['खाद्य और पेय', 'फैशन', 'एफएमसीजी', 'रेस्तरां', 'जेवलरी', 'ब्यूटी और लाइफस्टाइल', 'फाइनेंस'],
};

let _lang = localStorage.getItem('kk_lang') || 'en';
const langToggle = document.getElementById('langToggle');

function applyLang(lang) {
  const t = i18n[lang];

  /* static text nodes */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (t[k] !== undefined) el.textContent = t[k];
  });

  /* innerHTML nodes (contain nested tags) */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const k = el.dataset.i18nHtml;
    if (t[k] !== undefined) el.innerHTML = t[k];
  });

  /* input / textarea placeholders */
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const k = el.dataset.i18nPlaceholder;
    if (t[k] !== undefined) el.placeholder = t[k];
  });

  /* re-init TextPressure */
  const hp = document.getElementById('heroPressure');
  if (hp) {
    hp.innerHTML = '';
    new TextPressure(hp, {
      text        : lang === 'hi' ? 'नमस्ते! हम हैं' : "Hi! We're",
      flex        : true,
      width       : true,
      weight      : true,
      italic      : true,
      alpha       : false,
      stroke      : false,
      textColor   : '#f0ece4',
      strokeColor : '#d4a853',
      minFontSize : 28,
    });
  }

  /* re-init AnimatedList */
  const indList = document.getElementById('industriesList');
  if (indList) {
    indList.innerHTML = '';
    new AnimatedList(indList, {
      items                : _indItems[lang],
      showGradients        : true,
      enableArrowNavigation: true,
      displayScrollbar     : false,
      onItemSelect         : (item) => console.log('Selected:', item),
    });
  }

  /* re-init TrueFocus */
  const tfWrap = document.getElementById('trueFocusWrap');
  if (tfWrap) {
    tfWrap.innerHTML = '';
    new TrueFocus(tfWrap, {
      sentence              : lang === 'hi' ? 'जिन ब्रांड्स के साथ काम किया' : "Brands We've Worked With",
      separator             : ' ',
      blurAmount            : 6,
      borderColor           : '#d4a853',
      glowColor             : 'rgba(212,168,83,0.55)',
      animationDuration     : 0.5,
      pauseBetweenAnimations: 2,
    });
  }

  /* toggle button label */
  langToggle.textContent = lang === 'hi' ? 'EN' : 'हि';
  langToggle.title       = lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें';

  _lang = lang;
  localStorage.setItem('kk_lang', lang);
  document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
}

langToggle.addEventListener('click', () => applyLang(_lang === 'en' ? 'hi' : 'en'));

/* apply saved / default language on load */
applyLang(_lang);
