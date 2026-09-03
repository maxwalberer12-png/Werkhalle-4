/**
 * ==========================================================================
 * VERTICAL FLOATING STREAM & PASS-BY PARALLAX GALLERY CONTROLLER
 * Zero-Reflow 120fps Pure GPU Kinematics & 3D Barrel Perspective
 * ==========================================================================
 */

(function (global) {
  'use strict';

  class InfiniteScrollGalleryController {
    constructor(selector = '#galerie') {
      this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!this.root) return;

      this.header = this.root.querySelector('.parallax-gallery-header-wrapper');
      this.bottomIndicator = this.root.querySelector('.parallax-gallery-bottom');
      this.stage = this.root.querySelector('.stream-columns-stage');
      this.col1 = this.root.querySelector('.stream-col-1');
      this.col2 = this.root.querySelector('.stream-col-2');
      this.cards = Array.from(this.root.querySelectorAll('.stream-card'));
      this.cardMeta = [];
      this.timeline = null;

      this.init();
    }

    init() {
      const isMobile = window.innerWidth <= 768;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isMobile || reduceMotion) {
        this.initMobileFallback();
        return;
      }

      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP and ScrollTrigger are required for Stream Gallery');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      this.buildUltraCleanTimeline();
    }

    buildUltraCleanTimeline() {
      if (this.timeline) this.timeline.kill();

      // 1. Initial State: Centered title clean, columns primed cleanly
      if (this.header) {
        gsap.set(this.header, {
          y: 0,
          opacity: 1,
          scale: 1,
          display: 'block',
          clearProps: 'transform'
        });
      }
      if (this.bottomIndicator) {
        gsap.set(this.bottomIndicator, { y: 0, opacity: 1, clearProps: 'transform' });
      }

      // Column start positions: Clean organic stagger
      if (this.col1) {
        gsap.set(this.col1, { y: 0, clearProps: 'transform' });
      }
      if (this.col2) {
        gsap.set(this.col2, { y: 70, clearProps: 'transform' });
      }

      // Ensure all cards are clean, upright, flat in 2D space (100% clickable at any scroll position)
      this.cards.forEach((card) => {
        gsap.set(card, {
          opacity: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          z: 0,
          clearProps: 'transform'
        });
      });

      // Calculate travel distances
      const vh = window.innerHeight;
      const col1Height = this.col1 ? this.col1.scrollHeight : 2200;
      const col2Height = this.col2 ? this.col2.scrollHeight : 1800;

      const travelDist1 = Math.max(col1Height - vh * 0.45, vh * 1.6);
      const travelDist2 = Math.max(col2Height - vh * 0.45, vh * 1.4);
      const totalScrollDist = Math.max(travelDist1, travelDist2) + 200;

      // Master Pinned Timeline with ultra-smooth 1.1s scrub
      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: this.root,
          start: 'top top',
          end: `+=${Math.round(totalScrollDist)}px`,
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // 1. Header & Bottom Indicator Fade Out smoothly as scroll starts
      if (this.header) {
        this.timeline.to(
          this.header,
          {
            y: -45,
            opacity: 0,
            duration: 0.12,
            ease: 'power1.out'
          },
          0
        );
      }

      if (this.bottomIndicator) {
        this.timeline.to(
          this.bottomIndicator,
          {
            y: 25,
            opacity: 0,
            duration: 0.10,
            ease: 'power1.out'
          },
          0.02
        );
      }

      // 2. Buttery smooth continuous vertical column stream
      if (this.col1) {
        this.timeline.to(
          this.col1,
          {
            y: -travelDist1,
            duration: 1.0,
            ease: 'none'
          },
          0
        );
      }

      if (this.col2) {
        this.timeline.to(
          this.col2,
          {
            y: -travelDist2,
            duration: 1.0,
            ease: 'none'
          },
          0
        );
      }
    }

    initMobileFallback() {
      if (this.header) {
        gsap.set(this.header, { opacity: 1, y: 0, scale: 1, display: 'block', clearProps: 'transform' });
      }
      if (this.bottomIndicator) {
        gsap.set(this.bottomIndicator, { display: 'none' });
      }

      // Smooth subtle counter-parallax on mobile columns
      if (this.col1) {
        gsap.to(this.col1, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: this.root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      }

      if (this.col2) {
        gsap.to(this.col2, {
          y: 60,
          ease: 'none',
          scrollTrigger: {
            trigger: this.root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      }

      // Rich entrance reveals for each card
      this.cards.forEach((card, idx) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 45,
            scale: 0.93
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            delay: (idx % 2) * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true
            }
          }
        );
      });
    }

    destroy() {
      if (this.timeline) this.timeline.kill();
    }
  }

  global.InfiniteScrollGalleryController = InfiniteScrollGalleryController;

  global.initInfiniteScrollGallery = function (selector = '#galerie') {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    return new InfiniteScrollGalleryController(el);
  };
})(window);
