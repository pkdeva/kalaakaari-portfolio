// Ported from https://codepen.io/JuanFuentes/full/rgXKGQ
// Variable font: Compressa VF by PreussType

class TextPressure {
  constructor(container, options = {}) {
    this.container   = container;
    this.text        = options.text        || 'Hello!';
    this.fontFamily  = options.fontFamily  || 'Compressa VF';
    this.fontUrl     = options.fontUrl     || 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2';
    this.width       = options.width       !== false;
    this.weight      = options.weight      !== false;
    this.italic      = options.italic      !== false;
    this.alpha       = options.alpha       || false;
    this.flex        = options.flex        !== false;
    this.stroke      = options.stroke      || false;
    this.textColor   = options.textColor   || '#ffffff';
    this.strokeColor = options.strokeColor || '#d4a853';
    this.minFontSize = options.minFontSize || 24;

    this.mouse  = { x: 0, y: 0 };
    this.cursor = { x: 0, y: 0 };
    this.spans  = [];
    this.rafId  = null;

    this._injectFont();
    this._render();
    this._setSize();
    this._bindEvents();
    this._animate();
  }

  _dist(a, b) {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  _getAttr(d, maxDist, minVal, maxVal) {
    return Math.max(minVal, maxVal - Math.abs((maxVal * d) / maxDist) + minVal);
  }

  _debounce(fn, delay) {
    let id;
    return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), delay); };
  }

  _injectFont() {
    if (document.getElementById('tp-font')) return;
    const s = document.createElement('style');
    s.id = 'tp-font';
    s.textContent = `@font-face{font-family:'${this.fontFamily}';src:url('${this.fontUrl}');font-style:normal;}`;
    document.head.appendChild(s);
  }

  _render() {
    this.container.innerHTML = '';
    Object.assign(this.container.style, {
      position: 'relative', width: '100%', height: '100%',
    });

    this.title = document.createElement('div');
    Object.assign(this.title.style, {
      fontFamily  : `'${this.fontFamily}', sans-serif`,
      textTransform: 'uppercase',
      fontSize    : `${this.minFontSize}px`,
      lineHeight  : '1',
      margin      : '0',
      userSelect  : 'none',
      whiteSpace  : 'nowrap',
      fontWeight  : '100',
      width       : '100%',
      color       : this.textColor,
      display     : this.flex ? 'flex' : 'block',
      justifyContent: this.flex ? 'space-between' : '',
    });

    if (this.stroke) this.title.classList.add('tp-stroke');

    this.spans = [...this.text].map(char => {
      const span = document.createElement('span');
      span.dataset.char = char;
      span.textContent  = char === ' ' ? '\u00A0' : char;
      Object.assign(span.style, { display: 'inline-block', color: this.textColor });
      this.title.appendChild(span);
      return span;
    });

    // Stroke pseudo-element via injected style
    if (this.stroke) {
      const st = document.createElement('style');
      st.id = 'tp-stroke';
      st.textContent = `
        .tp-stroke span{position:relative;color:${this.textColor};}
        .tp-stroke span::after{content:attr(data-char);position:absolute;left:0;top:0;
          color:transparent;z-index:-1;-webkit-text-stroke:3px ${this.strokeColor};}`;
      document.head.appendChild(st);
    }

    this.container.appendChild(this.title);
  }

  _setSize() {
    const { width: cw } = this.container.getBoundingClientRect();
    const size = Math.max(this.minFontSize, cw / (this.text.length / 2));
    this.title.style.fontSize = `${size}px`;

    // Seed mouse to center
    const r = this.container.getBoundingClientRect();
    this.mouse.x  = r.left + r.width / 2;
    this.mouse.y  = r.top  + r.height / 2;
    this.cursor.x = this.mouse.x;
    this.cursor.y = this.mouse.y;
  }

  _bindEvents() {
    const onMove  = e => { this.cursor.x = e.clientX; this.cursor.y = e.clientY; };
    const onTouch = e => { this.cursor.x = e.touches[0].clientX; this.cursor.y = e.touches[0].clientY; };
    const onResize = this._debounce(() => this._setSize(), 120);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('resize', onResize);
  }

  _animate() {
    this.mouse.x += (this.cursor.x - this.mouse.x) / 15;
    this.mouse.y += (this.cursor.y - this.mouse.y) / 15;

    const rect    = this.title.getBoundingClientRect();
    const maxDist = Math.max(rect.width / 2, 1);

    this.spans.forEach(span => {
      const sr = span.getBoundingClientRect();
      const d  = this._dist(this.mouse, { x: sr.x + sr.width / 2, y: sr.y + sr.height / 2 });

      const wdth  = this.width  ? Math.floor(this._getAttr(d, maxDist, 5,   200)) : 100;
      const wght  = this.weight ? Math.floor(this._getAttr(d, maxDist, 100, 900)) : 400;
      const ital  = this.italic ? this._getAttr(d, maxDist, 0, 1).toFixed(2)      : 0;
      const alpha = this.alpha  ? this._getAttr(d, maxDist, 0, 1).toFixed(2)      : 1;

      span.style.fontVariationSettings = `'wght' ${wght},'wdth' ${wdth},'ital' ${ital}`;
      if (this.alpha) span.style.opacity = alpha;
    });

    this.rafId = requestAnimationFrame(() => this._animate());
  }

  destroy() { cancelAnimationFrame(this.rafId); }
}
