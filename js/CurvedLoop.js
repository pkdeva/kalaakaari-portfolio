/* CurvedLoop — SVG text marquee along a quadratic bezier curve
   Vanilla JS port of react-bits CurvedLoop */
class CurvedLoop {
  constructor(container, options = {}) {
    this.text        = (options.text || 'KALAAKAARI ✦ ') + '\u00A0';
    this.speed       = options.speed       || 1.5;
    this.curveAmount = options.curveAmount || 300;
    this.direction   = options.direction   || 'left';
    this.className   = options.className   || 'curved-loop-text';

    this._uid    = Math.random().toString(36).slice(2);
    this._pathId = 'curve-' + this._uid;
    this._offset  = 0;
    this._spacing = 0;

    this._build(container);
    // Delay one frame so the SVG is in the DOM and can be measured
    requestAnimationFrame(() => this._init());
  }

  _build(container) {
    const pathD = `M-100,40 Q500,${40 + this.curveAmount} 1540,40`;
    const ns = 'http://www.w3.org/2000/svg';

    this.svg = document.createElementNS(ns, 'svg');
    this.svg.setAttribute('class', 'curved-loop-svg');
    this.svg.setAttribute('viewBox', `0 0 1440 ${this.curveAmount + 60}`);
    this.svg.style.visibility = 'hidden';

    // Hidden measure element
    this._measure = document.createElementNS(ns, 'text');
    this._measure.setAttribute('xml:space', 'preserve');
    this._measure.setAttribute('class', this.className);
    this._measure.style.cssText = 'visibility:hidden;opacity:0;pointer-events:none;';
    this._measure.textContent = this.text;

    // Path definition
    const defs = document.createElementNS(ns, 'defs');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('id', this._pathId);
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'transparent');
    defs.appendChild(path);

    // Animated text on path
    this._textEl = document.createElementNS(ns, 'text');
    this._textEl.setAttribute('font-weight', 'bold');
    this._textEl.setAttribute('xml:space', 'preserve');
    this._textEl.setAttribute('class', this.className);

    this._textPath = document.createElementNS(ns, 'textPath');
    this._textPath.setAttribute('href', '#' + this._pathId);
    this._textPath.setAttribute('xml:space', 'preserve');
    this._textEl.appendChild(this._textPath);

    this.svg.appendChild(this._measure);
    this.svg.appendChild(defs);
    this.svg.appendChild(this._textEl);

    container.innerHTML = '';
    container.classList.add('curved-loop-jacket');
    container.appendChild(this.svg);
  }

  _init() {
    this._spacing = this._measure.getComputedTextLength();
    if (!this._spacing) {
      requestAnimationFrame(() => this._init());
      return;
    }
    const copies = Math.ceil(1800 / this._spacing) + 2;
    this._textPath.textContent = Array(copies).fill(this.text).join('');
    this._offset = -this._spacing;
    this._textPath.setAttribute('startOffset', this._offset + 'px');
    this.svg.style.visibility = 'visible';
    this._animate();
  }

  _animate() {
    const step = () => {
      const delta = this.direction === 'right' ? this.speed : -this.speed;
      this._offset += delta;
      if (this._offset <= -this._spacing) this._offset += this._spacing;
      if (this._offset > 0)               this._offset -= this._spacing;
      this._textPath.setAttribute('startOffset', this._offset + 'px');
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
