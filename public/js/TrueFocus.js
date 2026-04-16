/* TrueFocus — animated word-by-word blur/focus
   Vanilla JS port of react-bits TrueFocus (no Framer Motion dependency) */
class TrueFocus {
  constructor(container, options = {}) {
    this.words              = (options.sentence || 'Our Work Portfolio').split(options.separator || ' ');
    this.blurAmount         = options.blurAmount         !== undefined ? options.blurAmount : 5;
    this.borderColor        = options.borderColor        || '#d4a853';
    this.glowColor          = options.glowColor          || 'rgba(212,168,83,0.6)';
    this.animationDuration  = options.animationDuration  !== undefined ? options.animationDuration : 0.5;
    this.pauseBetween       = options.pauseBetweenAnimations !== undefined ? options.pauseBetweenAnimations : 1.5;
    this.manualMode         = options.manualMode         || false;

    this._currentIndex = 0;
    this._build(container);
  }

  _build(container) {
    this.el = document.createElement('div');
    this.el.className = 'focus-container';

    this._wordEls = this.words.map((word, i) => {
      const span = document.createElement('span');
      span.className = 'focus-word';
      span.textContent = word;
      span.style.filter     = `blur(${this.blurAmount}px)`;
      span.style.transition = `filter ${this.animationDuration}s ease`;
      span.style.setProperty('--border-color', this.borderColor);
      span.style.setProperty('--glow-color',   this.glowColor);

      if (this.manualMode) {
        span.addEventListener('mouseenter', () => this._setFocus(i));
        span.addEventListener('mouseleave', () => this._setFocus(this._lastActive || 0));
      }

      this.el.appendChild(span);
      return span;
    });

    // Focus frame (no Framer Motion — CSS transition on left/top/width/height)
    this._frame = document.createElement('div');
    this._frame.className = 'focus-frame';
    this._frame.style.transition = `left ${this.animationDuration}s ease,
      top ${this.animationDuration}s ease,
      width ${this.animationDuration}s ease,
      height ${this.animationDuration}s ease,
      opacity ${this.animationDuration}s ease`;
    this._frame.style.opacity = '0';
    this._frame.style.setProperty('--border-color', this.borderColor);
    this._frame.style.setProperty('--glow-color',   this.glowColor);
    this._frame.innerHTML = `
      <span class="corner top-left"></span>
      <span class="corner top-right"></span>
      <span class="corner bottom-left"></span>
      <span class="corner bottom-right"></span>`;
    this.el.appendChild(this._frame);

    container.innerHTML = '';
    container.appendChild(this.el);

    // Start after layout settles
    if (!this.manualMode) {
      setTimeout(() => {
        this._setFocus(0);
        this._interval = setInterval(() => {
          this._currentIndex = (this._currentIndex + 1) % this.words.length;
          this._setFocus(this._currentIndex);
        }, (this.animationDuration + this.pauseBetween) * 1000);
      }, 200);
    }
  }

  _setFocus(index) {
    this._lastActive = index;

    this._wordEls.forEach((el, i) => {
      el.style.filter = i === index ? 'blur(0px)' : `blur(${this.blurAmount}px)`;
    });

    const containerRect = this.el.getBoundingClientRect();
    const activeRect    = this._wordEls[index].getBoundingClientRect();

    this._frame.style.opacity = '1';
    this._frame.style.left    = (activeRect.left - containerRect.left) + 'px';
    this._frame.style.top     = (activeRect.top  - containerRect.top)  + 'px';
    this._frame.style.width   = activeRect.width  + 'px';
    this._frame.style.height  = activeRect.height + 'px';
  }

  destroy() {
    if (this._interval) clearInterval(this._interval);
  }
}
