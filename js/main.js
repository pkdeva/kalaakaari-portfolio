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
    borderColor           : '#C04848',
    glowColor             : 'rgba(192,72,72,0.55)',
    animationDuration     : 0.5,
    pauseBetweenAnimations: 2,
  });
}
