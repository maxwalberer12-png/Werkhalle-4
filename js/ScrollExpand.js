/**
 * ==========================================================================
 * SCROLL EXPAND CONTROLLER (Vanilla JS / React Bits Architecture)
 * Smooth viewport/container-driven frame expansion with lerp smoothing
 * ==========================================================================
 */

(function (global) {
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  };

  class ScrollExpandController {
    constructor(element, options = {}) {
      this.root = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.root) return;

      const isMobile = window.innerWidth < 768;

      this.config = {
        startWidth: isMobile ? 88 : 56,
        startHeight: isMobile ? 58 : 62,
        startRadius: isMobile ? 20 : 24,
        endRadius: 0,
        mediaZoom: 1.35,
        scrollDistance: isMobile ? 1.0 : 1.2,
        holdDistance: isMobile ? 0.2 : 0.35,
        smoothing: isMobile ? 0 : 0.1,
        overlayScrim: 0.52,
        useWindowScroll: true,
        keepTitleOnScroll: false,
        enabled: true,
        ...options
      };

      this.track = this.root.querySelector('.scroll-expand__track');
      this.stage = this.root.querySelector('.scroll-expand__stage');
      this.frame = this.root.querySelector('.scroll-expand__frame');
      this.media = this.root.querySelector('.scroll-expand__media');
      this.title = this.root.querySelector('.scroll-expand__title');
      this.hint = this.root.querySelector('.scroll-expand__hint');
      this.overlay = this.root.querySelector('.scroll-expand__overlay');
      this.scrim = this.root.querySelector('.scroll-expand__scrim');

      this.raf = 0;
      this.current = 0;
      this.target = 0;
      this.stageH = 0;
      this.running = false;

      this.init();
    }

    applyProgress(p) {
      if (!this.frame || !this.media) return;
      const c = this.config;

      const e = smoothstep(0, 1, p);

      const w = c.startWidth + (100 - c.startWidth) * e;
      const h = c.startHeight + (100 - c.startHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const r = c.startRadius + (c.endRadius - c.startRadius) * e;

      this.frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
      this.media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

      if (this.scrim) {
        this.scrim.style.opacity = `${c.overlayScrim * e}`;
      }

      if (this.title) {
        if (c.keepTitleOnScroll) {
          this.title.style.opacity = '1';
          this.title.style.transform = 'translate3d(0, 0, 0)';
        } else {
          const out = smoothstep(0.35, 0.85, p);
          this.title.style.opacity = `${1 - out}`;
          this.title.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.05 * out})`;
        }
      }

      if (this.hint) {
        const gone = smoothstep(0, 0.15, p);
        this.hint.style.opacity = `${1 - gone}`;
        this.hint.style.transform = `translate3d(0, ${10 * gone}px, 0)`;
      }

      if (this.overlay) {
        const inn = smoothstep(0.65, 1, p);
        this.overlay.style.opacity = `${inn}`;
        this.overlay.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
        this.overlay.style.pointerEvents = inn > 0.8 ? 'auto' : 'none';
      }
    }

    measure() {
      const c = this.config;
      const isMobile = window.innerWidth < 768;
      c.startWidth = isMobile ? 88 : 56;
      c.startHeight = isMobile ? 58 : 62;
      c.smoothing = isMobile ? 0 : 0.1;

      this.stageH = c.useWindowScroll ? window.innerHeight : this.root.clientHeight;
      if (this.stageH <= 0) return;

      this.stage.style.height = `${this.stageH}px`;
      this.track.style.height = `${this.stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;

      const w = this.root.clientWidth || this.stageH;
      this.stage.style.setProperty('--se-title-size', `${clamp(w * 0.065, 22, 76)}px`);
    }

    readProgress() {
      const c = this.config;
      if (!c.enabled) return 1;
      const span = this.stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = this.track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(this.root.scrollTop / span, 0, 1);
    }

    tick() {
      const c = this.config;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      this.current += (this.target - this.current) * k;

      if (Math.abs(this.target - this.current) < 0.0004) {
        this.current = this.target;
        this.running = false;
      }

      this.applyProgress(this.current);

      if (this.running) {
        this.raf = requestAnimationFrame(() => this.tick());
      } else {
        this.raf = 0;
      }
    }

    kick() {
      if (this.running) return;
      this.running = true;
      if (!this.raf) {
        this.raf = requestAnimationFrame(() => this.tick());
      }
    }

    init() {
      if (!this.root || !this.track || !this.stage) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const onScroll = () => {
        this.target = this.readProgress();
        if (this.config.smoothing <= 0 || reduceMotion) {
          this.current = this.target;
          this.applyProgress(this.current);
          return;
        }
        this.kick();
      };

      const onResize = () => {
        this.measure();
        this.target = this.readProgress();
        this.current = this.target;
        this.applyProgress(this.current);
      };

      this.measure();
      this.target = this.readProgress();
      this.current = this.target;
      this.applyProgress(this.current);

      const scroller = this.config.useWindowScroll ? window : this.root;
      scroller.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);

      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(onResize);
        this.ro.observe(this.root);
      }

      this.cleanup = () => {
        if (this.raf) cancelAnimationFrame(this.raf);
        scroller.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        if (this.ro) this.ro.disconnect();
      };
    }

    destroy() {
      if (this.cleanup) this.cleanup();
    }
  }

  global.ScrollExpandController = ScrollExpandController;

  global.initScrollExpand = function (selector = '#hero-scroll-expand', options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    return new ScrollExpandController(el, options);
  };
})(window);
