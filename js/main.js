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

/* ── TextPressure hero ─────────────────────────────────── */
new TextPressure(document.getElementById('heroPressure'), {
  text        : "Hi! We're",
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

/* ── Animated Industries List ──────────────────────────── */
new AnimatedList(document.getElementById('industriesList'), {
  items: ['Food & Beverage', 'Fashion', 'FMCG', 'Restaurants', 'Jewellery', 'Beauty & Lifestyle', 'Finance'],
  showGradients: true,
  enableArrowNavigation: true,
  displayScrollbar: false,
  onItemSelect: (item) => console.log('Selected:', item),
});

/* ── CurvedLoop ────────────────────────────────────────── */
new CurvedLoop(document.getElementById('curvedLoopWrap'), {
  text        : 'BRANDING ✦ CONTENT ✦ ANIMATION ✦ SOCIAL MEDIA ✦ MARKETING ✦ AD PRODUCTION ✦',
  speed       : 1.2,
  curveAmount : 280,
  direction   : 'left',
});

/* ── TrueFocus (work section) ──────────────────────────── */
new TrueFocus(document.getElementById('trueFocusWrap'), {
  sentence              : 'Brands We\'ve Worked With',
  separator             : ' ',
  blurAmount            : 6,
  borderColor           : '#d4a853',
  glowColor             : 'rgba(212,168,83,0.55)',
  animationDuration     : 0.5,
  pauseBetweenAnimations: 2,
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
