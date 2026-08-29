/**
 * ==========================================================================
 * TEXT PRESSURE CONTROLLER (Vanilla JS / React Bits Architecture)
 * Interactive variable font pressure responding to cursor coordinates & distance
 * ==========================================================================
 */

(function (global) {
  const dist = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAttr = (distance, maxDist, minVal, maxVal) => {
    const val = maxVal - Math.abs((maxVal * distance) / maxDist);
    return Math.max(minVal, val + minVal);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  class TextPressureController {
    constructor(element, options = {}) {
      this.container = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.container) return;

      this.config = {
        text: 'WERKHALLE 4',
        fontFamily: 'Roboto Flex',
        width: true,
        weight: true,
        italic: true,
        alpha: false,
        flex: true,
        stroke: false,
        scale: false,
        textColor: '#FFFFFF',
        strokeColor: '#C46D4E',
        minFontSize: 28,
        ...options
      };

      this.chars = this.config.text.split('');
      this.spans = [];
      this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      this.cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      this.rafId = 0;

      this.buildDOM();
      this.initEvents();
      this.setSize();
      this.animate();
    }

    buildDOM() {
      this.container.innerHTML = '';
      this.container.classList.add('text-pressure-container');

      this.titleEl = document.createElement('h1');
      this.titleEl.className = `text-pressure-title ${this.config.flex ? 'text-pressure-flex' : ''} ${this.config.stroke ? 'text-pressure-stroke' : ''}`.trim();
      this.titleEl.style.fontFamily = `'${this.config.fontFamily}', sans-serif`;
      this.titleEl.style.color = this.config.textColor;

      this.chars.forEach((char) => {
        const span = document.createElement('span');
        span.className = 'text-pressure-char';
        span.setAttribute('data-char', char);
        span.textContent = char === ' ' ? '\u00A0' : char;
        this.titleEl.appendChild(span);
        this.spans.push(span);
      });

      this.container.appendChild(this.titleEl);
    }

    setSize() {
      if (!this.container || !this.titleEl) return;
      const rect = this.container.getBoundingClientRect();
      const containerW = rect.width || window.innerWidth * 0.7;

      let newFontSize = containerW / (this.chars.length / 1.7);
      newFontSize = Math.max(newFontSize, this.config.minFontSize);

      this.titleEl.style.fontSize = `${newFontSize}px`;
      this.titleEl.style.lineHeight = '1';
    }

    initEvents() {
      this.handleMouseMove = (e) => {
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;
      };

      this.handleTouchMove = (e) => {
        if (e.touches && e.touches[0]) {
          this.cursor.x = e.touches[0].clientX;
          this.cursor.y = e.touches[0].clientY;
        }
      };

      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: true });

      this.debouncedResize = debounce(() => this.setSize(), 100);
      window.addEventListener('resize', this.debouncedResize);
    }

    animate() {
      this.mouse.x += (this.cursor.x - this.mouse.x) / 15;
      this.mouse.y += (this.cursor.y - this.mouse.y) / 15;

      if (this.titleEl && this.spans.length) {
        const titleRect = this.titleEl.getBoundingClientRect();
        const maxDist = Math.max(titleRect.width / 2, 200);

        this.spans.forEach((span) => {
          if (!span) return;
          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };

          const d = dist(this.mouse, charCenter);

          const wdth = this.config.width ? Math.floor(getAttr(d, maxDist, 25, 151)) : 100;
          const wght = this.config.weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = this.config.italic ? getAttr(d, maxDist, 0, 1) : 0;
          const alphaVal = this.config.alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

          const newSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'slnt' ${-10 * italVal}`;

          if (span.style.fontVariationSettings !== newSettings) {
            span.style.fontVariationSettings = newSettings;
          }
          if (this.config.alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      this.rafId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('resize', this.debouncedResize);
    }
  }

  global.TextPressureController = TextPressureController;

  global.initTextPressure = function (selector = '#hero-text-pressure', options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    return new TextPressureController(el, options);
  };
})(window);
