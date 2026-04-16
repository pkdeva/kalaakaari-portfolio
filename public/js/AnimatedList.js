class AnimatedList {
  constructor(container, options = {}) {
    this.container = container;
    this.items = options.items || [];
    this.onItemSelect = options.onItemSelect || (() => {});
    this.showGradients = options.showGradients !== false;
    this.enableArrowNavigation = options.enableArrowNavigation !== false;
    this.displayScrollbar = options.displayScrollbar || false;
    this.selectedIndex = -1;
    this._render();
    this._bindKeys();
  }

  _render() {
    this.container.classList.add('al-wrap');

    this.list = document.createElement('div');
    this.list.classList.add('al-list');
    if (!this.displayScrollbar) this.list.classList.add('al-no-scrollbar');

    this.itemEls = this.items.map((item, i) => {
      const el = document.createElement('div');
      el.classList.add('al-item');
      el.style.setProperty('--i', i);
      el.innerHTML = `
        <span class="al-item__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="al-item__name">${item}</span>
        <span class="al-item__arrow">↗</span>`;
      el.addEventListener('click', () => this._select(i));
      return el;
    });

    this.itemEls.forEach(el => this.list.appendChild(el));
    this.container.appendChild(this.list);

    if (this.showGradients) {
      this._topGrad = Object.assign(document.createElement('div'), { className: 'al-grad al-grad--top' });
      this._botGrad = Object.assign(document.createElement('div'), { className: 'al-grad al-grad--bot' });
      this.container.append(this._topGrad, this._botGrad);
      this.list.addEventListener('scroll', () => this._updateGrads(), { passive: true });
    }

    // Staggered entrance
    requestAnimationFrame(() => {
      this.itemEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('al-item--in'), i * 70);
      });
      setTimeout(() => this._updateGrads(), this.items.length * 70 + 100);
    });
  }

  _select(i) {
    if (i < 0 || i >= this.items.length) return;
    if (this.selectedIndex >= 0) this.itemEls[this.selectedIndex].classList.remove('al-item--selected');
    this.selectedIndex = i;
    this.itemEls[i].classList.add('al-item--selected');
    this.itemEls[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.onItemSelect(this.items[i], i);
  }

  _updateGrads() {
    if (!this._topGrad) return;
    const { scrollTop, scrollHeight, clientHeight } = this.list;
    this._topGrad.style.opacity = scrollTop > 8 ? '1' : '0';
    this._botGrad.style.opacity = scrollTop < scrollHeight - clientHeight - 8 ? '1' : '0';
  }

  _bindKeys() {
    if (!this.enableArrowNavigation) return;
    // Make the list container focusable
    this.container.setAttribute('tabindex', '0');
    // Only capture arrow keys when the list itself is focused — not globally
    this.container.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      this._select(this.selectedIndex + (e.key === 'ArrowDown' ? 1 : -1));
    });
  }
}
