/**
 * ==========================================================================
 * SPLIT FLAP TEXT CONTROLLER (Vanilla JS / React Bits Architecture)
 * Mechanical split-flap departure board simulation with 3D flap physics
 * ==========================================================================
 */

(function (global) {
  const DEFAULT_WORDS = ['WERKHALLE 4', 'KUNSTATELIER', 'WORKSHOPS', 'KULTUR RAUM', 'ATELIER LOFT'];

  const CHARSETS = {
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    numeric: '0123456789'
  };

  const toCssUnit = value => (typeof value === 'number' ? `${value}px` : value);

  const resolveCharset = charset => {
    if (CHARSETS[charset]) return CHARSETS[charset];
    return typeof charset === 'string' && charset.length > 0 ? charset : CHARSETS.alphanumeric;
  };

  const normalizePhrase = (phrase, width) => {
    const safe = String(phrase ?? '');
    return safe.padEnd(width, ' ').slice(0, width);
  };

  const sampleChar = charset => charset.charAt(Math.floor(Math.random() * charset.length)) || ' ';

  const buildSequence = (target, flips, charset) => {
    const steps = [];
    for (let i = 0; i < flips; i += 1) {
      steps.push(sampleChar(charset));
    }
    steps.push(target);
    return steps;
  };

  class SplitFlapTextController {
    constructor(element, options = {}) {
      this.container = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.container) return;

      this.config = {
        words: DEFAULT_WORDS,
        flipDuration: 0.12,
        stagger: 0.05,
        cycleDelay: 2600,
        charset: 'alphanumeric',
        flipsPerChar: 6,
        tileColor: '#181816',
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
      this.startCycle();
    }

    renderInitialBoard() {
      this.container.classList.add('split-flap-text');
      this.container.style.setProperty('--split-flap-tile-color', this.config.tileColor);
      this.container.style.setProperty('--split-flap-text-color', this.config.textColor);
      this.container.style.setProperty('--split-flap-radius', toCssUnit(this.config.tileRadius));
      this.container.style.setProperty('--split-flap-gap', toCssUnit(this.config.gap));
      this.container.style.setProperty('--split-flap-font-size', toCssUnit(this.config.fontSize));
      this.container.style.setProperty('--split-flap-flip-duration', `${Math.max(0.04, Number(this.config.flipDuration) || 0.12)}s`);

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
          next: char,
          flaps: null
        });
      }
    }

    animateTo(targetPhrase) {
      const fromPhrase = normalizePhrase(this.currentText, this.width);
      const targetChars = targetPhrase.split('');

      const safeFlipMs = Math.max(40, (Number(this.config.flipDuration) || 0.12) * 1000);
      const safeStaggerMs = Math.max(0, (Number(this.config.stagger) || 0) * 1000);
      const safeFlips = Math.max(0, Math.floor(Number(this.config.flipsPerChar) || 0));
      const activeCharset = resolveCharset(this.config.charset);

      const plans = targetChars
        .map((targetChar, index) => {
          const fromChar = fromPhrase[index] || ' ';
          if (fromChar === targetChar) return null;

          return {
            index,
            from: fromChar,
            target: targetChar,
            sequence: buildSequence(targetChar, safeFlips, activeCharset),
            start: index * safeStaggerMs,
            step: -1,
            done: false
          };
        })
        .filter(Boolean);

      if (!plans.length) {
        this.currentText = targetPhrase;
        return 0;
      }

      const totalDuration = plans.reduce(
        (max, plan) => Math.max(max, plan.start + plan.sequence.length * safeFlipMs),
        0
      );

      const startedAt = performance.now();

      const updateTileDOM = (index, current, next, flipping) => {
        const tile = this.tiles[index];
        if (!tile) return;

        tile.current = current;
        tile.next = next;

        tile.charTop.textContent = current === ' ' ? '\u00A0' : current;
        tile.charBottom.textContent = (flipping ? next : current) === ' ' ? '\u00A0' : (flipping ? next : current);

        if (tile.flaps) {
          tile.flaps.remove();
          tile.flaps = null;
        }

        if (flipping) {
          const flapFrag = document.createDocumentFragment();

          const flapFront = document.createElement('span');
          flapFront.className = 'split-flap-text__flap split-flap-text__flap--front';
          const charFront = document.createElement('span');
          charFront.className = 'split-flap-text__char';
          charFront.textContent = current === ' ' ? '\u00A0' : current;
          flapFront.appendChild(charFront);

          const flapBack = document.createElement('span');
          flapBack.className = 'split-flap-text__flap split-flap-text__flap--back';
          const charBack = document.createElement('span');
          charBack.className = 'split-flap-text__char';
          charBack.textContent = next === ' ' ? '\u00A0' : next;
          flapBack.appendChild(charBack);

          const wrapper = document.createElement('span');
          wrapper.appendChild(flapFront);
          wrapper.appendChild(flapBack);

          tile.element.appendChild(wrapper);
          tile.flaps = wrapper;
        }
      };

      const tick = now => {
        const elapsed = now - startedAt;
        let shouldContinue = false;

        plans.forEach(plan => {
          const localElapsed = elapsed - plan.start;

          if (localElapsed < 0) {
            shouldContinue = true;
            return;
          }

          const step = Math.floor(localElapsed / safeFlipMs);

          if (step < plan.sequence.length) {
            shouldContinue = true;

            if (step !== plan.step) {
              plan.step = step;
              const current = step === 0 ? plan.from : plan.sequence[step - 1];
              const next = plan.sequence[step];
              updateTileDOM(plan.index, current, next, true);
            }
          } else if (!plan.done) {
            plan.done = true;
            updateTileDOM(plan.index, plan.target, plan.target, false);
          }
        });

        if (shouldContinue) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.currentText = targetPhrase;
          this.rafId = null;
        }
      };

      this.rafId = requestAnimationFrame(tick);
      return totalDuration;
    }

    startCycle() {
      if (this.normalizedPhrases.length <= 1) return;

      const scheduleNext = delay => {
        this.cycleTimer = window.setTimeout(() => {
          const nextIndex = this.phraseIndex + 1;

          if (nextIndex >= this.normalizedPhrases.length && !this.config.loop) return;

          this.phraseIndex = nextIndex % this.normalizedPhrases.length;
          const animDuration = this.animateTo(this.normalizedPhrases[this.phraseIndex]);
          scheduleNext((this.config.cycleDelay || 2600) + animDuration);
        }, delay);
      };

      scheduleNext(this.config.cycleDelay || 2600);
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
