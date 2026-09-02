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

      const vh = window.innerHeight;

      // 1. Initial State: Centered title clean, columns primed below
      if (this.header) {
        gsap.set(this.header, {
          y: 0,
          opacity: 1,
          scale: 1,
          display: 'block',
          force3D: true
        });
      }
      if (this.bottomIndicator) {
        gsap.set(this.bottomIndicator, { y: 0, opacity: 1, force3D: true });
      }

      // Column start positions
      const col1StartY = vh * 0.90;
      const col2StartY = vh * 1.05;

      if (this.col1) {
        gsap.set(this.col1, { y: col1StartY, force3D: true });
      }
      if (this.col2) {
        gsap.set(this.col2, { y: col2StartY, force3D: true });
      }

      // Pre-cache static offsets once to completely eliminate layout thrashing during scroll
      this.cardMeta = this.cards.map((card) => {
        gsap.set(card, {
          transformPerspective: 800,
          transformOrigin: 'center center',
          force3D: true,
          willChange: 'transform, opacity'
        });
        const isCol1 = card.closest('.stream-col-1') !== null;
        return {
          el: card,
          top: card.offsetTop,
          height: card.offsetHeight || 380,
          isCol1: isCol1
        };
      });

      // Calculate travel distances
      const col1Height = this.col1 ? this.col1.scrollHeight : 2200;
      const col2Height = this.col2 ? this.col2.scrollHeight : 1800;

      const travelDist1 = col1Height - vh * 0.25;
      const travelDist2 = col2Height - vh * 0.25;
      const totalScrollDist = Math.max(travelDist1, travelDist2) + vh * 0.95;

      // Pure math zero-reflow 3D update
      const updateCardsPureMath = () => {
        const viewportHeight = window.innerHeight;
        const currentY1 = gsap.getProperty(this.col1, 'y') || col1StartY;
        const currentY2 = gsap.getProperty(this.col2, 'y') || col2StartY;

        for (let i = 0; i < this.cardMeta.length; i++) {
          const item = this.cardMeta[i];
          const colY = item.isCol1 ? currentY1 : currentY2;
          const cardAbsCenter = colY + item.top + item.height * 0.5;
          const relY = cardAbsCenter / viewportHeight;

          let rotateX = 0;
          let scale = 1;
          let translateZ = 0;
          let opacity = 1;

          // Bottom Entry Zone (relY > 0.68)
          if (relY > 0.68) {
            const factor = Math.min(Math.max((relY - 0.68) / 0.35, 0), 1);
            rotateX = factor * -15;
            scale = 1 - factor * 0.15;
            translateZ = factor * -80;
            opacity = 1 - factor * 0.30;
          }
          // Top Exit Zone (relY < 0.32)
          else if (relY < 0.32) {
            const factor = Math.min(Math.max((0.32 - relY) / 0.35, 0), 1);
            rotateX = factor * 15;
            scale = 1 - factor * 0.15;
            translateZ = factor * -80;
            opacity = 1 - factor * 0.30;
          }

          gsap.set(item.el, {
            rotateX: rotateX,
            scale: scale,
            z: translateZ,
            opacity: opacity,
            force3D: true
          });
        }
      };

      // Master Pinned Timeline with ultra-smooth 0.8s scrub
      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: this.root,
          start: 'top top',
          end: `+=${Math.round(totalScrollDist)}px`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: updateCardsPureMath
        }
      });

      // ======================================================================
      // 1. SWIFT TITLE FADE (0.00 -> 0.08)
      // ======================================================================
      if (this.header) {
        this.timeline.to(
          this.header,
          {
            opacity: 0,
            scale: 0.95,
            y: -35,
            duration: 0.08,
            ease: 'power1.out'
          },
          0
        );

        this.timeline.set(this.header, { display: 'none' }, 0.09);
      }

      if (this.bottomIndicator) {
        this.timeline.to(
          this.bottomIndicator,
          {
            opacity: 0,
            y: 20,
            duration: 0.06,
            ease: 'power1.out'
          },
          0.01
        );
      }

      // ======================================================================
      // 2. BUTTERY SMOOTH PARALLAX COLUMN STREAM (0.05 -> 1.00)
      // ======================================================================
      if (this.col1) {
        this.timeline.to(
          this.col1,
          {
            y: -travelDist1,
            duration: 0.95,
            ease: 'none',
            force3D: true
          },
          0.05
        );
      }

      if (this.col2) {
        this.timeline.to(
          this.col2,
          {
            y: -travelDist2,
            duration: 0.95,
            ease: 'none',
            force3D: true
          },
          0.05
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
      if (this.col1) gsap.set(this.col1, { y: 0, clearProps: 'transform' });
      if (this.col2) gsap.set(this.col2, { y: 0, clearProps: 'transform' });

      // Animate gallery cards on mobile scroll with clean 2D animations (zero 3D projection overflow)
      this.cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0.82,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 95%',
              end: 'top 70%',
              scrub: 0.6,
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
