/* MagnetLines — grid of lines that rotate toward the cursor
   Vanilla JS port of react-bits MagnetLines */
class MagnetLines {
  constructor(container, options = {}) {
    this.rows          = options.rows          || 9;
    this.columns       = options.columns       || 9;
    this.lineColor     = options.lineColor     || '#d4a853';
    this.lineWidth     = options.lineWidth      || '2px';
    this.lineHeight    = options.lineHeight    || '30px';
    this.baseAngle     = options.baseAngle     !== undefined ? options.baseAngle : -10;
    this.containerSize = options.containerSize || '80vmin';

    this._pendingRAF = null;
    this._build(container);
    this._bindEvents();
    this._initDefault();
  }

  _build(container) {
    this.el = container;
    this.el.classList.add('magnetLines-container');
    this.el.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
    this.el.style.gridTemplateRows    = `repeat(${this.rows}, 1fr)`;
    this.el.style.width  = this.containerSize;
    this.el.style.height = this.containerSize;

    this._spans = Array.from({ length: this.rows * this.columns }, () => {
      const span = document.createElement('span');
      span.style.setProperty('--rotate', `${this.baseAngle}deg`);
      span.style.backgroundColor = this.lineColor;
      span.style.width  = this.lineWidth;
      span.style.height = this.lineHeight;
      this.el.appendChild(span);
      return span;
    });
  }

  _rotate(clientX, clientY) {
    this._spans.forEach(span => {
      const rect = span.getBoundingClientRect();
      const cx = rect.x + rect.width  / 2;
      const cy = rect.y + rect.height / 2;
      const b  = clientX - cx;
      const a  = clientY - cy;
      const c  = Math.sqrt(a * a + b * b) || 1;
      const r  = ((Math.acos(b / c) * 180) / Math.PI) * (clientY > cy ? 1 : -1);
      span.style.setProperty('--rotate', `${r}deg`);
    });
  }

  _bindEvents() {
    window.addEventListener('pointermove', e => {
      // Throttle: only queue one rAF at a time to prevent layout thrashing
      if (this._pendingRAF) return;
      this._pendingRAF = requestAnimationFrame(() => {
        this._pendingRAF = null;
        // Skip entirely if the container is off-screen
        const rect = this.el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        this._rotate(e.clientX, e.clientY);
      });
    }, { passive: true });
  }

  _initDefault() {
    // Point lines toward center initially, after layout
    requestAnimationFrame(() => {
      if (!this._spans.length) return;
      const mid  = this._spans[Math.floor(this._spans.length / 2)];
      const rect = mid.getBoundingClientRect();
      this._rotate(rect.x, rect.y);
    });
  }
}

