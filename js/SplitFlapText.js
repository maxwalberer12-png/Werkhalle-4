/**
 * ==========================================================================
 * SPLIT FLAP TEXT CONTROLLER (Clean Mechanical Atelier Flap Engine)
 * Direct 3D mechanical tile flip physics with zero character corruption
 * ==========================================================================
 */

(function (global) {
  'use strict';

  const DEFAULT_WORDS = [
    'WERKHALLE 4 ',
    'KUNSTATELIER',
    'WORKSHOPS   ',
    'KULTURRAUM  ',
    'ATELIER LOFT',
    'BAHNAREAL 98'
  ];

  const toCssUnit = value => (typeof value === 'number' ? `${value}px` : value);

  const normalizePhrase = (phrase, width) => {
    const safe = String(phrase ?? '').toUpperCase();
    return safe.padEnd(width, ' ').slice(0, width);
  };

  class SplitFlapTextController {
    constructor(element, options = {}) {
      this.container = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.container) return;

      this.config = {
        words: DEFAULT_WORDS,
        flipDuration: 0.14,
        stagger: 0.04,
        cycleDelay: 3400,
        tileColor: '#141413',
        textColor: '#FAF7F2',
        tileRadius: 6,
        gap: 5,
        fontSize: 44,
        loop: true,
        padTo: 12,
        ...options
      };

      this.rafId = null;
      this.cycleTimer = null;
      this.currentText = '';
      this.phraseIndex = 0;
      this.tiles = [];
      this.isAnimating = false;

      this.init();
    }

    init() {
      const sourceWords = Array.isArray(this.config.words) && this.config.words.length > 0
        ? this.config.words
        : DEFAULT_WORDS;

      const longest = sourceWords.reduce((max, phrase) => Math.max(max, String(phrase).length), 1);
      this.width = Math.max(1, Math.ceil(Number(this.config.padTo) || 0), longest);

      this.normalizedPhrases = sourceWords.map(phrase => normalizePhrase(phrase, this.width));

      this.renderInitialBoard();
      this.bindVisibility();
      this.startCycle();
    }

    renderInitialBoard() {
      const isSmallMobile = window.innerWidth <= 390;
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth <= 1024;

      const dynamicFontSize = isSmallMobile ? 17 : (isMobile ? 22 : (isTablet ? 34 : (this.config.fontSize || 44)));
      const dynamicGap = isMobile ? 2 : (this.config.gap || 5);

      this.container.classList.add('split-flap-text');
      this.container.style.setProperty('--split-flap-tile-color', this.config.tileColor);
      this.container.style.setProperty('--split-flap-text-color', this.config.textColor);
      this.container.style.setProperty('--split-flap-radius', toCssUnit(this.config.tileRadius));
      this.container.style.setProperty('--split-flap-gap', `${dynamicGap}px`);
      this.container.style.setProperty('--split-flap-font-size', `${dynamicFontSize}px`);
      this.container.style.setProperty('--split-flap-flip-duration', `${Math.max(0.06, Number(this.config.flipDuration) || 0.14)}s`);

      // Window resize listener
      window.addEventListener('resize', () => {
        const sm = window.innerWidth <= 390;
        const mob = window.innerWidth <= 768;
        const tab = window.innerWidth <= 1024;
        const fs = sm ? 17 : (mob ? 22 : (tab ? 34 : (this.config.fontSize || 44)));
        const g = mob ? 2 : (this.config.gap || 5);
        this.container.style.setProperty('--split-flap-font-size', `${fs}px`);
        this.container.style.setProperty('--split-flap-gap', `${g}px`);
      }, { passive: true });

      this.container.innerHTML = '';
      this.tiles = [];

      const initialPhrase = this.normalizedPhrases[0] || '';
      this.currentText = initialPhrase;

      for (let i = 0; i < this.width; i += 1) {
        const char = initialPhrase[i] || ' ';
        const tileEl = document.createElement('span');
        tileEl.className = 'split-flap-text__tile';
        tileEl.setAttribute('aria-hidden', 'true');

        const halfTop = document.createElement('span');
        halfTop.className = 'split-flap-text__half split-flap-text__half--top';
        const charTop = document.createElement('span');
        charTop.className = 'split-flap-text__char';
        charTop.textContent = char === ' ' ? '\u00A0' : char;
        halfTop.appendChild(charTop);

        const halfBottom = document.createElement('span');
        halfBottom.className = 'split-flap-text__half split-flap-text__half--bottom';
        const charBottom = document.createElement('span');
        charBottom.className = 'split-flap-text__char';
        charBottom.textContent = char === ' ' ? '\u00A0' : char;
        halfBottom.appendChild(charBottom);

        tileEl.appendChild(halfTop);
        tileEl.appendChild(halfBottom);

        this.container.appendChild(tileEl);

        this.tiles.push({
          element: tileEl,
          charTop,
          charBottom,
          current: char,
          flaps: null
        });
      }
    }

    bindVisibility() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // Snap immediately to clean target word to prevent frozen intermediate states
          this.snapToCurrentPhrase();
        }
      });
    }

    snapToCurrentPhrase() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      const targetPhrase = this.normalizedPhrases[this.phraseIndex] || '';
      this.currentText = targetPhrase;
      this.isAnimating = false;

      for (let i = 0; i < this.width; i += 1) {
        const char = targetPhrase[i] || ' ';
        const tile = this.tiles[i];
        if (!tile) continue;

        tile.current = char;
        tile.charTop.textContent = char === ' ' ? '\u00A0' : char;
        tile.charBottom.textContent = char === ' ' ? '\u00A0' : char;

        if (tile.flaps) {
          tile.flaps.remove();
          tile.flaps = null;
        }
      }
    }

    animateTo(targetPhrase) {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      const fromPhrase = normalizePhrase(this.currentText, this.width);
      const targetChars = targetPhrase.split('');

      const safeFlipMs = Math.max(60, (Number(this.config.flipDuration) || 0.14) * 1000);
      const safeStaggerMs = Math.max(0, (Number(this.config.stagger) || 0.04) * 1000);

      // Build clean 1-to-1 flip plans (fromChar -> targetChar directly, NO random corruption)
      const plans = targetChars
        .map((targetChar, index) => {
          const fromChar = fromPhrase[index] || ' ';
          if (fromChar === targetChar) return null;

          return {
            index,
            from: fromChar,
            target: targetChar,
            start: index * safeStaggerMs,
            flipping: false,
            done: false
          };
        })
        .filter(Boolean);

      if (!plans.length) {
        this.currentText = targetPhrase;
        return 0;
      }

      this.isAnimating = true;
      const totalDuration = plans.reduce(
        (max, plan) => Math.max(max, plan.start + safeFlipMs + 50),
        0
      );

      const startedAt = performance.now();

      const updateTileDOM = (index, fromChar, toChar, flipping) => {
        const tile = this.tiles[index];
        if (!tile) return;

        if (tile.flaps) {
          tile.flaps.remove();
          tile.flaps = null;
        }

        if (flipping) {
          tile.current = fromChar;
          tile.charTop.textContent = fromChar === ' ' ? '\u00A0' : fromChar;
          tile.charBottom.textContent = toChar === ' ' ? '\u00A0' : toChar;

          const wrapper = document.createElement('span');

          const flapFront = document.createElement('span');
          flapFront.className = 'split-flap-text__flap split-flap-text__flap--front';
          const charFront = document.createElement('span');
          charFront.className = 'split-flap-text__char';
          charFront.textContent = fromChar === ' ' ? '\u00A0' : fromChar;
          flapFront.appendChild(charFront);

          const flapBack = document.createElement('span');
          flapBack.className = 'split-flap-text__flap split-flap-text__flap--back';
          const charBack = document.createElement('span');
          charBack.className = 'split-flap-text__char';
          charBack.textContent = toChar === ' ' ? '\u00A0' : toChar;
          flapBack.appendChild(charBack);

          wrapper.appendChild(flapFront);
          wrapper.appendChild(flapBack);

          tile.element.appendChild(wrapper);
          tile.flaps = wrapper;
        } else {
          tile.current = toChar;
          tile.charTop.textContent = toChar === ' ' ? '\u00A0' : toChar;
          tile.charBottom.textContent = toChar === ' ' ? '\u00A0' : toChar;
        }
      };

      const tick = now => {
        const elapsed = now - startedAt;
        let allDone = true;

        plans.forEach(plan => {
          const localElapsed = elapsed - plan.start;

          if (localElapsed < 0) {
            allDone = false;
            return;
          }

          if (localElapsed < safeFlipMs) {
            allDone = false;
            if (!plan.flipping) {
              plan.flipping = true;
              updateTileDOM(plan.index, plan.from, plan.target, true);
            }
          } else if (!plan.done) {
            plan.done = true;
            updateTileDOM(plan.index, plan.target, plan.target, false);
          }
        });

        if (!allDone) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.currentText = targetPhrase;
          this.isAnimating = false;
          this.rafId = null;
          this.snapToCurrentPhrase(); // 100% guarantee of clean final state
        }
      };

      this.rafId = requestAnimationFrame(tick);
      return totalDuration;
    }

    startCycle() {
      if (this.normalizedPhrases.length <= 1) return;

      const scheduleNext = delay => {
        if (this.cycleTimer) clearTimeout(this.cycleTimer);
        this.cycleTimer = window.setTimeout(() => {
          if (document.hidden) {
            scheduleNext(1000);
            return;
          }

          const nextIndex = this.phraseIndex + 1;
          if (nextIndex >= this.normalizedPhrases.length && !this.config.loop) return;

          this.phraseIndex = nextIndex % this.normalizedPhrases.length;
          const animDuration = this.animateTo(this.normalizedPhrases[this.phraseIndex]);
          scheduleNext((this.config.cycleDelay || 3400) + animDuration);
        }, delay);
      };

      scheduleNext(this.config.cycleDelay || 3400);
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      if (this.cycleTimer) clearTimeout(this.cycleTimer);
    }
  }

  global.SplitFlapTextController = SplitFlapTextController;

  global.initSplitFlapText = function (selector = '#hero-split-flap', options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    return new SplitFlapTextController(el, options);
  };
})(window);
